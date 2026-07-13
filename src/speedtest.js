 /**
 * 测速系统
 * 设计原则：分片自调用适配 Cloudflare Free 计划的 10ms CPU 限制
 * 每个子请求只测 3-5 个 URL 的 HEAD，远低于限制
 */
 
 import {
   getConfig, saveBlacklist, saveWhitelist, getBlacklist, getWhitelist,
   saveSpeedtestStatus, getSpeedtestStatus
 } from './config.js';
 
 const CHUNK_SIZE = 5;  // 每片 5 个 URL
 
 /**
  * 开始测速（从 KV 获取待测 URL 列表，分片）
  * 返回分片列表供自调用
  */
 export async function startSpeedtest(request, env, ctx) {
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

   // 保存测速状态
   const total = uniqueUrls.length;
   const chunks = [];
   for (let i = 0; i < total; i += CHUNK_SIZE) {
     chunks.push(uniqueUrls.slice(i, i + CHUNK_SIZE));
   }
 
   const status = {
     running: true,
     total,
     completed: 0,
     passed: 0,
     failed: 0,
     startTime: Date.now(),
     chunks: chunks.length,
     currentChunk: 0,
     results: { whitelist: [...existingWhitelist], blacklist: [...existingBlacklist] }
   };
   await saveSpeedtestStatus(env, status);
 
   // 触发自调用处理每个分片
   const baseUrl = new URL(request.url);
   const selfUrl = `${baseUrl.origin}/config/api/speedtest/chunk`;
   const threshold = config.responseTimeThreshold || 2000;
 
   for (let i = 0; i < chunks.length; i++) {
     ctx.waitUntil(
       fetch(selfUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'X-Auth-Init': 'speedtest' },
         body: JSON.stringify({ chunkIndex: i, urls: chunks[i], threshold })
       }).catch(() => {})
     );
   }
 
   return {
     total,
     chunks: chunks.length,
     message: `测速已启动，共 ${total} 个 URL，分为 ${chunks.length} 片处理`
   };
 }
 
 /**
  * 处理单个测速分片（自调用入口）
  */
 export async function processSpeedtestChunk(body, env) {
   const { chunkIndex, urls, threshold } = body;
   const results = { passed: [], failed: [] };
   const thresholdMs = threshold || 2000;
 
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
   return { chunkIndex, passed: results.passed.length, failed: results.failed.length };
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
