 /**
 * 核心 Handler 层 —— 所有路由的共享业务逻辑
 *
 * 部署形态：Cloudflare Pages Functions（functions/ 文件路由）
 * 免费账户优化要点（2026-07-17 重构）：
 *  1. 播放列表「双层缓存」：CDN 缓存(caches.default, 1h) + KV 缓存(6h)。
 *     仅在两类缓存同时失效时才重新聚合（抓取全部订阅源），把最贵的
 *     "每次缓存未命中都去抓所有源" 变成 "每天仅几次"，显著降低：
 *       - 出站订阅源抓取次数（免费账户出站请求/CPU 压力）
 *       - KV 配置读取次数（getConfig 等，10万读/天 额度）
 *  2. 统计/健康数据直接从 KV 缓存元数据读取，不再每次重新聚合。
 *
 * Pages Functions 不支持 Cron 定时触发器，因此「每日聚合」改为按需惰性生成，
 * 由 KV TTL 保证新鲜度；如需固定时刻刷新，可用外部调度器（如 cron-job.org）
 * 定时 GET 一次 /live.m3u 触发重建（参见 README）。
 */

import {
  getConfig, saveConfig,
  getMainChannels, saveMainChannels, getLocalChannels, saveLocalChannels,
  resetToDefaults, appendLog, getLogs
} from './config.js';
import { runPipeline, getStatsOnly } from './pipeline.js';
import { loginHtml, configHtml } from './admin.js';
import { isLikelyBrowserRequest } from './utils.js';

// ===================== 缓存键 & 时长 =====================
// 预生成的 4 份播放列表 + 1 份元数据（统计/健康/频道数）统一存 KV
const KV_KEY = {
  m3u_full: 'pl:m3u:full',
  txt_full: 'pl:txt:full',
  m3u_lite: 'pl:m3u:lite',
  txt_lite: 'pl:txt:lite',
  meta:     'pl:meta'        // JSON: { stats, sourceHealth, channelCount, ts }
};
const OUTPUT_TTL = 21600;   // KV 预生成产物 TTL：6 小时（秒）
const CDN_MAX_AGE = 3600;   // CDN 边缘缓存：1 小时（秒）

// ===================== 认证 =====================
async function isAuthorized(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  return cookie.includes(`auth_token=${env.PASSWORD}`);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ===================== 播放列表（带双层缓存） =====================
/**
 * 统一的播放列表处理器。
 * @param {Request} request
 * @param {object}  env
 * @param {function} waitUntil  Pages Functions context.waitUntil
 * @param {{kind:'m3u'|'txt', lite:boolean}} format
 */
export async function handlePlaylist(request, env, waitUntil, format) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const isBrowser = isLikelyBrowserRequest(request);
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });

  // 1) CDN 边缘缓存（共享、最快，1h）
  const cached = await cache.match(cacheKey);
  if (cached) {
    if (request.method === 'HEAD') return new Response(null, { status: cached.status, headers: cached.headers });
    return cached;
  }

  // 2) KV 预生成缓存（跨边缘节点、6h）
  const contentKey = format.kind === 'txt'
    ? (format.lite ? KV_KEY.txt_lite : KV_KEY.txt_full)
    : (format.lite ? KV_KEY.m3u_lite : KV_KEY.m3u_full);
  let content = await env.TVLIVE.get(contentKey);

  // 3) 两层都未命中 → 重新聚合并写入 KV（一次性生成全部 4 份 + 元数据）
  if (content === null) {
    const result = await runPipeline(env);
    await Promise.all([
      env.TVLIVE.put(KV_KEY.m3u_full, result.m3u_full, { expirationTtl: OUTPUT_TTL }),
      env.TVLIVE.put(KV_KEY.txt_full, result.txt_full, { expirationTtl: OUTPUT_TTL }),
      env.TVLIVE.put(KV_KEY.m3u_lite, result.m3u_lite, { expirationTtl: OUTPUT_TTL }),
      env.TVLIVE.put(KV_KEY.txt_lite, result.txt_lite, { expirationTtl: OUTPUT_TTL }),
      env.TVLIVE.put(KV_KEY.meta, JSON.stringify({
        stats: result.stats,
        sourceHealth: result.sourceHealth,
        channelCount: result.channelCount,
        ts: result.timeStr
      }), { expirationTtl: OUTPUT_TTL })
    ]);
    content = format.kind === 'txt'
      ? (format.lite ? result.txt_lite : result.txt_full)
      : (format.lite ? result.m3u_lite : result.m3u_full);
  }

  const contentType = format.kind === 'txt'
    ? 'text/plain; charset=utf-8'
    : (isBrowser
        ? 'text/plain; charset=utf-8'
        : 'application/vnd.apple.mpegurl; charset=utf-8');

  const headers = {
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${format.lite ? 'lite' : 'live'}.${format.kind}"`,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': `public, max-age=${CDN_MAX_AGE}`,
    'X-Content-Type-Options': 'nosniff'
  };

  const response = new Response(content, { headers });
  // 回填 CDN 缓存（异步，不阻塞响应）
  waitUntil(cache.put(cacheKey, response.clone()));

  if (request.method === 'HEAD') return new Response(null, { headers });
  return response;
}

// ===================== 管理页面 =====================
export async function handleConfig(request, env) {
  if (!env.PASSWORD) {
    return new Response('请先设置 PASSWORD 环境变量', { status: 500 });
  }
  const authorized = await isAuthorized(request, env);
  const html = authorized ? configHtml() : loginHtml();
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function handleLogin(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const form = await request.formData();
    const password = form.get('password');
    if (password === env.PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          'Set-Cookie': `auth_token=${env.PASSWORD}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict`,
          'Location': '/config'
        }
      });
    }
  } catch (e) { /* fall through */ }
  return new Response('密码错误', { status: 403 });
}

// ===================== 统计 / 健康（读 KV 缓存，避免重复聚合） =====================
export async function handleStats(env) {
  try {
    const metaRaw = await env.TVLIVE.get(KV_KEY.meta);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      return jsonResponse({ stats: meta.stats || {}, health: meta.sourceHealth || {} });
    }
  } catch (e) { /* 解析失败则走下方实时聚合 */ }

  // 缓存缺失：实时聚合一次（会顺带刷新 KV 缓存）
  const { stats, sourceHealth } = await getStatsOnly(env);
  return jsonResponse({ stats, health: sourceHealth });
}

export async function handleHealth(request, env) {
  // 仅返回最近一次聚合缓存中的健康数据（来自正常聚合时的测量，不额外发请求）
  try {
    const metaRaw = await env.TVLIVE.get(KV_KEY.meta);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      if (meta.sourceHealth) return jsonResponse(meta.sourceHealth);
    }
  } catch (e) { /* ignore */ }
  return jsonResponse({});
}

// ===================== API 分发 =====================
/**
 * Pages Functions 中 /config/api/* 由 functions/config/api/[[path]].js 统一接管，
 * params.path 是路径段数组（如 ['channels','save']），这里负责 method + 子路径分发。
 */
export async function handleApi(context) {
  const { request, env, waitUntil } = context;
  const method = request.method;
  // params.path 可能是字符串（单段）或数组（多段），统一成 "a/b" 形式
  let segs = context.params && context.params.path;
  if (typeof segs === 'string') segs = [segs];
  if (!Array.isArray(segs)) segs = [];
  const sub = segs.join('/'); // e.g. "get" / "channels/save"

  // 所有 API 需要认证
  if (!await isAuthorized(request, env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // ---- 配置 ----
    if (sub === 'get') {
      const config = await getConfig(env);
      return jsonResponse(config);
    }
    if (sub === 'save' && method === 'POST') {
      const data = await request.json();
      await saveConfig(env, data);
      waitUntil(appendLog(env, { type: 'manual', action: '保存配置' }, waitUntil).catch(() => {}));
      return jsonResponse({ success: true });
    }

    // ---- 恢复默认 ----
    if (sub === 'reset' && method === 'POST') {
      await resetToDefaults(env);
      waitUntil(appendLog(env, { type: 'manual', action: '恢复默认配置' }, waitUntil).catch(() => {}));
      return jsonResponse({ success: true });
    }

    // ---- 统计数据（读 KV 缓存） ----
    if (sub === 'stats') {
      return handleStats(env);
    }

    // ---- 健康检测（读 KV 缓存优先） ----
    if (sub === 'health') {
      return handleHealth(request, env);
    }

    // ---- 频道分类 ----
    if (sub === 'channels') {
      const main = await getMainChannels(env);
      const local = await getLocalChannels(env);
      return jsonResponse({ main, local });
    }
    if (sub === 'channels/save' && method === 'POST') {
      const { main, local } = await request.json();
      await saveMainChannels(env, main);
      await saveLocalChannels(env, local);
      waitUntil(appendLog(env, { type: 'manual', action: '保存频道分类' }, waitUntil).catch(() => {}));
      return jsonResponse({ success: true });
    }

    // ---- 操作日志 ----
    if (sub === 'logs') {
      const logs = await getLogs(env);
      return jsonResponse(logs);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  } catch (e) {
    console.error('API Error:', e);
    return jsonResponse({ error: e.message }, 500);
  }
}

// ===================== M3U8 代理 =====================
export async function handleProxyM3u8(request, env) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) return new Response('Missing url 参数', { status: 400 });

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });

    if (!res.ok) return new Response('上游请求失败', { status: 502 });

    let text = await res.text();
    const proxyBase = url.origin + '/proxy/m3u8?url=';
    text = text.replace(/(https?:\/\/[^\s"',]+\.m3u8[^\s"',]*)/g, (match) => {
      return proxyBase + encodeURIComponent(match);
    });

    return new Response(text, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (e) {
    return new Response('代理请求失败: ' + e.message, { status: 500 });
  }
}

// 预留：若日后通过 Workers 部署（支持 Cron），可从此入口触发定时任务
export async function handleScheduled(cron, env, ctx) {
  // Cron 触发器仅在 Worker 部署时生效；Pages Functions 免费版不支持 Cron。
  if (cron === '0 20 * * *') {
    const result = await runPipeline(env);
    ctx.waitUntil(appendLog(env, { type: 'auto', action: '每日聚合刷新', detail: (result.channelCount || 0) + ' 频道' }, ctx).catch(() => {}));
  }
}
