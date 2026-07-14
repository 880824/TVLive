 /**
 * KV 配置管理
 */
 
import { DEFAULTS, deepClone, DEFAULT_MAIN_CATEGORIES, DEFAULT_LOCAL_CATEGORIES } from './utils.js';

// ===================== KV Key 常量 =====================
export const KV_KEYS = {
  SETTINGS: 'settings',
  CHANNELS_MAIN: 'channels_main',
   CHANNELS_LOCAL: 'channels_local',
  BLACKLIST: 'blacklist',
  WHITELIST: 'whitelist',
  SPEEDTEST_STATUS: 'speedtest_status',
  LIST_META: 'list_meta'
 };
 
 
 
 // ===================== 配置加载 =====================
 
/** 从 KV 加载全部配置，缺失自动回退默认 */
export async function getConfig(env) {
  let config;
  try {
    const kvConfig = await env.TVLIVE.get(KV_KEYS.SETTINGS, { type: 'json' });
    config = kvConfig ? { ...deepClone(DEFAULTS), ...kvConfig } : deepClone(DEFAULTS);
  } catch (e) { console.error('KV config error:', e); config = deepClone(DEFAULTS); }

  // 迁移：旧版独立的 corrections KV 已并入 nameReplaceRules。
  // 这里把遗留的 corrections 规则折进 nameReplaceRules 后删除旧键，避免老部署丢失自定义纠错。
  try {
    const legacy = await env.TVLIVE.get('corrections', { type: 'json' });
    if (legacy && typeof legacy === 'object' && Object.keys(legacy).length > 0) {
      const nr = config.nameReplaceRules || (config.nameReplaceRules = {});
      for (const [alias, std] of Object.entries(legacy)) {
        if (!std) continue;
        if (!Array.isArray(nr[std])) nr[std] = [];
        const a = String(alias);
        if (!nr[std].some(x => x.toLowerCase() === a.toLowerCase())) nr[std].push(a);
      }
      config.nameReplaceRules = nr;
      await env.TVLIVE.delete('corrections');
    }
  } catch (e) { console.error('KV corrections migration error:', e); }

  return config;
}
 
 /** 保存配置到 KV */
 export async function saveConfig(env, config) {
   await env.TVLIVE.put(KV_KEYS.SETTINGS, JSON.stringify(config));
 }

 // ===================== 恢复默认 =====================
/** 将所有配置（settings / 频道分类）重置为默认值 */
export async function resetToDefaults(env) {
  await Promise.all([
    saveConfig(env, deepClone(DEFAULTS)),
    saveMainChannels(env, deepClone(DEFAULT_MAIN_CATEGORIES)),
    saveLocalChannels(env, deepClone(DEFAULT_LOCAL_CATEGORIES)),
  ]);
}



// ===================== 频道分类 =====================
 
 export async function getMainChannels(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.CHANNELS_MAIN, { type: 'json' });
     if (data) return data;
   } catch (e) { console.error('KV main channels error:', e); }
   return deepClone(DEFAULT_MAIN_CATEGORIES);
 }
 
 export async function saveMainChannels(env, channels) {
   await env.TVLIVE.put(KV_KEYS.CHANNELS_MAIN, JSON.stringify(channels));
 }
 
 export async function getLocalChannels(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.CHANNELS_LOCAL, { type: 'json' });
     if (data) return data;
   } catch (e) { console.error('KV local channels error:', e); }
   return deepClone(DEFAULT_LOCAL_CATEGORIES);
 }
 
 export async function saveLocalChannels(env, channels) {
   await env.TVLIVE.put(KV_KEYS.CHANNELS_LOCAL, JSON.stringify(channels));
 }
 
 // ===================== 黑白名单 =====================
 
 export async function getBlacklist(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.BLACKLIST, { type: 'json' });
     if (data && Array.isArray(data)) return data;
   } catch (e) { console.error('KV blacklist error:', e); }
   return [];
 }
 
 export async function saveBlacklist(env, list) {
   await env.TVLIVE.put(KV_KEYS.BLACKLIST, JSON.stringify(list));
 }
 
 export async function getWhitelist(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.WHITELIST, { type: 'json' });
     if (data && Array.isArray(data)) return data;
   } catch (e) { console.error('KV whitelist error:', e); }
   return [];
 }
 
export async function saveWhitelist(env, list) {
  await env.TVLIVE.put(KV_KEYS.WHITELIST, JSON.stringify(list));
}

// ===================== 黑白名单生成时间 =====================
/** 读取黑白名单最近一次生成时间 { blacklist, whitelist } */
export async function getListMeta(env) {
  try {
    const data = await env.TVLIVE.get(KV_KEYS.LIST_META, { type: 'json' });
    if (data && typeof data === 'object') return data;
  } catch (e) { console.error('KV list meta error:', e); }
  return {};
}

/** 保存黑白名单生成时间（仅在自动测速生成时调用） */
export async function saveListMeta(env, meta) {
  await env.TVLIVE.put(KV_KEYS.LIST_META, JSON.stringify(meta || {}));
}

// ===================== 操作日志 =====================
// 按"天"分键存储，写入时设 7 天 TTL，由 Cloudflare KV 自动过期删除，
// 无需任何清理代码、也不占用免费计划的 Cron 额度。
export const OP_LOG_TTL = 604800; // 7 天（秒）

function opLogKey(dateStr) {
  return 'op_log_' + dateStr;
}

function dayStr(d) {
  d = d || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 写入一条操作日志。
 * @param {object} entry { type:'auto'|'manual', action, detail, ts?, time? }
 * @param {object} [ctx]  可选，传入则使用 ctx.waitUntil 非阻塞写入（推荐在请求处理中用）
 */
export async function appendLog(env, entry, ctx) {
  const key = opLogKey(dayStr());
  let arr = [];
  try {
    const existing = await env.TVLIVE.get(key, { type: 'json' });
    if (Array.isArray(existing)) arr = existing;
  } catch (e) { console.error('read op log error:', e); }

  arr.push({
    ts: entry.ts || new Date().toISOString(),
    time: entry.time || new Date().toLocaleString('zh-CN'),
    type: entry.type || 'manual',
    action: entry.action || '',
    detail: entry.detail || ''
  });

  // 防御性上限：单日最多保留 500 条，避免极端情况下单键无限增长
  if (arr.length > 500) arr = arr.slice(-500);

  const write = env.TVLIVE.put(key, JSON.stringify(arr), { expirationTtl: OP_LOG_TTL });
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(write);
  else await write;
}

/**
 * 读取最近 7 天的操作日志：取最近 7 个日期键合并、按时间倒序、并过滤 >7 天（防御 TTL 未即时生效）。
 */
export async function getLogs(env) {
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(dayStr(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  const results = await Promise.all(dates.map(function (dateStr) {
    return env.TVLIVE.get(opLogKey(dateStr), { type: 'json' }).catch(function () { return null; });
  }));

  let all = [];
  results.forEach(function (arr) { if (Array.isArray(arr)) all = all.concat(arr); });

  all = all.filter(function (x) {
    const t = x.ts ? new Date(x.ts).getTime() : 0;
    return t >= cutoff;
  });
  all.sort(function (a, b) {
    const ta = a.ts ? new Date(a.ts).getTime() : 0;
    const tb = b.ts ? new Date(b.ts).getTime() : 0;
    return tb - ta;
  });
  return all;
}

// ===================== 测速状态 =====================
 
 export async function getSpeedtestStatus(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.SPEEDTEST_STATUS, { type: 'json' });
     if (data) return data;
   } catch (e) { console.error('KV speedtest status error:', e); }
   return null;
 }
 
 export async function saveSpeedtestStatus(env, status) {
   await env.TVLIVE.put(KV_KEYS.SPEEDTEST_STATUS, JSON.stringify(status), { expirationTtl: 86400 });
 }
 
 /** 构建频道名称→分类的查找 Map */
 export function buildCategoryLookup(mainChannels, localChannels) {
   const lookup = {};
   for (const cat of mainChannels) {
     for (const ch of cat.channels) {
       lookup[ch] = { type: 'main', name: cat.name };
     }
   }
   for (const cat of localChannels) {
     for (const ch of cat.channels) {
       lookup[ch] = { type: 'local', name: cat.name };
     }
   }
   return lookup;
 }
