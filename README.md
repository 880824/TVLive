# TvLive - IPTV 直播源聚合管理系统（Cloudflare Pages 版）

基于 **Cloudflare Pages Functions** 的 IPTV 直播源聚合管理平台。
本版本（2026-07-17）针对 **免费账户** 重新组织了标准 Pages 目录结构，并对请求频率做了重点优化。

---

## 一、目录结构（标准 Pages 结构）

```
TVLive20260717/
├── functions/                 # Pages Functions：文件即路由（标准 Pages 结构）
│   ├── _lib/                  # 共享业务代码（以下划线开头，不会被当作路由）
│   │   ├── handlers.js        # ★ 核心：认证 / 播放列表(双层缓存) / API 分发 / 代理
│   │   ├── config.js          # KV 配置管理（绑定名 TVLIVE）
│   │   ├── pipeline.js        # 聚合管道
│   │   ├── processor.js       # M3U/TXT 下载与处理
│   │   ├── classifier.js      # 频道分类系统
│   │   ├── utils.js           # 工具函数 + 默认配置（含 400+ 别名映射）
│   │   └── admin.js           # 管理后台 HTML（Vue 3）
│   ├── index.js               # 路由 /            → 完整版 M3U
│   ├── live.m3u.js            # 路由 /live.m3u    → 完整版 M3U
│   ├── live.txt.js            # 路由 /live.txt    → 完整版 TXT
│   ├── lite.m3u.js            # 路由 /lite.m3u    → 精简版 M3U
│   ├── lite.txt.js            # 路由 /lite.txt    → 精简版 TXT
│   ├── config.js              # 路由 /config      → 管理后台
│   ├── config/
│   │   ├── login.js           # 路由 /config/login
│   │   └── api/
│   │       └── [[path]].js    # 路由 /config/api/* → API 统一分发
│   └── proxy/
│       └── m3u8.js            # 路由 /proxy/m3u8  → M3U8 代理
├── public/                    # 静态资源目录（构建输出目录，可放 favicon/robots 等）
├── package.json               # 元数据 + 本地开发脚本（wrangler）
├── wrangler.toml             # 本地开发配置（KV 绑定 + PASSWORD）
├── .gitignore
└── README.md
```

**与原版（`TVLive/`，`_worker.js` 单体）的区别：**

| 维度 | 原版（Workers 单体） | 本版（Pages 标准结构） |
|---|---|---|
| 代码组织 | 单个 `dist/_worker.js`（esbuild 打包） | `functions/` 文件路由 + `_lib/` 共享模块 |
| 构建 | 需 `npm run build` 生成 `_worker.js` | Cloudflare 自动打包 functions，**无需本地构建** |
| 路由 | 代码内 `switch(pathname)` | 文件系统路由（文件名即路径） |
| 免费账户优化 | 仅靠 CDN 1h 缓存 | CDN 1h + **KV 6h 双层缓存** |

---

## 二、免费账户请求频率优化（重点）

免费账户的核心限制：**KV 10 万读/天、1 千写/天、出站请求/CPU 受控**。
原版每次缓存未命中都会「重新抓取全部订阅源 + 读取 5 次 KV 配置」，高频访问极易触发上限。

### 1. 播放列表双层缓存
- **第一层 CDN 边缘缓存**（`caches.default`，1 小时）：同一边缘节点内命中即返回，零后端开销。
- **第二层 KV 预生成缓存**（6 小时）：跨边缘节点共享。首次生成时一次性产出 4 份播放列表
  （m3u/txt × full/lite）+ 1 份元数据（统计/健康/频道数），存入 KV。
- **效果**：最昂贵的「聚合抓取全部订阅源」从「每次 CDN 未命中都执行」降为「每 6 小时最多一次」。
  日常访问几乎全部命中 CDN/KV，出站请求、CPU、KV 读取次数大幅下降。

### 2. 统计/健康读 KV 缓存
- `/config/api/stats`、`/config/api/health` 直接读取上次聚合写入 KV 的元数据，
  不再每次重新抓取全部源做聚合。

### 3. 关于 Cron（重要）
**Cloudflare Pages Functions 免费版不支持 Cron 定时触发器**（这是 Workers 独占能力）。
因此本版**取消了 Cron 依赖**：
- 「每日聚合刷新」改为**按需惰性生成**，由 KV 的 6h TTL 自动保证新鲜度。
- 如需在固定时刻（如每天 04:00）刷新，可用外部免费调度器（cron-job.org、GitHub Actions 等）
  定时 `GET https://你的域名/live.m3u` 一次，触发缓存重建即可。

---

## 三、部署步骤（Cloudflare Pages，推荐 Git 方式）

### 1. 推送到 GitHub
```bash
cd TVLive20260717
git init
git add .
git commit -m "TVLive Pages 标准结构 + 免费账户优化"
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

### 2. Cloudflare Dashboard 连接
1. **Workers & Pages** → **Pages** → **创建应用程序** → **连接到 Git**
2. 选择仓库，构建设置：
   - **构建命令**：**留空**（Pages 自动打包 `functions/`，无需 esbuild）
   - **构建输出目录**：`public`
3. 点击 **保存并部署**

### 3. 绑定 KV 与环境变量
部署完成后：
1. **设置** → **函数** → **KV 命名空间绑定**
   - 变量名称：`TVLIVE`（必须与代码一致）
   - 选择或新建一个 KV 命名空间
2. **设置** → **环境变量**（生产环境）
   - 添加 `PASSWORD`（你的管理后台密码）

> 以后每次 `git push` 到 GitHub，Pages 会自动重新部署。

---

## 四、本地开发

```bash
npm install
# 编辑 wrangler.toml，填入真实的 TVLIVE KV 命名空间 ID 与 PASSWORD
npm run dev          # 等价于 wrangler pages dev public
```
本地访问 `http://localhost:8788`（或终端提示的端口）。

---

## 五、功能概览

### 播放列表输出（4 种格式）
| 路径 | 格式 | 说明 |
|---|---|---|
| `/live.m3u` | M3U | 完整版（主频道 + 地方台） |
| `/live.txt` | TXT | 完整版 |
| `/lite.m3u` | M3U | 精简版（仅主频道） |
| `/lite.txt` | TXT | 精简版 |

### 管理后台 `/config`
汇总概况、订阅管理、频道分类、名称纠错、规则映射、屏蔽过滤、输出设置。
登录认证使用环境变量 `PASSWORD`。

### 其他
- M3U8 代理（`/proxy/m3u8`）解决跨域
- 配置导出/导入/恢复默认
- 全暗黑主题 Vue 3 管理界面

---

## 六、技术栈
- **运行时**：Cloudflare Pages Functions（Workers 运行时）
- **存储**：Cloudflare KV（绑定名 `TVLIVE`）
- **密码**：环境变量 `PASSWORD`
- **前端**：Vue 3 + SortableJS + Tailwind CSS (CDN)
- **输出**：M3U / TXT 双格式

> 注：本版已移除 `_worker.js` 单体与 esbuild 构建步骤，完全采用 Pages 标准 `functions/` 结构。
