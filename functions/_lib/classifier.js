 /**
 * 频道分类器 —— 将频道归类到主频道/地方台的层级分类中
 * 移植自 IPTV-Manage 的 main.py 分类逻辑
 */
 
 import { cleanChannelName } from './utils.js';
 import { buildCategoryLookup } from './config.js';
 
/**
 * 核心分类函数
  * 将频道条目按分类体系归类，未匹配的进入 "其他频道"
  *
  * @param {Array} items - 频道条目列表 [{name, url, group, ...}]
  * @param {Object} mainChannels - 主频道分类列表 [{name, channels}]
 * @param {Object} localChannels - 地方台分类列表 [{name, channels}]
 * @param {Object} config - 全局配置
 * @returns {Object} { classified: {分类名: [条目]}, others: [条目], allUrlSet: Set }
 */
export function classifyChannels(items, mainChannels, localChannels, config) {
   const lookup = buildCategoryLookup(mainChannels, localChannels);
   const classified = {};
   const allUrlSet = new Set();
 
   // 初始化所有分类的空数组
   for (const cat of mainChannels) classified[cat.name] = [];
   for (const cat of localChannels) classified[cat.name] = [];
   classified['其他频道'] = [];
 
   const singleChnCount = {};
   const maxCount = config.singleChannelMaxCount || 5;
   const removalList = config.removalList || [];
  const isUnlimited = maxCount === -1;

  for (const item of items) {
    if (!item.name || !item.url) continue;

   // 名称清洗
    let chName = cleanChannelName(item.name, removalList);
    if (!chName) continue;

     // 单频道限流
     if (!isUnlimited) {
       const count = singleChnCount[chName] || 0;
       if (count >= maxCount) continue;
     }

     // URL 去重
     const urlKey = item.url;
     if (allUrlSet.has(urlKey)) continue;

     // 分类匹配
     const found = lookup[chName];
     let targetCategory;
     if (found) {
       targetCategory = found.name;
     } else {
       // 尝试按 group 映射
       targetCategory = item.group || '其他频道';
       // 如果 group 也是 "其他频道"，保留
     }

     if (!classified[targetCategory]) classified[targetCategory] = [];
     classified[targetCategory].push({
       ...item,
       name: chName
     });
     allUrlSet.add(urlKey);

     // 更新单频道计数
     if (!isUnlimited) {
       singleChnCount[chName] = (singleChnCount[chName] || 0) + 1;
     }
   }

   return { classified, allUrlSet };
 }
 
 /** 按分类生成 M3U 条目（完整版 = 主频道 + 其他 + 地方台） */
 export function generateClassifiedEntries(classified, mainChannels, localChannels, config, includeLocal) {
   const result = [];
   const bjTime = new Date(Date.now() + 8 * 3600000);
   const timeStr = `${bjTime.getFullYear()}${String(bjTime.getMonth()+1).padStart(2,'0')}${String(bjTime.getDate()).padStart(2,'0')} ${String(bjTime.getHours()).padStart(2,'0')}:${String(bjTime.getMinutes()).padStart(2,'0')}`;
   const channelCount = Object.values(classified).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
   const epg = config.enableEpg ? (config.epgUrl || '') : '';
   const logo = config.enableLogo ? (config.logoTemplate || '') : '';

   // 版本行
   result.push({ type: 'header', line: `更新时间,#genre#` });
   result.push({ type: 'header', line: `${timeStr},http://i.880824.xyz:35345/huya/21969336` });
   result.push({ type: 'blank' });

   // 排序顺序：main → liteSortTypes → fullOtherTypes
   const order = [...(config.liteSortTypes || [])];
   if (includeLocal) {
     const extra = config.fullOtherTypes || [];
     for (const t of extra) { if (!order.includes(t)) order.push(t); }
   }
   // 加未在 order 中的分类
   for (const cat of mainChannels) { if (!order.includes(cat.name)) order.push(cat.name); }
   for (const cat of localChannels) { if (!order.includes(cat.name)) order.push(cat.name); }
   if (!order.includes('其他频道')) order.push('其他频道');

  // 需求1：将"原始分组"（来源自带、未匹配模版、且有频道的）加入输出顺序，置于「其他频道」之前
  const originalGroups = Object.keys(classified).filter(cn => {
    const arr = classified[cn];
    return arr && arr.length > 0 && cn !== '其他频道' && !order.includes(cn);
  });
  const otherIdx = order.indexOf('其他频道');
  if (otherIdx >= 0) order.splice(otherIdx, 0, ...originalGroups);
  else order.push(...originalGroups);

   for (const catName of order) {
     const items = classified[catName];
     if (!items || items.length === 0) continue;
     result.push({ type: 'category', name: catName });
     for (const item of items) {
       result.push({ type: 'channel', item });
     }
     result.push({ type: 'blank' });
   }

   // 移除尾部空行
   while (result.length > 0 && result[result.length - 1].type === 'blank') result.pop();

   return { result, epg, logo, timeStr, channelCount };
 }
 
 /** 渲染为 TXT 文本 */
 export function renderAsTxt(entries) {
   const lines = [];
   for (const e of entries) {
     if (e.type === 'header') lines.push(e.line);
     else if (e.type === 'blank') lines.push('');
     else if (e.type === 'category') lines.push(`${e.name},#genre#`);
     else if (e.type === 'channel') lines.push(`${e.item.name},${e.item.url}`);
   }
   return lines.join('\n');
 }
 
 /** 渲染为 M3U 文本 */
 export function renderAsM3u(entries, epgUrl, logoTpl) {
   const lines = [];
   const epgAttr = epgUrl ? ` url-tvg="${epgUrl}"` : '';
   lines.push(`#EXTM3U${epgAttr}`);
   let currentCategory = '';

   for (const e of entries) {
     if (e.type === 'blank') continue;
     if (e.type === 'header') {
       lines.push(`#${e.line}`);
       continue;
     }
     if (e.type === 'category') {
       currentCategory = e.name;
       continue;
     }
     if (e.type === 'channel') {
       const item = e.item;
       const logoUrl = logoTpl ? logoTpl.replace('{}', encodeURIComponent(item.name)) : '';
       const logoAttr = logoUrl ? ` tvg-logo="${logoUrl}"` : '';
       const groupAttr = ` group-title="${currentCategory}"`;
       const tvgName = ` tvg-name="${item.name}"`;
       const tvgId = item.attrLine ? item.attrLine.match(/tvg-id="([^"]*)"/) : null;
       const tvgIdAttr = tvgId ? ` tvg-id="${tvgId[1]}"` : ` tvg-id="${item.name}"`;

       lines.push(`#EXTINF:-1${tvgIdAttr}${tvgName}${logoAttr}${groupAttr},${item.name}`);
       lines.push(item.url);
     }
   }
   return lines.join('\n') + '\n';
 }
 
 /** 检查频道是否在某个主分类中 */
 export function isInMainCategory(channelName, mainChannels) {
   for (const cat of mainChannels) {
     if (cat.channels.includes(channelName)) return true;
   }
   return false;
 }
