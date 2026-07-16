# TVLive → Cloudflare Pages 标准结构重构总结

**产物目录**：`TVLive20260717/`（已通过语法 + 打包校验）

## 做了什么
把原 `TVLive/`（`_worker.js` 单体 + esbuild 构建）改造成 **Cloudflare Pages Functions 标准结构**，并针对**免费账户**做了请求频率优化。

## 结构变化
| 原版 | 新版 |
|---|---|
| `src/*.js` + esbuild → `dist/_worker.js` | `functions/` 文件路由 + `functions/_lib/` 共享模块 |
| 代码内 `switch(pathname)` 路由 | 文件系统路由（文件名即路径） |
| 需本地构建 | Cloudflare 自动打包，**构建命令留空** |

路由映射：`index.js`→`/`，`live.m3u.js`/`live.txt.js`/`lite.m3u.js`/`lite.txt.js` 对应四种播放列表，`config.js`→`/config`，`config/login.js`→`/config/login`，`config/api/[[path]].js`→`/config/api/*` 统一分发，`proxy/m3u8.js`→`/proxy/m3u8`。

## 免费账户 2 项优化（核心）
1. **播放列表双层缓存**（handlers.js `handlePlaylist`）：CDN 1h + KV 6h。两层都未命中才重新聚合抓取全部订阅源 → 最贵操作从「每次缓存未命中」降到「每 6 小时最多一次」。
2. **stats/health 读 KV 缓存**：不再每次重新抓取全部源做聚合。

## ⚠️ 重要约束
**Pages Functions 免费版不支持 Cron 定时触发器**（Workers 独占）。原版依赖的「每日聚合」Cron 已取消：
- 聚合改为**按需惰性生成**，KV 6h TTL 自动保证新鲜度；
- 需用固定时刻刷新时，用外部免费调度器（cron-job.org / GitHub Actions）定时 `GET https://域名/live.m3u` 触发重建。

## 部署（Cloudflare Pages）
1. 推送 `TVLive20260717` 到 GitHub；
2. Dashboard → Pages → 连接 Git，构建命令**留空**、输出目录 `public`；
3. 绑定 KV 命名空间（变量名 `TVLIVE`）+ 环境变量 `PASSWORD`。

## 校验结果
- `node --check` 全部通过；
- esbuild 打包 4 个路由入口均成功（import 链路完整、导出齐全）；
- `config.js`（含最大后台 HTML）minify 后 **~55 KB**，远低于免费 ~1 MB 脚本上限。
