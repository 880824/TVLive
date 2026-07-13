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
   SPEEDTEST_STATUS: 'speedtest_status'
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
