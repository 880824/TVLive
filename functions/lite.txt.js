// 路由：/lite.txt  →  精简版 TXT（仅主频道）
import { handlePlaylist } from './_lib/handlers.js';

export async function onRequest(context) {
  return handlePlaylist(context.request, context.env, context.waitUntil, { kind: 'txt', lite: true });
}
