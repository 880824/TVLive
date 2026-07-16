// 路由：/proxy/m3u8  →  M3U8 代理（解决 CORS 跨域）
import { handleProxyM3u8 } from '../_lib/handlers.js';

export async function onRequest(context) {
  return handleProxyM3u8(context.request, context.env);
}
