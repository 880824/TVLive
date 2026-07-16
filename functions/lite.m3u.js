// 路由：/lite.m3u  →  精简版 M3U（仅主频道）
import { handlePlaylist } from './_lib/handlers.js';

export async function onRequest(context) {
  return handlePlaylist(context.request, context.env, context.waitUntil, { kind: 'm3u', lite: true });
}
