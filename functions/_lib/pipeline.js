 /**
 * 聚合管道 —— 协调下载、处理、分类、渲染流程
 */
 
 import { downloadM3u, processM3uContent, processTxtContent, detectFormat, mergeAndDeduplicate } from './processor.js';
 import { classifyChannels, generateClassifiedEntries, renderAsTxt, renderAsM3u } from './classifier.js';
 import { getConfig, getMainChannels, getLocalChannels } from './config.js';
 import { deepClone } from './utils.js';
 
 /**
  * 执行完整聚合流水线
  * @returns {Object} { m3u_full, txt_full, m3u_lite, txt_lite, stats, sourceHealth }
  */
 export async function runPipeline(env, { forStatsOnly = false } = {}) {
  const config = await getConfig(env);
  const mainChannels = await getMainChannels(env);
  const localChannels = await getLocalChannels(env);

  // 下载所有启用的订阅源
   const activeSources = (config.m3uList || []).filter(s => s.enabled !== false);
   const sourceHealth = {};
   const allDownloadedItems = [];
 
   for (const source of activeSources) {
     const result = await downloadM3u(source);
     const healthKey = source.name || source.url;
     sourceHealth[healthKey] = {
       status: result.status,
       time: result.time,
       ok: !!result.content
     };

     if (result.content) {
       const format = detectFormat(result.content);
       let items;
       if (format === 'm3u') {
         items = processM3uContent(result.content, config, source.name, source.ua, source.uaToUrl || false);
       } else {
         // TXT 格式
         const txtItems = processTxtContent(result.content, config);
         items = processM3uContent(result.content, config, source.name, source.ua, source.uaToUrl || false);
         if (items.length === 0 && txtItems.length > 0) items = txtItems;
       }

       if (forStatsOnly) {
         allDownloadedItems.push(items);
       } else {
         allDownloadedItems.push({ items, sourceName: healthKey });
       }
     } else if (!forStatsOnly) {
       allDownloadedItems.push({ items: [], sourceName: healthKey });
     }
   }

   if (forStatsOnly) {
     // 仅统计模式：去重 + 按分组计数
     const merged = mergeAndDeduplicate(
       allDownloadedItems.map(its => ({ items: its, sourceName: 'stats' })),
       config
     );
     return { mergedItems: merged, sourceHealth };
   }

   // 完整模式：合并去重
   const merged = mergeAndDeduplicate(allDownloadedItems, config);

   // 归类到分类体系
   const { classified } = classifyChannels(merged, mainChannels, localChannels, config);

   // 生成完整版（含地方台）
   const fullResult = generateClassifiedEntries(classified, mainChannels, localChannels, config, true);
   const txt_full = renderAsTxt(fullResult.result);
   const m3u_full = renderAsM3u(fullResult.result, fullResult.epg, fullResult.logo);

   // 生成精简版（仅主频道）
  // 精简版：主频道 + 原始分组（来源自带、未匹配模版）+ 其他频道；不含地方台
  const liteClassified = {};
  const mainNames = new Set((mainChannels || []).map(c => c.name));
  const localNames = new Set((localChannels || []).map(c => c.name));
  for (const [cat, items] of Object.entries(classified)) {
    if (!items || items.length === 0) continue;
    if (cat === '其他频道' || mainNames.has(cat)) { liteClassified[cat] = items; continue; }
    if (localNames.has(cat)) continue; // 精简版不含地方台
    liteClassified[cat] = items; // 原始分组在精简版也展示
  }

   const liteResult = generateClassifiedEntries(liteClassified, mainChannels, [], config, false);
   const txt_lite = renderAsTxt(liteResult.result);
   const m3u_lite = renderAsM3u(liteResult.result, liteResult.epg, liteResult.logo);

   // 统计数据
   const stats = {};
   for (const [cat, items] of Object.entries(classified)) {
     if (items && items.length > 0) stats[cat] = items.length;
   }

   return {
     m3u_full, txt_full, m3u_lite, txt_lite,
     stats,
     sourceHealth,
     channelCount: fullResult.channelCount,
     timeStr: fullResult.timeStr
   };
 }
 
 /** 仅获取分组统计（轻量模式） */
 export async function getStatsOnly(env) {
   const { mergedItems, sourceHealth } = await runPipeline(env, { forStatsOnly: true });
   const stats = {};
   for (const item of mergedItems) {
     stats[item.group] = (stats[item.group] || 0) + 1;
   }
   return { stats, sourceHealth };
 }
