# TvLive - IPTV 直播源聚合管理系统

基于 Cloudflare Workers / Pages 的一站式 IPTV 直播源聚合管理平台。

## 功能概览

### 播放列表输出（4 种格式）
| 路径 | 格式 | 说明 |
|---|---|---|
| `/live.m3u` | M3U | 完整版（主频道 + 地方台） |
| `/live.txt` | TXT | 完整版 Txt 格式 |
| `/lite.m3u` | M3U | 精简版（仅主频道） |
| `/lite.txt` | TXT | 精简版 Txt 格式 |

### 管理后台
| 页面 | 功能 |
|---|---|
| 汇总概况 | 播放列表地址、频道分组统计与排序、配置导入导出 |
| 订阅管理 | EPG 配置、订阅源 CRUD、多路线开关、单频道上限、健康检测 |
| 频道分类 | 主频道 24 个分类 + 地方台 30 个分类的结构化管理 |
| 名称纠错 | 400+ 别名→标准名映射规则管理、批量导入 |
| 规则映射 | 分组映射、名称标准化规则 |
| 屏蔽过滤 | 分组屏蔽、关键词屏蔽、字符删除、REMOVAL_LIST、URL 替换 |
| 黑白名单 | 自动/手动黑白名单管理 |
| 测速中心 | 一键手动测速、自动 Cron 测速、源健康检测 |
| 输出设置 | Logo 模板 + 开关、EPG 开关、精简版分类范围、User-Agent 配置 |

### 自动任务
| Trigger | 频率 | 说明 |
|---|---|---|
| 自动测速 | 每 3 天 10:00 (北京) | 检测所有订阅源可达性，自动更新黑白名单 |
| 聚合刷新 | 每天 04:00 (北京) | 重新拉取所有订阅源，刷新缓存 |

### 额外功能
- M3U8 代理（解决 CORS 跨域限制）
- 登录认证（环境变量 `PASSWORD`）
- 配置导出/导入/恢复默认
- 全暗黑主题 Vue 3 管理界面

## 部署方式（二选一）

### 方式 A：Cloudflare Pages（推荐，自动从 GitHub 部署）

**步骤：**

#### 1. 初始化本地项目
```bash
cd TvLive
npm install
npm run build     # 构建 dist/_worker.js
```

#### 2. 推送到 GitHub
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

#### 3. 在 Cloudflare Pages 中连接 GitHub
1. 打开 Cloudflare Dashboard → **Workers & Pages** → **Pages** → **创建应用程序** → **连接到 Git**
2. 授权 GitHub，选择刚推送的仓库
3. 设置构建设置：
   - **构建命令**：`npm run build`
   - **构建输出目录**：`dist`
4. 点击 **保存并部署**

#### 4. 设置 KV 绑定和环境变量
部署完成后：
1. 进入 Pages 项目 → **设置** → **函数** → **KV 命名空间绑定**
   - 变量名称：`TVLIVE`
   - 选择或创建 `TVLIVE` 命名空间
2. 进入 Pages 项目 → **设置** → **环境变量**
   - 添加变量：`PASSWORD`（你的管理密码）

> 以后每次 `git push` 到 GitHub，Pages 会自动重新构建并部署。

---

### 方式 B：Cloudflare Workers（wrangler CLI）

```bash
npm install -g wrangler
wrangler deploy
```
需先设置 `CLOUDFLARE_API_TOKEN` 环境变量，或在 Cloudflare Dashboard 中配置 API Token。

---

## 免费计划适配说明

| 约束 | 适配措施 |
|---|---|
| Workers 100k req/天 | 播放列表请求缓存 1h，管理操作极少 |
| 10ms CPU 时间 | 聚合流式处理；测速分片自调用，每片只测 5 个 URL |
| KV 100k 读/天 | 配置读取 1 次/请求，缓存后不重复读 |
| KV 1k 写/天 | 仅管理员保存配置、测速更新黑白名单时写入 |
| Cron 3 个上限 | 只用 2 个（测速 + 聚合），留 1 个余量 |

## 本地开发

```bash
npm run dev     # 监听模式，修改自动重建
```

`dist/_worker.js` 即为部署产物。

## 项目结构

```
TvLive/
├── build.mjs             # esbuild 打包脚本
├── package.json
├── wrangler.toml         # Cloudflare 配置（参考用）
├── .gitignore
├── README.md
├── src/
│   ├── index.js          # 主入口 + 路由 + API
│   ├── config.js         # KV 配置管理（绑定名 TVLIVE）
│   ├── processor.js      # M3U/TXT 下载与处理
│   ├── classifier.js     # 频道分类系统
│   ├── pipeline.js       # 聚合管道
│   ├── speedtest.js      # 测速系统
│   ├── admin.js          # 管理后台 HTML (Vue 3)
│   └── utils.js          # 通用工具函数
└── dist/                 # 构建输出（gitignore）
    └── _worker.js        # Cloudflare Pages 自动识别
```

## 技术栈
- **运行时**: Cloudflare Workers / Pages Functions
- **存储**: Cloudflare KV（绑定名 `TVLIVE`，后台手动配置）
- **密码管理**: 环境变量 `PASSWORD`（后台手动设置）
- **前端**: Vue 3 + SortableJS + Tailwind CSS (CDN)
- **构建**: esbuild (ESM bundler)
- **输出**: M3U / TXT 双格式
- **测速**: HTTP HEAD 分片自调用
