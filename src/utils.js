 /**
 * 通用工具函数
 */
 
 // ===================== 默认配置 =====================
 export const DEFAULTS = {
   epgUrl: "https://github.880824.xyz/https://raw.githubusercontent.com/zzq1234567890/epg/master/epgziyong.xml",
   enableEpg: true,
   logoTemplate: "https://github-iptv-manage.880824.xyz/logo/{}.png?token=880824",
   enableLogo: true,
   enableMultiSource: true,
   singleChannelMaxCount: 5,
   responseTimeThreshold: 2000,
   fetchTimeout: 10,
   userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
   speedtestInterval: 3,
   removalList: [
     "「IPV4」","「IPV6」","[ipv6]","[ipv4]","_电信","电信","（HD）","[超清]","高清","超清",
     "-HD","(HK)","AKtv","@","IPV6","🎞️","🎦","[BD]","[VGA]","[HD]","[SD]",
     "(1080p)","(720p)","(480p)","HD","｜","NewTV-","New_"
   ],
   deleteChars: [
     "iHOT-","NewTV-","SiTV-","-HEVC","-50-FPS","-高码","-4K","-主力",
     "-BPTV","-NPTV","-GPTV","-YHYX","-BST","-MCP",
     "咪咕视频_8M1080_","[HD]","[SD]","[BD]","[geo-blocked]","[VGA]"
   ],
   deleteGroups: [
     "4K频道","8K频道","内蒙频道","🎀冰茶公告","咪视界v4","英语体育","列表更新时间",
     "体育回看","冰茶体育","咪视界bc","car","other","國會頻道","game","萌宠","时尚","美食","颜值"
   ],
   channelBlockKeywords: ["购物","CGTN","教育电视"],
   sortOrder: [
     "收藏频道","央视频道","卫视频道","新闻频道","港澳频道","台湾频道",
     "电视剧集","动画剧集","数字频道","地方频道","粤语频道","综艺自然",
     "记录频道","飛速频道","欧飞点播","高清频道","网络综合"
   ],
   liteSortTypes: [
     "收藏频道","央视频道","卫视频道","新闻频道","港台频道","电影频道",
     "剧集频道","综艺频道","NewTV","iHOT","体育频道","咪咕直播",
     "埋堆堆","音乐频道","游戏频道","解说频道"
   ],
   fullOtherTypes: [
     "儿童频道","国际频道","纪录频道","戏曲频道","上海频道","湖南频道",
     "湖北频道","广东频道","浙江频道","山东频道","江苏频道","安徽频道",
     "海南频道","内蒙频道","辽宁频道","陕西频道","山西频道","云南频道",
     "北京频道","重庆频道","福建频道","甘肃频道","广西频道","贵州频道",
     "河北频道","河南频道","黑龙江频道","吉林频道","江西频道","宁夏频道",
     "青海频道","四川频道","天津频道","新疆频道","春晚","直播中国","MTV","收音机频道"
   ],
   provinceGroups: [
     "北京","安徽","甘肃","广东","贵州","海南","河北","河南","黑龙江",
     "湖北","湖南","吉林","江苏","江西","辽宁","青海","山东","上海",
     "四川","福建","云南","浙江","重庆","香港"
   ],
   groupReplaceRules: {
     "央视频道":["央视","GPT-央视","央视-MCP"],
     "卫视频道":["卫视","超清频道","CGTN","CHC","卫视-MCP"],
     "数字频道":["NewTV","NEWTV","SiTV","iHOT","IHOT","数字","付费"],
     "地方频道":["地方","浙江频道","上海频道","广东省","江苏省","湖北省","内蒙频道"],
     "台湾频道":["GPT-台湾","綜合","新聞財經","新聞資訊","熱門收視頻道","港澳台","新闻"],
     "体育频道":["GPT-体育","體育","体育","咪咕TV","運動"],
     "动画剧集":["GPT-儿童","少兒","少儿","少儿频道","卡通‧兒童","兒童","動漫","兒童與青少年"],
     "国外频道":["GPT-印尼","GPT-印度","GPT-新加坡","GPT-泰国","GPT-英国","GPT-马来西亚","综合"],
     "新闻频道":["GPT-新闻","新聞財經","新聞資訊","新聞‧財經","新聞"],
     "电视剧集":["GPT-电影","特色","電影戲劇","戲劇電影","電影","影视","戲劇"],
     "记录频道":["GPT-记录","戲劇、電影與紀錄片","生活旅遊時尚"],
     "香港频道":["GPT-香港"],
     "综艺自然":["探索自然","求索频道","生活旅遊","音樂綜藝","綜藝","综艺","纪实","印象天下","知識","音樂","教育","纪录频道","運動健康生活","综艺频道"],
     "网络原创":["原创IP","原创"],
     "其他频道":["其他","其它","其他-MCP"],
     "飛速频道":["FastTV飛速看"],
     "港澳频道":["mytv"]
   },
   nameReplaceRules: {
     "CCTV1":["CCTV1综合","CCTV-1综合","CCTV1 综合","CCTV-1 综合","CCTV-1","CCTV 1","CCTV1综合频道"],
     "CCTV2":["CCTV2财经","CCTV-2财经","CCTV2 财经","CCTV-2 财经"],
     "CCTV3":["CCTV3综艺","CCTV-3综艺","CCTV3 综艺","CCTV-3 综艺"],
     "CCTV4":["CCTV4国际","CCTV4中文国际","CCTV-4中文国际"],
     "CCTV5":["CCTV5体育","CCTV-5 体育","CCTV5 体育","CCTV-5体育"],
     "CCTV5+":["CCTV5+体育","CCTV-5+ 体育赛事","CCTV5+ 体育赛事","CCTV5+体育赛事","CCTV5p","CCTV5P"],
     "CCTV6":["CCTV6电影","CCTV-6 电影","CCTV6 电影","CCTV-6电影"],
     "CCTV7":["CCTV7国防军事","CCTV7国防","CCTV7军事农业","CCTV7军事","CCTV-7 国防军事"],
     "CCTV8":["CCTV8电视剧","CCTV-8 电视剧","CCTV8 电视剧"],
     "CCTV9":["CCTV9纪录","CCTV9记录","CCTV-9 纪录","CCTV-9纪录"],
     "CCTV10":["CCTV10科教","CCTV-10 科教","CCTV10 科教"],
     "CCTV11":["CCTV11戏曲","CCTV-11 戏曲","CCTV11 戏曲"],
     "CCTV12":["CCTV12法制","CCTV12社会与法","CCTV-12 社会与法"],
     "CCTV13":["CCTV13新闻","CCTV-13 新闻","CCTV13 新闻"],
     "CCTV14":["CCTV14少儿","CCTV少儿","CCTV-14 少儿"],
     "CCTV15":["CCTV15音乐","CCTV-15 音乐","CCTV15 音乐"],
     "CCTV16":["CCTV16奥林匹克","CCTV16奥林","CCTV16 奥林匹克"],
     "CCTV17":["CCTV17农业","CCTV17农村","CCTV-17 农业农村","CCTV-17农业农村","CCTV17农业农村"]
   },
   m3uList: [
     {name:"收藏",url:"https://github-link.880824.xyz/02-live/shoucang.m3u?token=880824",ua:"okhttp/4.12.0",enabled:true,uaToUrl:false},
     {name:"IPTV-Spider",url:"http://i.880824.xyz:50085/sub?20260000=m3u",ua:"okhttp/4.12.0",enabled:true,uaToUrl:false},
     {name:"IPTV Center",url:"http://i.880824.xyz:5022/iptv",ua:"okhttp/4.12.0",enabled:true,uaToUrl:false},
     {name:"Mursor",url:"https://live.ottiptv.cc/iptv.m3u?userid=736511631&sign=b496b70a7430a88cb21aa41eaacd698d278e9eccba15e039a2a2627cb4d71ca42c43064a86f0af6ea3a71e04db00ede4c880623ef16f373f317830896e610d9e31cc7f693761&auth_token=6bd594435c027d25a62d0a407b4e62ec",ua:"okHttp/Mod-1.5.0.0",enabled:false,uaToUrl:true},
     {name:"4GTV-v1",url:"http://i.880824.xyz:5014/m3u8view?token=b4Q6ysy_qAGFKdcv3YGVw4XQrN-3s5WDx6j7opwNuGh7Q5FBISkumdHvw5u-mwcI",ua:"okhttp/4.12.0",enabled:false,uaToUrl:false},
     {name:"Ofiii-Plus",url:"https://github-link.880824.xyz/ofiii.m3u?token=880824",ua:"okhttp/4.12.0",enabled:false,uaToUrl:false},
     {name:"Juli港台",url:"https://ufile.eu.org/juli.php",ua:"okhttp/4.12.0",enabled:true,uaToUrl:false},
     {name:"斗鱼",url:"https://raw.githubusercontent.com/mursor1985/LIVE/refs/heads/main/douyuyqk.m3u",ua:"okhttp/4.12.0",enabled:false,uaToUrl:false},
     {name:"虎牙",url:"https://raw.githubusercontent.com/mursor1985/LIVE/refs/heads/main/huyayqk.m3u",ua:"okhttp/4.12.0",enabled:false,uaToUrl:false},
     {name:"YY轮播",url:"https://raw.githubusercontent.com/mursor1985/LIVE/refs/heads/main/yylunbo.m3u",ua:"okhttp/4.12.0",enabled:false,uaToUrl:false}
   ]
 };
 
 
// ===================== 默认频道分类与纠错规则 =====================
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

// ===================== 通用工具函数 =====================
 
 /** 安全 UTF-8 文本解码 */
 export function decodeText(data) {
   if (!data) return '';
   if (typeof data === 'string') return data;
   try {
     const text = new TextDecoder('utf-8', { fatal: false }).decode(data);
     if (text.includes('�')) {
       return new TextDecoder('gbk', { fatal: false }).decode(data);
     }
     return text;
   } catch { return new TextDecoder('gbk', { fatal: false }).decode(data); }
 }
 
 /** 安全 URL 编码（只编码必要字符） */
 export function safeQuoteUrl(url) {
   try {
     const unquoted = decodeURIComponent(url);
     return encodeURI(unquoted);
   } catch { return url; }
 }
 
 /** 提取 M3U 频道名 */
 export function parseExtInfName(extInfLine) {
   const match = extInfLine.match(/,([^,]+)$/);
   return match ? match[1].trim() : '';
 }
 
 /** 从 EXTINF 中提取属性 */
 export function parseExtInfAttributes(extInfLine) {
   const attrs = {};
   const pattern = /([a-zA-Z0-9-]+)="([^"]*)"/g;
   let m;
   while ((m = pattern.exec(extInfLine)) !== null) {
     attrs[m[1]] = m[2];
   }
   return attrs;
 }
 
 /** 提取 group-title */
 export function extractGroupTitle(extInfLine) {
   const m = extInfLine.match(/group-title="([^"]*)"/);
   return m ? m[1] : '';
 }
 
 /** HTTP 带超时的 fetch */
 export async function fetchWithTimeout(url, options = {}, timeout = 15000) {
   const controller = new AbortController();
   const id = setTimeout(() => controller.abort(), timeout);
   try {
     const res = await fetch(url, { ...options, signal: controller.signal });
     clearTimeout(id);
     return res;
   } catch (error) {
     clearTimeout(id);
     return null;
   }
 }
 
 /** 清洁频道名：移除 REMOVAL_LIST 中的字符串 */
 export function cleanChannelName(name, removalList) {
   if (!name) return '';
   name = name.replace(/\u3000/g, ' ').replace(/[\u200b-\u200f]/g, '').replace(/ /g, '');
   for (const item of removalList || []) {
     name = name.replace(new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
   }
   name = name.replace(/CCTV-?/gi, 'CCTV').replace(/CCTV0/g, 'CCTV');
   name = name.replace(/PLUS/gi, '+').replace(/iHOT-/gi, 'iHOT');
   return name.trim();
 }
 
 /** 清洁 URL：移除 $ 后面的部分 */
 export function cleanUrl(url) {
   if (!url) return '';
   const di = url.lastIndexOf('$');
   return di !== -1 ? url.substring(0, di).trim() : url.trim();
 }
 
 /** 判断是否为浏览器请求 */
 export function isLikelyBrowserRequest(request) {
   const ua = (request.headers.get('User-Agent') || '').toLowerCase();
   const accept = (request.headers.get('Accept') || '').toLowerCase();
   const hasHtml = accept.includes('text/html') ||
     request.headers.has('Sec-Fetch-Mode') || request.headers.has('Sec-Fetch-Dest');
   if (!hasHtml) return false;
   return ua.includes('mozilla/') && (ua.includes('chrome/') || ua.includes('safari') || ua.includes('firefox') || ua.includes('edg/'));
 }
 
 /** 判断是否为 M3U 内容 */
 export function isM3uContent(text) {
   if (!text) return false;
   return text.trim().startsWith('#EXTM3U');
 }
 
 /** M3U 转 TXT 行列表 */
 export function convertM3uToTxt(m3uContent) {
   const lines = m3uContent.split(/\r?\n/).map(l => l.trim()).filter(l => l);
   const result = [];
   let channelName = '';
   for (const line of lines) {
     if (line.startsWith('#EXTM3U')) continue;
     if (line.startsWith('#EXTINF')) {
       channelName = parseExtInfName(line);
     } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('p3p')) {
       if (channelName) result.push(`${channelName},${line}`);
     } else if (!line.includes('#genre#') && line.includes(',') && line.includes('://')) {
       if (/^[^,]+,[^\s]+:\/\/[^\s]+$/.test(line)) result.push(line);
     }
   }
   return result;
 }
 
 /** 深拷贝 */
 export function deepClone(obj) {
   return JSON.parse(JSON.stringify(obj));
 }
 
 /** 检查对象是否为空 */
 export function isEmptyObject(obj) {
   if (!obj) return true;
   for (const k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) return false; }
   return true;
 }
