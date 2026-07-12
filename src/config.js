 /**
 * KV 配置管理
 */
 
 import { DEFAULTS, deepClone } from './utils.js';
 
 // ===================== KV Key 常量 =====================
 export const KV_KEYS = {
   SETTINGS: 'settings',
   CORRECTIONS: 'corrections',
   CHANNELS_MAIN: 'channels_main',
   CHANNELS_LOCAL: 'channels_local',
   BLACKLIST: 'blacklist',
   WHITELIST: 'whitelist',
   SPEEDTEST_STATUS: 'speedtest_status'
 };
 
 // ===================== 默认频道分类 =====================
 export const DEFAULT_MAIN_CATEGORIES = [
   { name: "收藏频道", channels: [] },
   { name: "央视频道", channels: ["CCTV1","CCTV2","CCTV3","CCTV4","CCTV5","CCTV5+","CCTV6","CCTV7","CCTV8","CCTV9","CCTV10","CCTV11","CCTV12","CCTV13","CCTV14","CCTV15","CCTV16","CCTV17","CCTV4K","CCTV8K","CETV1","CETV2","CETV3","CETV4"] },
   { name: "卫视频道", channels: ["湖南卫视","浙江卫视","江苏卫视","东方卫视","北京卫视","深圳卫视","广东卫视","东南卫视","辽宁卫视","天津卫视","山东卫视","安徽卫视","湖北卫视","四川卫视","重庆卫视","江西卫视","黑龙江卫视","河南卫视","河北卫视","贵州卫视","云南卫视","广西卫视","山西卫视","吉林卫视","陕西卫视","甘肃卫视","宁夏卫视","青海卫视","新疆卫视","西藏卫视","内蒙古卫视","海南卫视","厦门卫视","大湾区卫视","旅游卫视"] },
   { name: "体育频道", channels: [] },
   { name: "电影频道", channels: [] },
   { name: "剧集频道", channels: [] },
   { name: "港台频道", channels: [] },
   { name: "新闻频道", channels: [] },
   { name: "国际频道", channels: [] },
   { name: "纪录频道", channels: [] },
   { name: "戏曲频道", channels: [] },
   { name: "解说频道", channels: [] },
   { name: "春晚", channels: [] },
   { name: "NewTV", channels: [] },
   { name: "iHOT", channels: [] },
   { name: "儿童频道", channels: [] },
   { name: "综艺频道", channels: [] },
   { name: "埋堆堆", channels: [] },
   { name: "音乐频道", channels: [] },
   { name: "游戏频道", channels: [] },
   { name: "收音机频道", channels: [] },
   { name: "直播中国", channels: [] },
   { name: "MTV", channels: [] },
   { name: "咪咕直播", channels: [] }
 ];
 
 export const DEFAULT_LOCAL_CATEGORIES = [
   "上海频道","浙江频道","江苏频道","广东频道","湖南频道","安徽频道",
   "海南频道","内蒙频道","湖北频道","辽宁频道","陕西频道","山西频道",
   "山东频道","云南频道","北京频道","重庆频道","福建频道","甘肃频道",
   "广西频道","贵州频道","河北频道","河南频道","黑龙江频道","吉林频道",
   "江西频道","宁夏频道","青海频道","四川频道","天津频道","新疆频道"
 ].map(name => ({ name, channels: [] }));
 
 // ===================== 配置加载 =====================
 
 /** 从 KV 加载全部配置，缺失自动回退默认 */
 export async function getConfig(env) {
   try {
     const kvConfig = await env.TVLIVE.get(KV_KEYS.SETTINGS, { type: 'json' });
     if (kvConfig) return { ...deepClone(DEFAULTS), ...kvConfig };
   } catch (e) { console.error('KV config error:', e); }
   return deepClone(DEFAULTS);
 }
 
 /** 保存配置到 KV */
 export async function saveConfig(env, config) {
   await env.TVLIVE.put(KV_KEYS.SETTINGS, JSON.stringify(config));
 }
 
 // ===================== 纠错规则 =====================
 
 /** 默认纠错规则（从 corrections_name.txt 提取的核心规则） */
 export const DEFAULT_CORRECTIONS = {
   "CCTV1综合":"CCTV1","CCTV-1综合":"CCTV1","CCTV1 综合":"CCTV1","CCTV-1":"CCTV1","CCTV1综合频道":"CCTV1",
   "CCTV1HD":"CCTV1","CCTV1高清":"CCTV1","CCTV1综合HD":"CCTV1","CCTV1综合高清":"CCTV1",
   "CCTV2财经":"CCTV2","CCTV-2财经":"CCTV2","CCTV-2":"CCTV2","CCTV2HD":"CCTV2","CCTV2高清":"CCTV2","CCTV2财经HD":"CCTV2","CCTV2财经高清":"CCTV2",
   "CCTV3综艺":"CCTV3","CCTV-3综艺":"CCTV3","CCTV-3":"CCTV3","CCTV3HD":"CCTV3","CCTV3高清":"CCTV3","CCTV3综艺HD":"CCTV3","CCTV3综艺高清":"CCTV3",
   "CCTV4国际":"CCTV4","CCTV4中文国际":"CCTV4","CCTV-4中文国际":"CCTV4","CCTV-4":"CCTV4","CCTV4HD":"CCTV4","CCTV4高清":"CCTV4","CCTV4国际HD":"CCTV4","CCTV4国际高清":"CCTV4",
   "CCTV4欧洲":"CCTV4欧洲","CCTV-4 (欧洲)":"CCTV4欧洲","CCTV4 (欧洲)":"CCTV4欧洲",
   "CCTV4美洲":"CCTV4美洲","CCTV-4 (美洲)":"CCTV4美洲","CCTV4 (美洲)":"CCTV4美洲",
   "CCTV5体育":"CCTV5","CCTV-5 体育":"CCTV5","CCTV5 体育":"CCTV5","CCTV-5":"CCTV5","CCTV5HD":"CCTV5","CCTV5高清":"CCTV5","CCTV5体育HD":"CCTV5","CCTV5体育高清":"CCTV5",
   "CCTV5+体育":"CCTV5+","CCTV-5+ 体育赛事":"CCTV5+","CCTV5+ 体育赛事":"CCTV5+","CCTV5+体育赛事":"CCTV5+","CCTV5p":"CCTV5+","CCTV5P":"CCTV5+","CCTV-5+":"CCTV5+",
   "CCTV6电影":"CCTV6","CCTV-6 电影":"CCTV6","CCTV6 电影":"CCTV6","CCTV-6":"CCTV6","CCTV6HD":"CCTV6","CCTV6高清":"CCTV6","CCTV6电影HD":"CCTV6","CCTV6电影高清":"CCTV6",
   "CCTV7国防军事":"CCTV7","CCTV7国防":"CCTV7","CCTV7军事农业":"CCTV7","CCTV7军事":"CCTV7","CCTV-7 国防军事":"CCTV7","CCTV-7":"CCTV7","CCTV7HD":"CCTV7","CCTV7高清":"CCTV7","CCTV7国防军事HD":"CCTV7",
   "CCTV8电视剧":"CCTV8","CCTV-8 电视剧":"CCTV8","CCTV8 电视剧":"CCTV8","CCTV-8":"CCTV8","CCTV8HD":"CCTV8","CCTV8高清":"CCTV8","CCTV8电视剧HD":"CCTV8","CCTV8电视剧高清":"CCTV8",
   "CCTV9纪录":"CCTV9","CCTV9 纪录":"CCTV9","CCTV9记录":"CCTV9","CCTV-9 纪录":"CCTV9","CCTV-9":"CCTV9","CCTV9HD":"CCTV9","CCTV9高清":"CCTV9","CCTV9纪录HD":"CCTV9","CCTV9记录HD":"CCTV9",
   "CCTV10科教":"CCTV10","CCTV-10 科教":"CCTV10","CCTV10 科教":"CCTV10","CCTV-10":"CCTV10","CCTV10HD":"CCTV10","CCTV10高清":"CCTV10","CCTV10科教HD":"CCTV10",
   "CCTV11戏曲":"CCTV11","CCTV-11 戏曲":"CCTV11","CCTV11 戏曲":"CCTV11","CCTV-11":"CCTV11","CCTV11HD":"CCTV11","CCTV11高清":"CCTV11","CCTV11戏曲HD":"CCTV11",
   "CCTV12法制":"CCTV12","CCTV12社会与法":"CCTV12","CCTV12 社会与法":"CCTV12","CCTV-12 社会与法":"CCTV12","CCTV-12":"CCTV12","CCTV12HD":"CCTV12","CCTV12高清":"CCTV12","CCTV12法制HD":"CCTV12","CCTV12社会与法HD":"CCTV12",
   "CCTV13新闻":"CCTV13","CCTV-13 新闻":"CCTV13","CCTV13 新闻":"CCTV13","CCTV-13":"CCTV13","CCTV13HD":"CCTV13","CCTV13高清":"CCTV13","CCTV13新闻HD":"CCTV13",
   "CCTV14少儿":"CCTV14","CCTV14 少儿":"CCTV14","CCTV少儿":"CCTV14","CCTV-14 少儿":"CCTV14","CCTV-14":"CCTV14","CCTV14HD":"CCTV14","CCTV14高清":"CCTV14","CCTV14少儿HD":"CCTV14","CCTV少儿HD":"CCTV14",
   "CCTV15音乐":"CCTV15","CCTV15 音乐":"CCTV15","CCTV-15 音乐":"CCTV15","CCTV-15":"CCTV15","CCTV15HD":"CCTV15","CCTV15高清":"CCTV15","CCTV15音乐HD":"CCTV15",
   "CCTV16奥林匹克":"CCTV16","CCTV16 奥林匹克":"CCTV16","CCTV16奥林":"CCTV16","CCTV-16":"CCTV16","CCTV16HD":"CCTV16","CCTV16高清":"CCTV16","CCTV16奥林HD":"CCTV16",
   "CCTV17农业":"CCTV17","CCTV17农村":"CCTV17","CCTV-17 农业农村":"CCTV17","CCTV17 农业农村":"CCTV17","CCTV-17":"CCTV17","CCTV17HD":"CCTV17","CCTV17高清":"CCTV17","CCTV17农业HD":"CCTV17","CCTV17农村HD":"CCTV17",
   "CCTV4K":"CCTV4K","CCTV8K":"CCTV8K",
   "中国教育":"CETV1","中教一台":"CETV1","CETV1HD":"CETV1","CETV1高清":"CETV1",
   "中教二台":"CETV2","CETV2HD":"CETV2","CETV2高清":"CETV2",
   "湖南卫视HD":"湖南卫视","湖南卫视高清":"湖南卫视",
   "浙江卫视HD":"浙江卫视","浙江卫视高清":"浙江卫视",
   "江苏卫视HD":"江苏卫视","江苏卫视高清":"江苏卫视",
   "东方卫视HD":"东方卫视","东方卫视高清":"东方卫视","上海卫视":"东方卫视","上海卫视HD":"东方卫视","上海卫视高清":"东方卫视",
   "深圳卫视HD":"深圳卫视","深圳卫视高清":"深圳卫视",
   "北京卫视HD":"北京卫视","北京卫视高清":"北京卫视",
   "翡翠台B":"翡翠台","无线翡翠台":"翡翠台","香港 翡翠台":"翡翠台","TVB翡翠台":"翡翠台","TVB 翡翠台":"翡翠台",
   "翡翠台HD":"翡翠台","翡翠台高清":"翡翠台",
   "明珠台":"明珠台","TVB明珠台":"明珠台","TVB 明珠台":"明珠台","无线明珠台":"明珠台",
   "凤凰中文":"凤凰中文","凤凰卫视":"凤凰中文",
   "凤凰资讯":"凤凰资讯","凤凰香港":"凤凰香港","星空卫视":"星空卫视"
 };
 
 export async function getCorrections(env) {
   try {
     const data = await env.TVLIVE.get(KV_KEYS.CORRECTIONS, { type: 'json' });
     if (data) return data;
   } catch (e) { console.error('KV corrections error:', e); }
   return { ...DEFAULT_CORRECTIONS };
 }
 
 export async function saveCorrections(env, corrections) {
   await env.TVLIVE.put(KV_KEYS.CORRECTIONS, JSON.stringify(corrections));
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
