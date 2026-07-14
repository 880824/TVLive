 /**
 * 测速系统
 * 设计原则：分片自调用适配 Cloudflare Free 计划的 10ms CPU 限制
 * 每个子请求只测 3-5 个 URL 的 HEAD，远低于限制
 */
 
import {
  getConfig, saveBlacklist, saveWhitelist, getBlacklist, getWhitelist,
  saveSpeedtestStatus, getSpeedtestStatus, saveListMeta, getListMeta, appendLog
} from './config.js';
 
 const CHUNK_SIZE = 5;  // 每片 5 个 URL
 
 /**
  * 开始测速（从 KV 获取待测 URL 列表，分片）
  * 返回分片列表供自调用
  */
export async function startSpeedtest(request, env, ctx) {
  // 防止重复/卡死的测速任务叠加：若已有进行中且未超过超时阈值，则拒绝启动
  try {
    const prev = await getSpeedtestStatus(env);
    if (prev && prev.running) {
      const runningMs = Date.now() - (prev.startTime || 0);
      if (runningMs < 30 * 60 * 1000) {
        return { running: true, message: '已有测速任务进行中，请等待其完成（或 30 分钟后可自动重测）' };
      }
    }
  } catch (e) { /* ignore */ }
  const config = await getConfig(env);
   const existingBlacklist = await getBlacklist(env);
   const existingWhitelist = await getWhitelist(env);
   const blacklistSet = new Set(existingBlacklist.map(u => typeof u === 'string' ? u : u.url));
 
   // 收集所有待测 URL（从订阅源中提取）
   // 实际场景中我们测试当前黑名单外的所有已知 URL
   // 这里从配置中的远程源列表收集
   const allUrls = [];
   const activeSources = (config.m3uList || []).filter(s => s.enabled !== false);
 
   for (const source of activeSources) {
     try {
       const res = await fetch(source.url, {
         headers: { 'User-Agent': source.ua || 'okhttp/3.8.1' }
       });
       if (!res.ok) continue;
       const text = await res.text();
       const urlMatches = text.match(/https?:\/\/[^\s"',]+/g) || [];
       for (const url of urlMatches) {
         if (!blacklistSet.has(url)) allUrls.push(url);
       }
     } catch (e) { /* skip source */ }
   }
 
   // 去重
   const uniqueUrls = [...new Set(allUrls)];

  // 保存测速状态（含分片数据，供链式自调用逐片读取）
  const total = uniqueUrls.length;
  const chunks = [];
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    chunks.push(uniqueUrls.slice(i, i + CHUNK_SIZE));
  }
  const threshold = config.responseTimeThreshold || 2000;

  const status = {
    running: true,
    total,
    completed: 0,
    passed: 0,
    failed: 0,
    startTime: Date.now(),
    chunks: chunks.length,
    chunkCount: chunks.length,
    chunkUrls: chunks,
    threshold,
    currentChunk: 0,
    results: { whitelist: [...existingWhitelist], blacklist: [...existingBlacklist] }
  };
  await saveSpeedtestStatus(env, status);

  // 链式自调用：只触发第 0 片，后续每片处理完再由 chunk 路由触发下一片。
  // 任意时刻只有 1 个自调用在飞，彻底规避 Cloudflare 单请求子请求数量/并发上限，
  // 避免一次性并发几十~上百个分片自调用被平台静默丢弃（表现为进度条卡在某处分片不动）。
  const baseUrl = new URL(request.url);
  const selfUrl = `${baseUrl.origin}/config/api/speedtest/chunk`;
  // 自调用必须带管理员登录 Cookie，否则被 /config/api/* 鉴权拦截（401）。
  const authCookie = env.PASSWORD ? `auth_token=${env.PASSWORD}` : '';
  const fire0 = () => fetch(selfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Init': 'speedtest',
      ...(authCookie ? { 'Cookie': authCookie } : {})
    },
    body: JSON.stringify({ chunkIndex: 0, threshold })
  });
  // 触发失败自动重试一次，确保第 0 片一定启动
  ctx.waitUntil(fire0().catch(() => new Promise(r => setTimeout(r, 1000)).then(() => fire0()).catch(() => {})));

  return {
    total,
    chunks: chunks.length,
    message: `测速已启动，共 ${total} 个 URL，分为 ${chunks.length} 片依次处理`
  };
 }
 
 /**
  * 处理单个测速分片（自调用入口）
  */
export async function processSpeedtestChunk(body, env) {
  const { chunkIndex } = body;
  const status = await getSpeedtestStatus(env);
  // 任务已结束（被取消/已完成/超时重测）则跳过本片
  if (!status || !status.running) {
    return { chunkIndex, passed: 0, failed: 0, nextIndex: chunkIndex + 1, chunkCount: status ? status.chunkCount : 0, threshold: body.threshold };
  }
  // 分片 URL 从启动时保存的 chunkUrls 读取（避免一次性把所有分片塞进请求体）
  const urls = (status.chunkUrls && status.chunkUrls[chunkIndex]) || body.urls || [];
  const thresholdMs = body.threshold || status.threshold || 2000;

  const results = { passed: [], failed: [] };

  for (const url of urls) {
    try {
      const start = Date.now();
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(id);
      const elapsed = Date.now() - start;

      if (res && res.ok && elapsed < thresholdMs) {
        results.passed.push({ url, time: elapsed });
      } else {
        results.failed.push({ url, time: elapsed, reason: !res ? 'timeout' : `status_${res.status}` });
      }
    } catch (e) {
      results.failed.push({ url, time: -1, reason: 'error' });
    }
  }

  // 更新 KV 中的结果
  await updateSpeedtestResults(env, results);
  const chunkCount = status.chunkCount || 0;
  return { chunkIndex, passed: results.passed.length, failed: results.failed.length, nextIndex: chunkIndex + 1, chunkCount, threshold: thresholdMs };
}
 
 /**
  * 更新测速进度和结果到 KV
  */
 async function updateSpeedtestResults(env, results) {
   const status = await getSpeedtestStatus(env);
   if (!status || !status.running) return;
 
   status.completed += results.passed.length + results.failed.length;
   status.passed += results.passed.length;
   status.failed += results.failed.length;
   status.currentChunk += 1;
 
   // 合并结果
   for (const p of results.passed) {
     status.results.whitelist.push({ url: p.url, time: p.time, source: 'auto', addedAt: Date.now() });
   }
   for (const f of results.failed) {
     status.results.blacklist.push({ url: f.url, reason: f.reason, source: 'auto', addedAt: Date.now() });
   }
 
   if (status.completed >= status.total) {
    status.running = false;
    status.endTime = Date.now();
   // 保存最终黑白名单到 KV
   await saveWhitelist(env, status.results.whitelist);
   await saveBlacklist(env, status.results.blacklist);
   // 记录黑白名单生成时间 + 最新测速时间（持久化到 list_meta，刷新后依然可见）
   try {
     const meta = await getListMeta(env);
     const now = new Date().toLocaleString('zh-CN');
     meta.blacklist = now; meta.whitelist = now; meta.lastSpeedtest = now;
     await saveListMeta(env, meta);
   } catch (e) { console.error('save list meta error:', e); }
   // 记录手动测速完成日志（此处为"一键测速"分片处理路径，归属 manual）
   try { await appendLog(env, { type: 'manual', action: '测速完成', detail: '通过 ' + status.passed + ' / 失败 ' + status.failed }); } catch (e) { console.error('log error:', e); }
  }
 
   await saveSpeedtestStatus(env, status);
 }
 
 /** 获取测速进度 */
 export async function getSpeedtestProgress(env) {
   const status = await getSpeedtestStatus(env);
   if (!status) return { running: false, message: '暂无测速记录' };
   return {
     running: status.running,
     total: status.total,
     completed: status.completed,
     passed: status.passed,
     failed: status.failed,
     progress: status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0,
     startTime: status.startTime,
     endTime: status.endTime,
     chunks: status.chunks,
     currentChunk: status.currentChunk
   };
 }
 
 /** 在 Cron 触发时自动执行测速 */
 export async function cronSpeedtest(env, ctx) {
   const config = await getConfig(env);
   // 检查上次测速时间，避免重复执行
   const status = await getSpeedtestStatus(env);
   if (status && status.running) return; // 已有测速在运行
 
   // 简单方式：直接测试所有订阅源的可用性
   const activeSources = (config.m3uList || []).filter(s => s.enabled !== false);
   const existingBlacklist = await getBlacklist(env);
   const blacklistSet = new Set(existingBlacklist.map(u => typeof u === 'string' ? u : u.url));
   const passed = [];
   const failed = [];
 
   for (const source of activeSources) {
     try {
       const start = Date.now();
       const controller = new AbortController();
       const id = setTimeout(() => controller.abort(), 10000);
       const res = await fetch(source.url, {
         signal: controller.signal,
         headers: { 'User-Agent': config.userAgent || 'Mozilla/5.0' }
       });
       clearTimeout(id);
       const elapsed = Date.now() - start;

       if (res && res.ok) {
         passed.push({ url: source.url, time: elapsed, source: 'auto', sourceName: source.name });
       } else if (!blacklistSet.has(source.url)) {
         failed.push({ url: source.url, reason: `status_${res ? res.status : 0}`, source: 'auto' });
       }
     } catch (e) {
       if (!blacklistSet.has(source.url)) {
         failed.push({ url: source.url, reason: 'timeout', source: 'auto' });
       }
     }
   }
 
   // 保存结果
   const whitelist = await getWhitelist(env);
   const blacklist = await getBlacklist(env);
  await saveWhitelist(env, [...whitelist, ...passed]);
 await saveBlacklist(env, [...blacklist, ...failed]);
 // 记录黑白名单生成时间 + 最新测速时间（持久化到 list_meta，刷新后依然可见）
 try {
   const meta = await getListMeta(env);
   const now = new Date().toLocaleString('zh-CN');
   meta.blacklist = now; meta.whitelist = now; meta.lastSpeedtest = now;
   await saveListMeta(env, meta);
 } catch (e) { console.error('save list meta error:', e); }
 // 记录自动测速完成日志
 try { ctx.waitUntil(appendLog(env, { type: 'auto', action: '自动测速', detail: '通过 ' + passed.length + ' / 失败 ' + failed.length }, ctx).catch(() => {})); } catch (e) { console.error('log error:', e); }
}
 
/** 健康检测：检查所有订阅源的可达性 */
 export async function checkSourcesHealth(config) {
   const health = {};
   const activeSources = (config.m3uList || []).filter(s => s.enabled !== false);
   for (const source of activeSources) {
     try {
       const start = Date.now();
       const controller = new AbortController();
       const id = setTimeout(() => controller.abort(), 8000);
       const res = await fetch(source.url, {
         signal: controller.signal,
         headers: { 'User-Agent': source.ua || 'okhttp/3.8.1' }
       });
       clearTimeout(id);
       const elapsed = Date.now() - start;
       health[source.name] = {
         ok: res && res.ok,
         status: res ? res.status : 0,
         time: elapsed
       };
     } catch (e) {
       health[source.name] = { ok: false, status: 0, time: -1 };
     }
   }
   return health;
 }
