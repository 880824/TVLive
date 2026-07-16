// 路由：/config/login  →  登录提交
import { handleLogin } from './_lib/handlers.js';

export async function onRequest(context) {
  return handleLogin(context.request, context.env);
}
