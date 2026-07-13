 /**
 * IPTV 直播源聚合管理系统 — Cloudflare Workers 主入口
 * 功能：M3U/TXT 双格式播放列表输出 + 频道分类 + 名称纠错 + 测速 + 管理后台
 */
 
import { getConfig, saveConfig,
 getMainChannels, saveMainChannels, getLocalChannels, saveLocalChannels,
 getBlacklist, saveBlacklist, getWhitelist, saveWhitelist, resetToDefaults,
} from './config.js';
 import { runPipeline, getStatsOnly } from './pipeline.js';
 import { startSpeedtest, processSpeedtestChunk, getSpeedtestProgress,
   cronSpeedtest, checkSourcesHealth } from './speedtest.js';
 import { loginHtml, configHtml } from './admin.js';
 import { isLikelyBrowserRequest } from './utils.js';
 
 // ===================== 认证 =====================
 async function isAuthorized(request, env) {
   const cookie = request.headers.get('Cookie') || '';
   return cookie.includes(`auth_token=${env.PASSWORD}`);
 }
 
 // ===================== 路由分发 =====================
 export default {
   async fetch(request, env, ctx) {
     const url = new URL(request.url);
     const path = url.pathname;
 
     // 管理后台
     if (path === '/config') return handleConfig(request, env);
     if (path === '/config/login') return handleLogin(request, env);
 
     // API（需认证）
     if (path.startsWith('/config/api/')) {
       if (!await isAuthorized(request, env)) {
         return new Response('Unauthorized', { status: 401 });
       }
       return handleApi(request, env, ctx, path, url);
     }
 
     // M3U8 代理
     if (path === '/proxy/m3u8') return handleProxyM3u8(request, env);
 
     // 播放列表输出
     if (path === '/' || path === '/live.m3u' || path === '/live.txt' ||
         path === '/lite.m3u' || path === '/lite.txt') {
       return handlePlaylist(request, env, ctx, path);
     }
 
     return new Response('404 Not Found', { status: 404 });
   },
 
   // Cron 触发器
   async scheduled(event, env, ctx) {
     const cron = event.cron;
     // 每 3 天测速 cron: "0 2 */3 * *"
     if (cron === '0 2 */3 * *') {
       console.log('[CRON] 开始自动测速...');
       await cronSpeedtest(env, ctx);
       console.log('[CRON] 自动测速完成');
     }
     // 每天聚合刷新 cron: "0 20 * * *"
     if (cron === '0 20 * * *') {
       console.log('[CRON] 开始每日聚合刷新...');
       const result = await runPipeline(env);
       console.log(`[CRON] 聚合完成: ${result.channelCount} 频道`);
     }
   }
 };
 
 // ===================== 管理页面 =====================
 async function handleConfig(request, env) {
   if (!env.PASSWORD) {
     return new Response('请先设置 PASSWORD 环境变量', { status: 500 });
   }
   const authorized = await isAuthorized(request, env);
   const html = authorized ? configHtml() : loginHtml();
   return new Response(html, {
     headers: { 'Content-Type': 'text/html; charset=utf-8' }
   });
 }
 
 async function handleLogin(request, env) {
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
 
 // ===================== API 处理器 =====================
 async function handleApi(request, env, ctx, path, url) {
   const method = request.method;
 
   try {
     // ---- 配置 ----
     if (path === '/config/api/get') {
       const config = await getConfig(env);
       return jsonResponse(config);
     }
     if (path === '/config/api/save' && method === 'POST') {
       const data = await request.json();
       await saveConfig(env, data);
       return jsonResponse({ success: true });
     }

     // ---- 恢复默认 ----
     if (path === '/config/api/reset' && method === 'POST') {
       await resetToDefaults(env);
       return jsonResponse({ success: true });
     }
 
     // ---- 统计数据 ----
     if (path === '/config/api/stats') {
       const { stats, sourceHealth } = await getStatsOnly(env);
       return jsonResponse({ stats, health: sourceHealth });
     }
 
     // ---- 健康检测 ----
     if (path === '/config/api/health') {
       const config = await getConfig(env);
       const health = await checkSourcesHealth(config);
       return jsonResponse(health);
     }
 
    // ---- 频道分类 ----
     if (path === '/config/api/channels') {
       const main = await getMainChannels(env);
       const local = await getLocalChannels(env);
       return jsonResponse({ main, local });
     }
     if (path === '/config/api/channels/save' && method === 'POST') {
       const { main, local } = await request.json();
       await saveMainChannels(env, main);
       await saveLocalChannels(env, local);
       return jsonResponse({ success: true });
     }
 
     // ---- 黑白名单 ----
     if (path === '/config/api/blacklist') {
       const list = await getBlacklist(env);
       return jsonResponse(list);
     }
     if (path === '/config/api/blacklist/save' && method === 'POST') {
       const data = await request.json();
       await saveBlacklist(env, data);
       return jsonResponse({ success: true });
     }
     if (path === '/config/api/whitelist') {
       const list = await getWhitelist(env);
       return jsonResponse(list);
     }
     if (path === '/config/api/whitelist/save' && method === 'POST') {
       const data = await request.json();
       await saveWhitelist(env, data);
       return jsonResponse({ success: true });
     }
 
     // ---- 测速 ----
     if (path === '/config/api/speedtest/start' && method === 'POST') {
       const result = await startSpeedtest(request, env, ctx);
       return jsonResponse(result);
     }
     if (path === '/config/api/speedtest/status') {
       const status = await getSpeedtestProgress(env);
       return jsonResponse(status);
     }
     if (path === '/config/api/speedtest/chunk' && method === 'POST') {
       const body = await request.json();
       const result = await processSpeedtestChunk(body, env);
       return jsonResponse(result);
     }
 
     return jsonResponse({ error: 'Not found' }, 404);
   } catch (e) {
     console.error('API Error:', e);
     return jsonResponse({ error: e.message }, 500);
   }
 }
 
 function jsonResponse(data, status = 200) {
   return new Response(JSON.stringify(data), {
     status,
     headers: { 'Content-Type': 'application/json' }
   });
 }
 
 // ===================== 播放列表处理器 =====================
 async function handlePlaylist(request, env, ctx, path) {
   if (request.method !== 'GET' && request.method !== 'HEAD') {
     return new Response('Method Not Allowed', { status: 405 });
   }
 
   const isBrowser = isLikelyBrowserRequest(request);
   const cacheKey = new Request(request.url, { method: 'GET', headers: request.headers });
   const cache = caches.default;
 
   // 检查缓存
   const cached = await cache.match(cacheKey);
   if (cached) {
     if (request.method === 'HEAD') return new Response(null, { status: cached.status, headers: cached.headers });
     return cached;
   }
 
   // 执行聚合
   const result = await runPipeline(env);
 
   // 根据路径选择输出
   let content, contentType;
   const isTxt = path.endsWith('.txt');
   const isLite = path.startsWith('/lite');
 
   if (isTxt) {
     content = isLite ? result.txt_lite : result.txt_full;
     contentType = 'text/plain; charset=utf-8';
   } else {
     content = isLite ? result.m3u_lite : result.m3u_full;
     contentType = isBrowser
       ? 'text/plain; charset=utf-8'
       : 'application/vnd.apple.mpegurl; charset=utf-8';
   }
 
   const headers = {
     'Content-Type': contentType,
     'Content-Disposition': `inline; filename="${path.replace('/', '')}"`,
     'Access-Control-Allow-Origin': '*',
     'Cache-Control': 'public, max-age=3600',
     'X-Content-Type-Options': 'nosniff'
   };
 
   const response = new Response(content, { headers });
 
   // 缓存（异步）
   ctx.waitUntil(cache.put(cacheKey, response.clone()));
 
   if (request.method === 'HEAD') return new Response(null, { headers });
   return response;
 }
 
 // ===================== M3U8 代理 =====================
 async function handleProxyM3u8(request, env) {
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
