 /**
 * M3U/TXT 下载与处理管道
 */
 
 import {
   fetchWithTimeout, decodeText, isM3uContent, convertM3uToTxt,
   cleanChannelName, cleanUrl, parseExtInfName, parseExtInfAttributes,
   extractGroupTitle
 } from './utils.js';
 
 /** 下载单个订阅源 M3U/TXT 内容 */
 export async function downloadM3u(source) {
   const headers = {
     'User-Agent': source.ua || 'okhttp/3.8.1',
     'Accept': '*/*',
     'Connection': 'keep-alive'
   };
   const start = Date.now();
   try {
     const res = await fetchWithTimeout(source.url, { headers }, 20000);
     const elapsed = Date.now() - start;
     if (res && res.ok) {
       const buf = await res.arrayBuffer();
       const text = decodeText(buf);
       const isHtml = text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('404 Not Found');
       const isJsonError = text.trim().startsWith('{') && (text.includes('"error"') || text.includes('"code"'));
       if (text.length > 0 && !isHtml && !isJsonError) {
         return { content: text, status: res.status, time: elapsed };
       }
       return { content: null, status: res.status, time: elapsed };
     }
     return { content: null, status: res ? res.status : 0, time: elapsed };
   } catch (e) {
     return { content: null, status: 0, time: Date.now() - start };
   }
 }
 
 /** 处理 M3U 内容为结构化频道条目 */
 export function processM3uContent(content, config, sourceName, sourceUa, sourceUaToUrl) {
   if (!content) return [];
   const lines = content.split(/\r?\n/);
   const result = [];
 
   // 构建删除字符正则
   const allDeleteChars = [...(config.deleteChars || []), ...(config.removalList || [])];
   const deleteRegex = allDeleteChars.length > 0
     ? new RegExp(allDeleteChars.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g')
     : null;
 
   // 构建名称查找表
   const nameLookup = {};
   const nameRules = { ...(config.nameReplaceRules || {}) };
   for (const [std, aliases] of Object.entries(nameRules)) {
     if (Array.isArray(aliases)) {
       nameLookup[std.toLowerCase()] = std;
       aliases.forEach(a => { nameLookup[a.toLowerCase()] = std; });
     }
   }
 
   // 构建分组查找表
   const groupLookup = {};
   for (const [std, aliases] of Object.entries(config.groupReplaceRules || {})) {
     if (Array.isArray(aliases)) aliases.forEach(a => { groupLookup[a] = std; });
   }
 
   // 构建屏蔽关键词正则
   const blockRegex = (config.channelBlockKeywords && config.channelBlockKeywords.length > 0)
     ? new RegExp(config.channelBlockKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i')
     : null;
 
   const deleteGroups = config.deleteGroups || [];
   const provinceGroups = config.provinceGroups || [];
   const urlReplaceRules = config.urlReplaceRules || {};
   const removalList = config.removalList || [];
 
   let currentExtInf = null;
   let extraHeaders = [];
 
   for (let i = 0; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue;
 
     if (line.startsWith('#EXTINF')) {
       currentExtInf = line;
       extraHeaders = [];
     } else if (line.startsWith('#')) {
       if (currentExtInf) extraHeaders.push(line);
     } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('p3p')) {
       if (!currentExtInf) {
         // TXT 格式：频道名,URL
         if (line.includes(',')) {
           const parts = line.split(',');
           if (parts.length >= 2 && parts[1].match(/https?:\/\//)) {
             let chName = parts[0].trim();
             let chUrl = cleanUrl(parts.slice(1).join(','));
             chName = cleanChannelName(chName, removalList);
             result.push({ name: chName, url: chUrl, group: '其他频道', sourceName });
           }
         }
         continue;
       }
 
       // M3U 条目处理
       let rawGroup = extractGroupTitle(currentExtInf);
       if (deleteGroups.includes(rawGroup)) { currentExtInf = null; continue; }

       const rawName = parseExtInfName(currentExtInf);
       if (blockRegex && blockRegex.test(rawName)) { currentExtInf = null; continue; }

       // 分组映射
       let newGroup = provinceGroups.includes(rawGroup)
         ? (rawName.includes('卫视') ? '卫视频道' : '地方频道')
         : (groupLookup[rawGroup] || rawGroup || '其他频道');

       // 名称清理
       let cleanedName = rawName;
       if (deleteRegex) cleanedName = cleanedName.replace(deleteRegex, '');
       cleanedName = cleanedName.trim().replace(/CCTV-?/gi, 'CCTV');
       const nameKey = cleanedName.toLowerCase();
       if (nameLookup[nameKey]) cleanedName = nameLookup[nameKey];

       // URL 替换
       let newUrl = line;
       for (const [oldP, newP] of Object.entries(urlReplaceRules)) {
         if (newUrl.startsWith(oldP)) { newUrl = newUrl.replace(oldP, newP); break; }
       }

       // UA 注入头
       if (sourceUaToUrl && sourceUa) {
         const uaVal = sourceUa.includes(':') ? sourceUa.split(':').slice(1).join(':').trim() : sourceUa;
         extraHeaders.push('#EXTVLCOPT:http-user-agent=' + uaVal);
         extraHeaders.push('#KODIPROP:http-user-agent=' + uaVal);
       }

       // 解析 EXTINF 属性
       const attrs = parseExtInfAttributes(currentExtInf);
       ['tvg-id', 'tvg-name'].forEach(attr => {
         if (attrs[attr]) {
           let val = attrs[attr];
           if (deleteRegex) val = val.replace(deleteRegex, '');
           val = val.trim().replace(/CCTV-?/gi, 'CCTV');
           const vk = val.toLowerCase();
           if (nameLookup[vk]) val = nameLookup[vk];
           attrs[attr] = val;
         } else {
           attrs[attr] = cleanedName;
         }
       });
       attrs['group-title'] = newGroup;

       // 重建 EXTINF 行
       let newExtInf = '#EXTINF:-1';
       for (const [key, val] of Object.entries(attrs)) newExtInf += ` ${key}="${val}"`;
       if (!attrs['tvg-logo']) newExtInf += ` tvg-logo=""`;
       newExtInf += `,${cleanedName}`;

       result.push({
         name: cleanedName,
         url: newUrl,
         group: newGroup,
         sourceName: sourceName || '',
         attrLine: newExtInf,
         extraHeaders: [...extraHeaders]
       });
       currentExtInf = null;
       extraHeaders = [];
     }
   }
   return result;
 }
 
 /** 处理 TXT 格式内容（频道名,URL 每行） */
 export function processTxtContent(content, config) {
   if (!content) return [];
   const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
   const result = [];
   const removalList = config.removalList || [];
   let currentGroup = '其他频道';

   for (const line of lines) {
     if (line.includes('#genre#')) {
       currentGroup = line.split(',')[0].trim();
       continue;
     }
     if (!line.includes(',') || !line.includes('://')) continue;
     const parts = line.split(',');
     if (parts.length < 2) continue;
     let chName = parts[0].trim();
     const chUrl = cleanUrl(parts.slice(1).join(','));
     if (!chUrl || !chUrl.match(/^https?:\/\//)) continue;
     chName = cleanChannelName(chName, removalList);
     result.push({ name: chName, url: chUrl, group: currentGroup, sourceName: 'manual' });
   }
   return result;
 }
 
 /** 格式检测：是否为 TXT 格式（非 M3U 但含 #genre# 分类头） */
 export function detectFormat(content) {
   if (!content) return 'unknown';
   if (isM3uContent(content)) return 'm3u';
   if (content.includes('#genre#')) return 'txt';
   // 每行都是 "频道,URL" 格式
   const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l);
   const dataLines = lines.filter(l => !l.startsWith('#'));
   const txtLines = dataLines.filter(l => l.includes(',') && l.includes('://'));
   if (txtLines.length > dataLines.length * 0.3) return 'txt_simple';
   return 'm3u';
 }
 
 /** 处理远程 URL 源：自动检测格式 */
 export function processRemoteUrl(url, config, corrections, categoryLookup) {
   // 此函数在 pipeline 中直接调用 downloadM3u + process
   // 为了统一复用，逻辑在 pipeline.js 中实现
   return { items: [], sourceName: url };
 }
 
 /** 合并多个源的频道条目，去重 */
 export function mergeAndDeduplicate(sourceResults, config) {
   const map = new Map();

   for (const src of sourceResults) {
     if (!src || !src.items) continue;
     for (const item of src.items) {
       const key = item.name;
       if (!map.has(key)) {
         map.set(key, {
           attrLine: item.attrLine || '',
           extraHeaders: item.extraHeaders || [],
           urls: [{ url: item.url, extraHeaders: item.extraHeaders || [] }],
           name: item.name,
           group: item.group,
           sourceNames: [src.sourceName]
         });
       } else {
         const existing = map.get(key);
         if (!existing.urls.some(u => u.url === item.url)) {
           existing.urls.push({ url: item.url, extraHeaders: item.extraHeaders || [] });
           existing.sourceNames.push(src.sourceName);
         }
       }
     }
   }

   const result = [];
   const maxCount = config.singleChannelMaxCount || 5;
   for (const entry of map.values()) {
     let urls = entry.urls;
     // 单频道源数量限制
     if (maxCount > 0 && urls.length > maxCount) {
       urls = urls.slice(0, maxCount);
     }

     if (config.enableMultiSource !== false && urls.length > 1) {
       const lines = urls.map(u => [...(u.extraHeaders || []), entry.attrLine, u.url].join('\n'));
       result.push({
         name: entry.name,
         url: urls[0].url,
         group: entry.group,
         fullEntry: lines.join('\n'),
         backupCount: urls.length - 1,
         sourceNames: entry.sourceNames
       });
     } else {
       const first = urls[0];
       const lines = [...(first.extraHeaders || []), entry.attrLine, first.url];
       result.push({
         name: entry.name,
         url: first.url,
         group: entry.group,
         fullEntry: lines.join('\n'),
         backupCount: 0,
         sourceNames: [entry.sourceNames[0]]
       });
     }
   }
   return result;
 }
 
 /** 按 group 和 sortOrder 排序 */
 export function sortItems(items, config) {
   const groups = {};
   items.forEach(item => {
     if (!groups[item.group]) groups[item.group] = [];
     groups[item.group].push(item);
   });
   let result = [];
   (config.sortOrder || []).forEach(g => {
     if (groups[g]) {
       result = result.concat(groups[g].sort((a, b) => a.name.localeCompare(b.name, 'zh')));
       delete groups[g];
     }
   });
   Object.keys(groups).sort().forEach(g => {
     result = result.concat(groups[g].sort((a, b) => a.name.localeCompare(b.name, 'zh')));
   });
   return result;
 }
