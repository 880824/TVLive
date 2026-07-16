// 路由：/config/api/*  →  API 统一分发（认证在 handleApi 内校验）
import { handleApi } from '../../_lib/handlers.js';

export async function onRequest(context) {
  return handleApi(context);
}
