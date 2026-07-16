// 路由：/live.txt  →  完整版 TXT
import { handlePlaylist } from './_lib/handlers.js';

export async function onRequest(context) {
  return handlePlaylist(context.request, context.env, context.waitUntil, { kind: 'txt', lite: false });
}
