// 路由：/  →  完整版 M3U（默认）
import { handlePlaylist } from './_lib/handlers.js';

export async function onRequest(context) {
  return handlePlaylist(context.request, context.env, context.waitUntil, { kind: 'm3u', lite: false });
}
