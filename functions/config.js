// 路由：/config  →  管理后台（登录页 / 控制台）
import { handleConfig } from './_lib/handlers.js';

export async function onRequest(context) {
  return handleConfig(context.request, context.env);
}
