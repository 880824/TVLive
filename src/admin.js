 /**
 * 管理后台 HTML（Vue 3 + 暗黑风格）
 */
 
 export function loginHtml() {
   return `<!DOCTYPE html>
 <html lang="zh-CN">
 <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
 <title>IPTV 管理中心</title>
 <script src="https://cdn.tailwindcss.com"></script>
 <script>tailwind.config={theme:{extend:{fontFamily:{sans:['"Segoe UI"','-apple-system','sans-serif']},colors:{fluent:{accent:'#00D4AA',bg:'#252525',text:'#EDEDED',muted:'#999'}}}}}</script>
 </head>
 <body class="min-h-screen bg-[#111] flex items-center justify-center p-6 font-sans text-[#EDEDED]">
 <div class="w-full max-w-sm bg-[#252525]/90 border border-white/10 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
   <div class="w-12 h-12 rounded-xl bg-[rgba(0,212,170,0.1)] flex items-center justify-center mx-auto mb-6">
     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
   </div>
   <h1 class="text-2xl font-semibold text-center mb-2">IPTV 管理中心</h1>
   <p class="text-sm text-center text-[#999] mb-8">请输入管理密码以继续</p>
   <form action="/config/login" method="POST" class="space-y-6">
     <div><label class="block text-sm font-medium mb-2">管理密码</label>
     <input type="password" name="password" class="w-full h-10 rounded-lg bg-[#1A1A1A] border border-white/10 px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#00D4AA]" placeholder="请输入密码..." required autofocus></div>
     <button type="submit" class="w-full h-10 bg-[#005FB8] hover:bg-[#0067C0] text-white rounded-lg text-sm font-medium">登录后台</button>
   </form>
 </div>
 </body>
 </html>`;
 }
 
 export function configHtml() {
   return `<!DOCTYPE html>
 <html lang="zh">
 <head>
 <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
 <title>IPTV Manager - 直播源聚合管理系统</title>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.js"></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
 <style>
 :root{--accent:#00D4AA;--accent-bg:rgba(0,212,170,.12);--accent-border:rgba(0,212,170,.22);--sidebar-bg:#141414;--content-bg:#1A1A1A;--card-bg:#222;--card-border:#2A2A2A;--text:#EDEDED;--text2:#999;--text3:#666;--success:#00D4AA;--danger:#FF4D4F;--warning:#FAAD14;--radius:10px;--shadow:0 1px 2px rgba(0,0,0,.2)}
 *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;display:flex;height:100vh;background:var(--content-bg);color:var(--text);font-size:14px;overflow:hidden}
 .sidebar{width:200px;min-width:200px;background:var(--sidebar-bg);display:flex;flex-direction:column;color:#fff;user-select:none;overflow:hidden;z-index:10}
 .sidebar-logo{padding:18px 16px 20px;font-size:16px;font-weight:800;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:8px}
 .sidebar-logo span{color:var(--accent)}.sidebar-nav{flex:1;padding:6px;display:flex;flex-direction:column;gap:1px;overflow-y:auto}
 .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;color:rgba(255,255,255,.5);cursor:pointer;transition:.12s;font-size:13px;font-weight:500;border:none;background:none;width:100%;text-align:left;font-family:inherit}
 .nav-item:hover{background:#1F1F1F;color:rgba(255,255,255,.85)}.nav-item.active{background:var(--accent-bg);color:var(--accent);font-weight:600}
 .nav-icon{width:20px;text-align:center;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
 .sidebar-footer{padding:10px 8px;border-top:1px solid rgba(255,255,255,.06)}
 .save-btn{width:100%;padding:9px;border-radius:6px;background:var(--accent);color:#141414;border:none;font-weight:700;font-size:13px;cursor:pointer;transition:.12s;font-family:inherit}
 .save-btn:hover{background:#00B894}.save-btn:disabled{opacity:.5;cursor:not-allowed}
 #app{display:flex;flex:1;min-height:0}
 .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
 .topbar{height:48px;min-height:48px;background:var(--card-bg);border-bottom:1px solid var(--card-border);display:flex;align-items:center;justify-content:space-between;padding:0 18px}
 .topbar-left{font-size:13px;color:var(--text3)}.topbar-left span{color:var(--text);font-weight:600}
 .content{flex:1;overflow-y:auto;padding:16px 20px}
 .page{display:none}.page.active{display:block}
 .panel{background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--radius);margin-bottom:16px;overflow:hidden}
 .panel-header{padding:12px 16px;border-bottom:1px solid var(--card-border);display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:700}
 .panel-body{padding:14px 16px}
 .btn{display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:.12s;border:none;font-family:inherit;white-space:nowrap}
 .btn-primary{background:var(--accent);color:#141414}.btn-primary:hover{background:#00B894}
 .btn-outline{background:transparent;color:var(--text2);border:1px solid var(--card-border)}.btn-outline:hover{background:#1A1A1A;border-color:var(--text3);color:var(--text)}
 .btn-sm{padding:4px 10px;font-size:11px}.btn-xs{padding:3px 6px;font-size:10px;border-radius:4px}
 .form-input{width:100%;padding:7px 10px;border:1px solid var(--card-border);border-radius:5px;font-size:13px;font-family:inherit;background:var(--content-bg);color:var(--text);outline:none}
 .form-input:focus{border-color:var(--accent)}.form-label{display:block;font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px}
 .form-group{margin-bottom:12px}
 .switch{width:36px;height:20px;background:#3A3A3A;border-radius:10px;cursor:pointer;position:relative;display:inline-block;flex-shrink:0;transition:.15s}
 .switch.on{background:var(--accent)}.switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:.15s}
 .switch.on::after{left:18px}
 table{width:100%;border-collapse:collapse}
 th{padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text3);background:#1A1A1A;border-bottom:1px solid var(--card-border);white-space:nowrap}
 td{padding:7px 10px;border-bottom:1px solid #2A2A2A;font-size:12px;vertical-align:middle}
 tr:hover{background:#1A1A1A}
 .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
 .badge-succ{background:rgba(0,212,170,.1);color:var(--success)}.badge-danger{background:rgba(255,77,79,.1);color:var(--danger)}
 .badge-warn{background:rgba(250,173,20,.1);color:var(--warning)}.badge-info{background:rgba(51,153,255,.1);color:#3399FF}
 .status-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
 .status-dot.on{background:var(--success)}.status-dot.off{background:var(--danger)}.status-dot.warn{background:var(--warning)}
 .tag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
 .tag-item{background:#1A1A1A;border:1px solid var(--card-border);border-radius:6px;padding:7px 10px;cursor:pointer;transition:.12s;display:flex;align-items:center;gap:6px}
 .tag-item:hover{border-color:var(--accent)}
 .tag-input{border:none;background:transparent;font-size:12px;font-weight:600;color:var(--text);font-family:inherit;outline:none;padding:0;flex:1;min-width:0;border-bottom:1px dashed transparent}
 .tag-input:focus{border-bottom-color:var(--accent)}
 .tag-count{font-size:13px;font-weight:700;color:var(--accent);flex-shrink:0;min-width:24px;text-align:right}
 .del-btn{color:var(--text3);cursor:pointer;font-size:16px;padding:0 4px;border-radius:3px;background:none;border:none;transition:.1s;line-height:1}
 .del-btn:hover{color:var(--danger);background:rgba(255,77,79,.1)}
 .mapping-row{background:#1A1A1A;border:1px solid var(--card-border);border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
 .mapping-row:hover{border-color:var(--accent)}
 .mapping-target{font-size:12px;font-weight:700;color:var(--accent);min-width:80px;flex-shrink:0}
 .mapping-sep{color:var(--text3);flex-shrink:0}
 .mapping-sources{display:flex;flex-wrap:wrap;gap:4px;flex:1;align-items:center}
 .mapping-source-tag{background:#222;border:1px solid var(--card-border);border-radius:4px;padding:3px 8px;font-size:11px;color:var(--text2);display:flex;align-items:center;gap:4px}
 .mapping-source-tag input{border:none;background:transparent;font-size:11px;color:var(--text2);font-family:inherit;outline:none;padding:0;width:60px}
 .textarea-large{width:100%;min-height:200px;padding:12px;border:1px solid var(--card-border);border-radius:6px;font-family:monospace;font-size:12px;line-height:1.8;background:#1A1A1A;color:var(--text);resize:vertical;outline:none}
 .textarea-large:focus{border-color:var(--accent)}
 .url-row{display:flex;align-items:center;padding:8px 12px;background:#1A1A1A;border-radius:6px;font-size:12px;gap:8px;flex-wrap:wrap}
 .url-label{font-weight:600;color:var(--text2);flex-shrink:0;font-size:11px}
 .url-value{color:var(--accent);font-family:monospace;font-size:12px;flex:1;word-break:break-all;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.col-name{max-width:100px;width:auto}.col-url{min-width:0;width:auto}.col-ua{width:130px}
 a.url-value{text-decoration:none}a.url-value:hover{text-decoration:underline}
 .help-text{font-size:11px;color:var(--text3);margin-top:6px;line-height:1.6}
 .help-text code{background:#1A1A1A;padding:1px 5px;border-radius:3px;font-size:10px;color:var(--accent)}
 .progress-bar{height:6px;background:#2A2A2A;border-radius:3px;overflow:hidden;margin:8px 0}
 .progress-fill{height:100%;background:var(--accent);border-radius:3px;transition:width .3s}
 .ghost{opacity:.4;border:2px dashed var(--accent)!important}
 .spinning{animation:spin 1s linear infinite;display:inline-block}
 @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
 ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#3A3A3A;border-radius:2px}
 .flex{display:flex}.flex-wrap{flex-wrap:wrap}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}
 .items-center{align-items:center}.justify-between{justify-content:space-between}
 .mt-2{margin-top:8px}.mb-2{margin-bottom:8px}.text-center{text-align:center}
 .w-full{width:100%}.flex-1{flex:1}.min-w-0{min-width:0}
 .copy-btn{background:#1A1A1A;border:1px solid var(--card-border);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;color:var(--text3);transition:.1s;font-family:inherit}
 .copy-btn:hover{background:var(--card-border);color:var(--text)}
 .page-title{font-size:18px;font-weight:800;margin-bottom:2px}
 .page-sub{font-size:12px;color:var(--text3);margin-bottom:14px}
 .toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--card-bg);border:1px solid var(--accent-border);padding:8px 18px;border-radius:8px;font-size:13px;color:var(--text);box-shadow:0 4px 20px rgba(0,0,0,.5);display:none}
 </style>
 </head>
 <body>
 <div id="toast" class="toast"></div>
 <div id="app">
 <aside class="sidebar">
   <div class="sidebar-logo"><span>IPTV</span> Manager</div>
   <nav class="sidebar-nav">
     <button class="nav-item" :class="{active:tab==='overview'}" @click="goto('overview')"><span class="nav-icon">&#9635;</span>汇总概况</button>
     <button class="nav-item" :class="{active:tab==='sources'}" @click="goto('sources')"><span class="nav-icon">&#9881;</span>订阅管理</button>
     <button class="nav-item" :class="{active:tab==='categories'}" @click="goto('categories')"><span class="nav-icon">&#9776;</span>频道分类</button>
     <button class="nav-item" :class="{active:tab==='mapping'}" @click="goto('mapping')"><span class="nav-icon">&#8596;</span>规则映射</button>
     <button class="nav-item" :class="{active:tab==='filter'}" @click="goto('filter')"><span class="nav-icon">&#128683;</span>屏蔽过滤</button>
    <button class="nav-item" :class="{active:tab==='blacklist'}" @click="goto('blacklist')"><span class="nav-icon">&#128308;</span>黑白名单</button>
  </nav>
   <div class="sidebar-footer">
     <button class="save-btn" @click="saveAll" :disabled="saving">{{saving?'保存中...':'保存全部配置'}}</button>
   </div>
 </aside>
 <div class="main">
   <header class="topbar"><div class="topbar-left">IPTV Manager / <span>{{menuTitle}}</span></div></header>
   <div class="content">
     <!-- ===== 汇总概况 ===== -->
     <div class="page" :class="{active:tab==='overview'}">
       <div class="page-title">汇总概况</div>
       <div class="page-sub">播放列表地址、频道统计、分组排序与配置管理</div>

       <div class="panel">
         <div class="panel-header">播放列表地址</div>
         <div class="panel-body">
           <div class="url-row"><span class="url-label">完整 M3U</span><a class="url-value" :href="origin+'/live.m3u'" target="_blank">{{origin}}/live.m3u</a><button class="copy-btn" @click="copy(origin+'/live.m3u')">复制</button>
           <span class="url-label" style="margin-left:12px;">完整 TXT</span><a class="url-value" :href="origin+'/live.txt'" target="_blank">{{origin}}/live.txt</a><button class="copy-btn" @click="copy(origin+'/live.txt')">复制</button></div>
           <div class="url-row mt-2"><span class="url-label">精简 M3U</span><a class="url-value" :href="origin+'/lite.m3u'" target="_blank">{{origin}}/lite.m3u</a><button class="copy-btn" @click="copy(origin+'/lite.m3u')">复制</button>
           <span class="url-label" style="margin-left:12px;">精简 TXT</span><a class="url-value" :href="origin+'/lite.txt'" target="_blank">{{origin}}/lite.txt</a><button class="copy-btn" @click="copy(origin+'/lite.txt')">复制</button></div>
         </div>
       </div>

       <div class="panel">
         <div class="panel-header">
           <span>频道分组统计与排序</span>
           <div class="flex items-center gap-2">
             <button class="btn btn-outline btn-sm" @click="loadStats"><span :class="{spinning:loadingStats}">&#8634;</span> 刷新</button>
             <span style="font-size:11px;color:var(--text3)">拖拽排序</span></div>
         </div>
         <div class="panel-body">
           <div class="tag-grid" ref="sortGridRef">
             <div v-for="(g,i) in (cfg.sortOrder||[])" :key="g" class="tag-item" :data-idx="i" :data-group="g">
               <span class="grab" style="cursor:grab;color:var(--text3)">&#9776;</span>
               <input class="tag-input" :value="g" @change="updateSortGroup(i,$event.target.value)">
               <span class="tag-count">{{stats[g]||0}}</span>
             </div>
             <div v-for="g in extraGroups" :key="'x'+g" class="tag-item locked" :data-group="g">
               <span style="cursor:not-allowed;color:var(--text3)">&#9776;</span>
               <input class="tag-input" :value="g" readonly>
               <span class="tag-count">{{stats[g]||0}}</span>
             </div>
             <div class="tag-item tag-add" style="cursor:default;border-style:dashed">
               <input class="tag-input" v-model="newGroupName" placeholder="新增频道组" @keyup.enter="addSortGroup" @input="groupAddError=''">
               <button class="btn btn-outline btn-xs" @click="addSortGroup">+ 添加</button>
             </div>
           </div>
           <div v-if="Object.keys(stats||{}).length===0" style="color:var(--text3);font-size:12px;padding:8px 0;">点击刷新加载统计数据</div>
           <div v-if="groupAddError" style="color:var(--danger);font-size:12px;margin-top:6px">{{groupAddError}}</div>
         </div>
       </div>
      <div class="panel">
        <div class="panel-header">
          <span>精简版分类设置</span>
          <span style="font-size:11px;color:var(--text3)">拖拽排序</span>
        </div>
        <div class="panel-body">
          <div class="tag-grid" ref="liteSortGridRef">
            <div v-for="(item,i) in (liteSortList||[])" :key="i" class="tag-item" :data-idx="i" :data-name="item">
              <span class="grab" style="cursor:grab;color:var(--text3)">&#9776;</span>
              <input class="tag-input" :value="item" @change="updateLiteSortItem(i,$event.target.value)">
              <span class="tag-count">{{0}}</span>
            </div>
            <div class="tag-item tag-add" style="cursor:default;border-style:dashed">
              <input class="tag-input" v-model="newLiteCat" placeholder="新增精简分类" @keyup.enter="addLiteCat" @input="liteAddError=''">
              <button class="btn btn-outline btn-xs" @click="addLiteCat">+ 添加</button>
            </div>
          </div>
          <div v-if="liteAddError" style="color:var(--danger);font-size:12px;margin-top:6px">{{liteAddError}}</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">配置管理</div>
        <div class="panel-body flex flex-wrap gap-2">
          <button class="btn btn-primary" @click="exportConfig">&#128229; 导出配置</button>
          <button class="btn btn-outline" @click="triggerImport()">&#128228; 导入配置</button>
          <button class="btn btn-outline" style="color:var(--danger)" @click="resetConfig">&#8634; 恢复默认</button>
          <input type="file" id="importFile" style="display:none" accept=".json" @change="importConfig">
        </div>
      </div>
    </div>

     <!-- ===== 订阅管理 ===== -->
     <div class="page" :class="{active:tab==='sources'}">
       <div class="page-title">订阅源管理</div>
       <div class="page-sub">管理 M3U/TXT 订阅源地址、EPG 配置与健康状态</div>

      <div class="panel">
        <div class="panel-header">EPG 节目单</div>
        <div class="panel-body">
          <div class="url-row"><span class="url-label">EPG 地址</span><input class="form-input" v-model="cfg.epgUrl" style="flex:1;font-family:monospace;font-size:12px"></div>
        </div>
      </div>

      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <div class="panel" style="flex:1;min-width:280px">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between">
            <span>Logo 设置</span>
            <label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px">启用 Logo <div class="switch" :class="{on:cfg.enableLogo}" @click="cfg.enableLogo=!cfg.enableLogo"></div></label>
          </div>
          <div class="panel-body">
            <input class="form-input" v-model="cfg.logoTemplate" placeholder="https://example.com/logo/{}.png" style="font-family:monospace;font-size:12px">
          </div>
        </div>
        <div class="panel" style="flex:1;min-width:280px">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between">
            <span>User-Agent</span>
            <label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px">远程源拉取超时（秒）<input class="form-input" type="number" v-model.number="cfg.fetchTimeout" style="width:50px;padding:2px 5px;font-size:11px"></label>
          </div>
          <div class="panel-body">
            <input class="form-input" v-model="cfg.userAgent" placeholder="Mozilla/5.0 ..." style="font-family:monospace;font-size:12px">
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <span>订阅源列表</span>
          <div class="flex items-center gap-2 flex-wrap">
            <button class="btn btn-outline btn-sm" @click="addM3u">+ 新增订阅</button>
            <button class="btn btn-sm" :class="cfg.enableMultiSource?'btn-primary':'btn-outline'" @click="cfg.enableMultiSource=!cfg.enableMultiSource">{{cfg.enableMultiSource?'多路线:开':'多路线:关'}}</button>
            <button class="btn btn-primary btn-sm" @click="startSpeedtest" :disabled="speedtestRunning">{{speedtestRunning?'测速中...':'&#9889; 一键测速'}}</button>
            <label class="flex items-center gap-1" style="font-size:12px;color:var(--text2)">响应阈值 <input class="form-input" type="number" v-model.number="cfg.responseTimeThreshold" style="width:64px;padding:2px 5px;font-size:11px"> ms</label>
            <label class="flex items-center gap-1" style="font-size:12px;color:var(--text2)">自动测速 <input class="form-input" type="number" v-model.number="cfg.speedtestInterval" style="width:46px;padding:2px 5px;font-size:11px"> 天</label>
          </div>
        </div>
        <div class="panel-body" style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08)">
          <div v-if="speedtestRunning">
            <div class="flex justify-between" style="font-size:12px;color:var(--text2)">
              <span>进度：{{speedtestProgress.completed}}/{{speedtestProgress.total}}</span>
              <span>通过：<span style="color:var(--success)">{{speedtestProgress.passed}}</span> / 失败：<span style="color:var(--danger)">{{speedtestProgress.failed}}</span></span>
            </div>
            <div class="progress-bar"><div class="progress-fill" :style="{width:speedtestProgress.progress+'%'}"></div></div>
          </div>
          <div v-if="speedtestLastResult" style="font-size:12px;color:var(--text2)">
            上次测速：{{speedtestLastResult.time}} | 通过 {{speedtestLastResult.passed}} / 失败 {{speedtestLastResult.failed}}
          </div>
        </div>
        <div class="panel-body" style="padding:0">
          <table><thead><tr><th style="width:30px"></th><th style="width:40px">启用</th><th class="col-ua">名称</th><th class="col-url">订阅源地址</th><th class="col-ua">UA</th><th style="width:70px">注入</th><th style="width:70px">状态</th><th style="width:90px">响应时间</th><th style="width:90px">HTTP状态</th><th style="width:30px"></th></tr></thead>
          <tbody ref="m3uTableRef">
            <tr v-for="(s,i) in cfg.m3uList" :key="s.__id||i" :data-idx="i">
              <td style="cursor:grab;color:var(--text3);text-align:center;width:30px">&#9776;</td>
              <td style="text-align:center"><div class="switch" :class="{on:s.enabled}" @click="s.enabled=!s.enabled"></div></td>
              <td><input class="form-input" v-model="s.name" style="width:100%;padding:3px 6px;font-size:12px"></td>
              <td><input class="form-input" v-model="s.url" style="width:100%;font-family:monospace;font-size:11px;padding:3px 6px"></td>
              <td><input class="form-input" v-model="s.ua" style="width:100%;font-size:11px;padding:3px 6px"></td>
              <td style="text-align:center"><div class="switch" :class="{on:s.uaToUrl}" @click="s.uaToUrl=!s.uaToUrl"></div></td>
              <td><span v-if="health[s.name]" class="badge" :class="health[s.name].ok?'badge-succ':'badge-danger'"><span class="status-dot" :class="health[s.name].ok?'on':'off'"></span>{{health[s.name].ok?'在线':'异常'}}</span><span v-else class="badge badge-info">未知</span></td>
              <td style="font-size:11px;color:var(--text3);text-align:center">{{health[s.name]?health[s.name].time+'ms':'—'}}</td>
              <td style="font-size:11px;color:var(--text3);text-align:center">{{health[s.name]?health[s.name].status:'—'}}</td>
              <td style="text-align:center"><button class="del-btn" @click="cfg.m3uList.splice(i,1)">&times;</button></td>
            </tr>
          </tbody></table>
        </div>
      </div>
    </div>

     <!-- ===== 频道分类 ===== -->
     <div class="page" :class="{active:tab==='categories'}">
       <div class="page-title">频道分类管理</div>
       <div class="page-sub">管理主频道和地方台的分类结构与频道名称列表</div>

       <div class="panel">
         <div class="panel-header">
           <span>主频道分类 ({{mainChannels.length}} 个)</span>
           <button class="btn btn-outline btn-sm" @click="addMainCat">+ 添加分类</button>
         </div>
         <div class="panel-body" style="padding:0">
           <table><thead><tr><th>分类名</th><th>包含频道</th><th style="width:30px"></th></tr></thead>
           <tbody>
             <tr v-for="(cat,i) in mainChannels" :key="i">
               <td style="width:120px"><input class="form-input" v-model="cat.name" style="padding:3px 6px;font-size:12px;font-weight:600"></td>
               <td><input class="form-input" v-model="cat.channelInput" placeholder="频道名, 逗号分隔" style="font-size:11px;padding:3px 6px;font-family:monospace" @change="parseChannels(cat)"></td>
               <td><button class="del-btn" @click="mainChannels.splice(i,1)">&times;</button></td>
             </tr>
           </tbody></table>
         </div>
       </div>

       <div class="panel">
         <div class="panel-header">
           <span>地方台分类 ({{localChannels.length}} 个)</span>
           <button class="btn btn-outline btn-sm" @click="addLocalCat">+ 添加分类</button>
         </div>
         <div class="panel-body" style="padding:0">
           <table><thead><tr><th>分类名</th><th>包含频道</th><th style="width:30px"></th></tr></thead>
           <tbody>
             <tr v-for="(cat,i) in localChannels" :key="i">
               <td style="width:120px"><input class="form-input" v-model="cat.name" style="padding:3px 6px;font-size:12px;font-weight:600"></td>
               <td><input class="form-input" v-model="cat.channelInput" placeholder="频道名, 逗号分隔" style="font-size:11px;padding:3px 6px;font-family:monospace" @change="parseChannelsLocal(cat)"></td>
               <td><button class="del-btn" @click="localChannels.splice(i,1)">&times;</button></td>
             </tr>
           </tbody></table>
         </div>
       </div>
     </div>

     <!-- ===== 规则映射 ===== -->
     <div class="page" :class="{active:tab==='mapping'}">
       <div class="page-title">规则映射</div>
       <div class="page-sub">频道分组映射、名称标准化规则管理</div>

       <div class="panel">
         <div class="panel-header">
           <span>频道分组映射（原分组名 → 标准分组）</span>
           <button class="btn btn-outline btn-sm" @click="addGroupRule">+ 添加</button>
         </div>
         <div class="panel-body">
           <div v-for="(aliases,target) in (cfg.groupReplaceRules||{})" :key="target" class="mapping-row">
             <input class="form-input" :value="target" @change="renameGroupRule(target,$event.target.value)" style="width:120px;padding:4px 6px;font-size:12px;font-weight:700;color:var(--accent)">
             <span class="mapping-sep">&#8592;</span>
             <div class="mapping-sources">
               <span v-for="(a,ai) in aliases" :key="ai" class="mapping-source-tag">
                 <input :value="a" @change="cfg.groupReplaceRules[target][ai]=$event.target.value">
                 <span class="del-btn" style="font-size:12px" @click="cfg.groupReplaceRules[target].splice(ai,1)">&times;</span>
               </span>
               <button class="btn btn-xs btn-ghost" @click="cfg.groupReplaceRules[target].push('')">+</button>
             </div>
             <button class="del-btn" @click="delete cfg.groupReplaceRules[target];cfg.groupReplaceRules={...cfg.groupReplaceRules}">&times;</button>
           </div>
           <div v-if="isEmpty(cfg.groupReplaceRules)" style="color:var(--text3);font-size:12px;padding:8px 0">暂无分组映射规则</div>
         </div>
       </div>

       <div class="panel">
         <div class="panel-header">
           <span>频道名称标准化规则（别名 → 标准名）</span>
           <button class="btn btn-outline btn-sm" @click="addNameRule">+ 添加</button>
         </div>
         <div class="panel-body">
           <div v-for="(aliases,std) in (cfg.nameReplaceRules||{})" :key="std" class="mapping-row">
             <input class="form-input" :value="std" @change="renameNameRule(std,$event.target.value)" style="width:100px;padding:4px 6px;font-size:12px;font-weight:700;color:var(--accent)">
             <span class="mapping-sep">=</span>
             <div class="mapping-sources">
               <span v-for="(a,ai) in aliases" :key="ai" class="mapping-source-tag">
                 <input :value="a" @change="cfg.nameReplaceRules[std][ai]=$event.target.value" style="width:80px">
                 <span class="del-btn" style="font-size:12px" @click="cfg.nameReplaceRules[std].splice(ai,1)">&times;</span>
               </span>
               <button class="btn btn-xs btn-ghost" @click="cfg.nameReplaceRules[std].push('')">+</button>
             </div>
             <button class="del-btn" @click="delete cfg.nameReplaceRules[std];cfg.nameReplaceRules={...cfg.nameReplaceRules}">&times;</button>
           </div>
         </div>
       </div>
     </div>

     <!-- ===== 屏蔽过滤 ===== -->
     <div class="page" :class="{active:tab==='filter'}">
       <div class="page-title">屏蔽过滤</div>
       <div class="page-sub">管理分组屏蔽、关键词屏蔽、字符删除和地址替换</div>

       <div class="panel">
         <div class="panel-header">频道分组屏蔽 <span class="badge badge-info">{{cfg.deleteGroups.length}}</span></div>
         <div class="panel-body"><div class="tag-grid">
           <div v-for="(g,i) in cfg.deleteGroups" :key="i" class="tag-item" style="cursor:default"><input class="tag-input" v-model="cfg.deleteGroups[i]"><button class="del-btn" @click="cfg.deleteGroups.splice(i,1)">&times;</button></div>
           <div class="tag-item" style="cursor:default"><input class="tag-input" v-model="newDelGroup" placeholder="新增屏蔽分组" @keyup.enter="addDelGroup"><button class="btn btn-outline btn-xs" @click="addDelGroup">+</button></div>
         </div></div>
       </div>
       <div class="panel">
         <div class="panel-header">频道关键词屏蔽 <span class="badge badge-info">{{cfg.channelBlockKeywords.length}}</span></div>
         <div class="panel-body"><div class="tag-grid">
           <div v-for="(k,i) in cfg.channelBlockKeywords" :key="i" class="tag-item" style="cursor:default"><input class="tag-input" v-model="cfg.channelBlockKeywords[i]"><button class="del-btn" @click="cfg.channelBlockKeywords.splice(i,1)">&times;</button></div>
           <div class="tag-item" style="cursor:default"><input class="tag-input" v-model="newBlockKey" placeholder="新增关键词" @keyup.enter="addBlockKey"><button class="btn btn-outline btn-xs" @click="addBlockKey">+</button></div>
         </div></div>
       </div>
       <div class="panel">
         <div class="panel-header">频道名清理列表（REMOVAL_LIST） <span class="badge badge-info">{{cfg.removalList.length}}</span></div>
         <div class="panel-body"><div class="tag-grid">
           <div v-for="(r,i) in cfg.removalList" :key="i" class="tag-item" style="cursor:default"><input class="tag-input" v-model="cfg.removalList[i]"><button class="del-btn" @click="cfg.removalList.splice(i,1)">&times;</button></div>
           <div class="tag-item" style="cursor:default"><input class="tag-input" v-model="newRemoval" placeholder="新增清理字符" @keyup.enter="addRemoval"><button class="btn btn-outline btn-xs" @click="addRemoval">+</button></div>
         </div></div>
       </div>
       <div class="panel">
         <div class="panel-header">频道地址替换 <span class="badge badge-info">{{Object.keys(cfg.urlReplaceRules||{}).length}}</span></div>
         <div class="panel-body">
           <div v-for="(to,from) in (cfg.urlReplaceRules||{})" :key="from" class="mapping-row">
             <input class="form-input" :value="from" @change="renameUrlRule(from,$event.target.value)" style="flex:1;font-family:monospace;font-size:11px;padding:4px 6px"><span class="mapping-sep">&#8594;</span>
             <input class="form-input" :value="to" @change="cfg.urlReplaceRules[from]=$event.target.value" style="flex:1;font-family:monospace;font-size:11px;padding:4px 6px">
             <button class="del-btn" @click="delete cfg.urlReplaceRules[from];cfg.urlReplaceRules={...cfg.urlReplaceRules}">&times;</button>
           </div>
           <div class="mapping-row mt-2"><input class="form-input" v-model="newUrlFrom" placeholder="原地址前缀" style="flex:1;font-family:monospace;font-size:11px;padding:4px 6px"><span class="mapping-sep">&#8594;</span><input class="form-input" v-model="newUrlTo" placeholder="替换地址" style="flex:1;font-family:monospace;font-size:11px;padding:4px 6px"><button class="btn btn-outline btn-sm" @click="addUrlRule">添加</button></div>
         </div>
       </div>
     </div>

     <!-- ===== 黑白名单 ===== -->
     <div class="page" :class="{active:tab==='blacklist'}">
       <div class="page-title">黑白名单管理</div>
       <div class="page-sub">管理订阅源的黑白名单，聚合时白名单优先、黑名单跳过</div>
       <div class="flex gap-3" style="height:calc(100vh - 200px)">
         <div class="panel" style="flex:1;display:flex;flex-direction:column">
           <div class="panel-header">
             <span>白名单 ({{whiteList.length}})</span>
             <button class="btn btn-outline btn-sm" @click="showAddWhite=true">+ 添加</button>
           </div>
           <div class="panel-body" style="flex:1;overflow-y:auto;padding:0">
             <div v-if="showAddWhite" class="flex gap-2" style="padding:8px;border-bottom:1px solid var(--card-border)">
               <input class="form-input" v-model="newWhiteUrl" placeholder="URL 地址" style="flex:1;font-family:monospace;font-size:11px">
               <button class="btn btn-primary btn-sm" @click="addWhiteListItem">确认</button>
               <button class="btn btn-outline btn-sm" @click="showAddWhite=false">取消</button>
             </div>
             <table><thead><tr><th>URL</th><th style="width:70px">响应时间</th><th style="width:60px">来源</th><th style="width:30px"></th></tr></thead>
             <tbody><tr v-for="(w,i) in whiteList" :key="i"><td style="font-family:monospace;font-size:10px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{typeof w==='string'?w:w.url}}</td><td>{{w.time||'-'}}ms</td><td><span class="badge" :class="w.source==='manual'?'badge-succ':'badge-info'">{{w.source||'auto'}}</span></td><td><button class="del-btn" @click="removeWhite(i)">&times;</button></td></tr></tbody></table>
           </div>
         </div>
         <div class="panel" style="flex:1;display:flex;flex-direction:column">
           <div class="panel-header">
             <span>黑名单 ({{blackList.length}})</span>
             <button class="btn btn-outline btn-sm" @click="showAddBlack=true">+ 添加</button>
           </div>
           <div class="panel-body" style="flex:1;overflow-y:auto;padding:0">
             <div v-if="showAddBlack" class="flex gap-2" style="padding:8px;border-bottom:1px solid var(--card-border)">
               <input class="form-input" v-model="newBlackUrl" placeholder="URL 地址" style="flex:1;font-family:monospace;font-size:11px">
               <button class="btn btn-primary btn-sm" @click="addBlackListItem">确认</button>
               <button class="btn btn-outline btn-sm" @click="showAddBlack=false">取消</button>
             </div>
             <table><thead><tr><th>URL</th><th style="width:70px">原因</th><th style="width:60px">来源</th><th style="width:30px"></th></tr></thead>
             <tbody><tr v-for="(b,i) in blackList" :key="i"><td style="font-family:monospace;font-size:10px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{typeof b==='string'?b:b.url}}</td><td>{{b.reason||'-'}}</td><td><span class="badge" :class="b.source==='manual'?'badge-succ':'badge-danger'">{{b.source||'auto'}}</span></td><td><button class="del-btn" @click="removeBlack(i)">&times;</button></td></tr></tbody></table>
           </div>
         </div>
       </div>
     </div>

        </div>
 </div>
 </div>

 <script>
 var api={base:'/config/api'};
 function toast(msg){var el=document.getElementById('toast');el.textContent=msg;el.style.display='block';setTimeout(function(){el.style.display='none'},3000)}
 function http(url,opts){return fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opts}).then(function(r){return r.json()})}
   try{var app=Vue.createApp({setup(){
   var tab=Vue.ref('overview');
   var cfg=Vue.ref({m3uList:[],deleteGroups:[],channelBlockKeywords:[],removalList:[],groupReplaceRules:{},nameReplaceRules:{},urlReplaceRules:{},epgUrl:'',enableEpg:true,logoTemplate:'',enableLogo:true,enableMultiSource:true,singleChannelMaxCount:5,responseTimeThreshold:2000,speedtestInterval:3,userAgent:'',fetchTimeout:10,liteSortTypes:[]});
   var stats=Vue.ref({});var mainChannels=Vue.ref([]);var localChannels=Vue.ref([]);
   var whiteList=Vue.ref([]);var blackList=Vue.ref([]);var health=Vue.ref({});
   var origin=Vue.ref('');var saving=Vue.ref(false);var loadingStats=Vue.ref(false);
   var speedtestRunning=Vue.ref(false);var speedtestProgress=Vue.ref({completed:0,total:0,passed:0,failed:0,progress:0});
   var speedtestLastResult=Vue.ref(null);
   var newDelGroup=Vue.ref('');var newBlockKey=Vue.ref('');var newRemoval=Vue.ref('');
   var newUrlFrom=Vue.ref('');var newUrlTo=Vue.ref('');var newWhiteUrl=Vue.ref('');var newBlackUrl=Vue.ref('');
   var showAddWhite=Vue.ref(false);var showAddBlack=Vue.ref(false);
   var sortGridRef=Vue.ref(null);var m3uTableRef=Vue.ref(null);var newGroupName=Vue.ref('');var groupAddError=Vue.ref('');var liteAddError=Vue.ref('');
   var liteSortText=Vue.ref('');var newLiteCat=Vue.ref('');

   var menuTitle=Vue.computed(function(){var t={'overview':'汇总概况','sources':'订阅管理','categories':'频道分类','mapping':'规则映射','filter':'屏蔽过滤','blacklist':'黑白名单'};return t[tab.value]||''});
   
   var liteSortGridRef=Vue.ref(null);var liteSortList=Vue.computed(function(){return cfg.value.liteSortTypes||[]});var liteSortCounts=Vue.computed(function(){var o={};var s=stats.value||{};for(var k in s)o[k]=s[k];return o});var statsOrder=Vue.computed(function(){var o=cfg.value.sortOrder||[];var s=stats.value;var r=[];for(var g of o){r.push({group:g,count:s[g]||0})}var used=new Set(o);for(var g in s){if(!used.has(g))r.push({group:g,count:s[g]})}return r});
   var extraGroups=Vue.computed(function(){var o=cfg.value.sortOrder||[];var used2=new Set(o);var r2=[];var s2=stats.value||{};for(var g in s2){if(!used2.has(g))r2.push(g)}return r2});

   function isEmpty(obj){if(!obj)return true;for(var k in obj)return false;return true}
   function copy(t){navigator.clipboard.writeText(t).then(function(){toast('已复制: '+t)})}

   function loadStats(){loadingStats.value=true;http(api.base+'/stats').then(function(r){stats.value=r.stats||{};health.value=r.health||{};loadingStats.value=false;initSortable()})}
   function updateSortGroup(i,name){if(!cfg.value.sortOrder)cfg.value.sortOrder=[];cfg.value.sortOrder[i]=name}

   function addM3u(){if(!cfg.value.m3uList)cfg.value.m3uList=[];cfg.value.m3uList.push({name:'新源'+Date.now(),url:'',ua:'okhttp/4.12.0',enabled:true,uaToUrl:false,__id:Date.now()})}
   function checkHealth(){health.value={};http(api.base+'/health').then(function(r){health.value=r;toast('健康检测完成')})}

   function addMainCat(){mainChannels.value.push({name:'新分类',channels:[],channelInput:''})}
   function addLocalCat(){localChannels.value.push({name:'新分类',channels:[],channelInput:''})}
   function parseChannels(cat){cat.channels=cat.channelInput.split(',').map(function(s){return s.trim()}).filter(Boolean)}
   function parseChannelsLocal(cat){cat.channels=cat.channelInput.split(',').map(function(s){return s.trim()}).filter(Boolean)}

   
   

   

   function addGroupRule(){if(!cfg.value.groupReplaceRules)cfg.value.groupReplaceRules={};cfg.value.groupReplaceRules['新分组']=[];cfg.value.groupReplaceRules={...cfg.value.groupReplaceRules}}
   function renameGroupRule(oldKey,newKey){if(newKey!==oldKey&&newKey){cfg.value.groupReplaceRules[newKey]=cfg.value.groupReplaceRules[oldKey];delete cfg.value.groupReplaceRules[oldKey];cfg.value.groupReplaceRules={...cfg.value.groupReplaceRules}}}
   function addNameRule(){if(!cfg.value.nameReplaceRules)cfg.value.nameReplaceRules={};cfg.value.nameReplaceRules['新标准名']=[];cfg.value.nameReplaceRules={...cfg.value.nameReplaceRules}}
   function renameNameRule(oldKey,newKey){if(newKey!==oldKey&&newKey){cfg.value.nameReplaceRules[newKey]=cfg.value.nameReplaceRules[oldKey];delete cfg.value.nameReplaceRules[oldKey];cfg.value.nameReplaceRules={...cfg.value.nameReplaceRules}}}

   function addDelGroup(){if(newDelGroup.value.trim()){cfg.value.deleteGroups.push(newDelGroup.value.trim());newDelGroup.value=''}}
   function addBlockKey(){if(newBlockKey.value.trim()){cfg.value.channelBlockKeywords.push(newBlockKey.value.trim());newBlockKey.value=''}}
   
   function addRemoval(){if(newRemoval.value.trim()){cfg.value.removalList.push(newRemoval.value.trim());newRemoval.value=''}}
   function addUrlRule(){if(newUrlFrom.value.trim()&&newUrlTo.value.trim()){cfg.value.urlReplaceRules[newUrlFrom.value.trim()]=newUrlTo.value.trim();cfg.value.urlReplaceRules={...cfg.value.urlReplaceRules};newUrlFrom.value='';newUrlTo.value=''}}
   function renameUrlRule(oldKey,newKey){if(newKey!==oldKey&&newKey){cfg.value.urlReplaceRules[newKey]=cfg.value.urlReplaceRules[oldKey];delete cfg.value.urlReplaceRules[oldKey];cfg.value.urlReplaceRules={...cfg.value.urlReplaceRules}}}

   function addWhiteListItem(){if(newWhiteUrl.value.trim()){whiteList.value.push({url:newWhiteUrl.value.trim(),time:0,source:'manual'});newWhiteUrl.value='';showAddWhite.value=false;saveBlacklistOnly()}}
   function removeWhite(i){whiteList.value.splice(i,1);saveBlacklistOnly()}
   function addBlackListItem(){if(newBlackUrl.value.trim()){blackList.value.push({url:newBlackUrl.value.trim(),reason:'manual',source:'manual'});newBlackUrl.value='';showAddBlack.value=false;saveBlacklistOnly()}}
   function removeBlack(i){blackList.value.splice(i,1);saveBlacklistOnly()}
   function saveBlacklistOnly(){http(api.base+'/blacklist/save',{method:'POST',body:JSON.stringify(blackList.value.map(function(b){return typeof b==='string'?b:b.url}))}).then(function(){http(api.base+'/whitelist/save',{method:'POST',body:JSON.stringify(whiteList.value)}).then(function(){toast('黑白名单已保存')})})}

   function goto(t){tab.value=t}
   function updateLiteSortItem(i,v){if(cfg.value.liteSortTypes)cfg.value.liteSortTypes[i]=v}
   function addLiteCat(){var n=newLiteCat.value.trim();liteAddError.value='';if(!n){liteAddError.value='名称不能为空';return}var list=cfg.value.liteSortTypes||[];for(var k=0;k<list.length;k++){if(list[k].toLowerCase()===n.toLowerCase()){liteAddError.value='已存在同名分类';return}}if(!cfg.value.liteSortTypes)cfg.value.liteSortTypes=[];cfg.value.liteSortTypes.push(n);newLiteCat.value=''}
   function addSortGroup(){var n=newGroupName.value.trim();groupAddError.value='';if(!n){groupAddError.value='名称不能为空';return}var ord=cfg.value.sortOrder||[];var all=ord.concat(extraGroups.value);for(var k=0;k<all.length;k++){if(all[k].toLowerCase()===n.toLowerCase()){groupAddError.value='已存在同名分组';return}}if(!cfg.value.sortOrder)cfg.value.sortOrder=[];cfg.value.sortOrder.push(n);newGroupName.value=''}
   function startSpeedtest(){speedtestRunning.value=true;speedtestProgress.value={completed:0,total:0,passed:0,failed:0,progress:0};
     http(api.base+'/speedtest/start',{method:'POST'}).then(function(r){toast(r.message||'测速已启动');pollSpeedtest()})}
   function pollSpeedtest(){http(api.base+'/speedtest/status').then(function(r){speedtestProgress.value=r;if(r.running){setTimeout(pollSpeedtest,2000)}else{speedtestRunning.value=false;speedtestLastResult.value={time:new Date().toLocaleString('zh-CN'),passed:r.passed,failed:r.failed};if(r.passed>0||r.failed>0){http(api.base+'/whitelist').then(function(w){whiteList.value=w||[]});http(api.base+'/blacklist').then(function(b){blackList.value=b||[]})};if(r.passed>0||r.failed>0)toast('测速完成：通过 '+r.passed+' / 失败 '+r.failed)}})}

   function triggerImport(){document.getElementById('importFile').click()}
   function exportConfig(){var blob=new Blob([JSON.stringify(cfg.value,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='iptv-config.json';a.click();toast('配置已导出')}
   function importConfig(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var data=JSON.parse(ev.target.result);Object.assign(cfg.value,data);toast('配置已导入')}catch(err){toast('导入失败: '+err.message)}};reader.readAsText(file,'utf-8')}
   function resetConfig(){if(confirm('确认恢复默认配置？当前修改将丢失。')){location.reload()}}

   function saveAll(){saving.value=true;
     // 同步精简版分类文本
     if(liteSortText.value)cfg.value.liteSortTypes=liteSortText.value.split('\\n').map(function(s){return s.trim()}).filter(Boolean);
     // 同步频道分类的 channelInput
     for(var cat of mainChannels.value){cat.channelInput=cat.channels.join(', ')}
     for(var cat of localChannels.value){cat.channelInput=cat.channels.join(', ')}

     Promise.all([
       http(api.base+'/save',{method:'POST',body:JSON.stringify(cfg.value)}),
       
       http(api.base+'/channels/save',{method:'POST',body:JSON.stringify({main:mainChannels.value,local:localChannels.value})}),
       http(api.base+'/whitelist/save',{method:'POST',body:JSON.stringify(whiteList.value)}),
       http(api.base+'/blacklist/save',{method:'POST',body:JSON.stringify(blackList.value.map(function(b){return typeof b==='string'?b:b.url}))})
     ]).then(function(){saving.value=false;toast('全部配置已保存')}).catch(function(){saving.value=false;toast('保存失败，请重试')})
   }

   function initSortable(){Vue.nextTick(function(){
     if(liteSortGridRef.value)Sortable.create(liteSortGridRef.value,{animation:150,handle:'.grab',draggable:'.tag-item:not(.tag-add)',ghostClass:'.ghost',onEnd:function(){var list=[];Array.prototype.forEach.call(liteSortGridRef.value.children,function(c){if(c.classList.contains('tag-add'))return;list.push(c.getAttribute('data-name'))});cfg.value.liteSortTypes=list;cfg.value={...cfg.value}}});
     if(sortGridRef.value)Sortable.create(sortGridRef.value,{animation:150,handle:'.grab',draggable:'.tag-item:not(.tag-add):not(.locked)',ghostClass:'.ghost',onEnd:function(){var names=[];Array.prototype.forEach.call(sortGridRef.value.children,function(c){if(c.classList.contains('tag-add')||c.classList.contains('locked'))return;names.push(c.getAttribute('data-group'))});cfg.value.sortOrder=names;cfg.value={...cfg.value}});
     if(m3uTableRef.value)Sortable.create(m3uTableRef.value,{animation:150,handle:'tr',onEnd:function(ev){var list=cfg.value.m3uList||[];var item=list.splice(ev.oldIndex,1)[0];list.splice(ev.newIndex,0,item);cfg.value={...cfg.value}}});
   })}

   // 加载初始数据
   origin.value=window.location.origin;
   Promise.all([
     http(api.base+'/get').then(function(r){if(r&&typeof r==='object'){r.groupReplaceRules=r.groupReplaceRules||{};r.nameReplaceRules=r.nameReplaceRules||{};r.urlReplaceRules=r.urlReplaceRules||{};r.deleteGroups=r.deleteGroups||[];r.channelBlockKeywords=r.channelBlockKeywords||[];r.removalList=r.removalList||[];if(r.deleteChars){var dc=new Set(r.removalList);r.deleteChars.forEach(function(x){dc.add(x)});r.removalList=Array.from(dc);r.deleteChars=null};r.m3uList=r.m3uList||[];r.liteSortTypes=r.liteSortTypes||[]}cfg.value=r;if(cfg.value.liteSortTypes)liteSortText.value=cfg.value.liteSortTypes.join('\\n')}),
     
     http(api.base+'/channels').then(function(r){mainChannels.value=r.main||[];localChannels.value=r.local||[];
       // 格式化 channelInput
       for(var cat of mainChannels.value){cat.channelInput=(cat.channels||[]).join(', ')}
       for(var cat of localChannels.value){cat.channelInput=(cat.channels||[]).join(', ')}
     }),
     http(api.base+'/whitelist').then(function(r){whiteList.value=r||[]}),
     http(api.base+'/blacklist').then(function(r){blackList.value=r||[]}),
     http(api.base+'/stats').then(function(r){stats.value=r.stats||{};health.value=r.health||{};initSortable()})
   ]);

   // 定时刷新测速进度
   setInterval(function(){if(speedtestRunning.value)pollSpeedtest()},3000);

   return {tab,cfg,stats,mainChannels,localChannels,whiteList,blackList,health,origin,saving,loadingStats,
     speedtestRunning,speedtestProgress,speedtestLastResult,
     newDelGroup,newBlockKey,newRemoval,newUrlFrom,newUrlTo,newWhiteUrl,newBlackUrl,
     showAddWhite,showAddBlack,sortGridRef,m3uTableRef,liteSortText,newGroupName,groupAddError,liteAddError,extraGroups,
     menuTitle,statsOrder,
     isEmpty,copy,loadStats,updateSortGroup,addSortGroup,
     addM3u,checkHealth,addMainCat,addLocalCat,parseChannels,parseChannelsLocal,addGroupRule,renameGroupRule,addNameRule,renameNameRule,
     addDelGroup,addBlockKey,addRemoval,addUrlRule,renameUrlRule,
     addWhiteListItem,removeWhite,addBlackListItem,removeBlack,
     startSpeedtest,pollSpeedtest,exportConfig,importConfig,resetConfig,saveAll,initSortable,goto,triggerImport}
 }});
 app.mount('#app');}catch(e){document.getElementById('toast').textContent='Vue error: '+e.message;document.getElementById('toast').style.display='block'}
 </script>
 </body>
 </html>`;
 }








