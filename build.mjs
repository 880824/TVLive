 /**
 * 构建脚本：将 src/ 下的所有模块打包为 Cloudflare Pages _worker.js
 * 输出到 dist/_worker.js
 */
 import * as esbuild from 'esbuild';
 
 const isWatch = process.argv.includes('--watch');
 
 const config = {
   entryPoints: ['src/index.js'],
   bundle: true,
   format: 'esm',
   outfile: 'dist/_worker.js',
   target: 'es2022',
   minify: true,
   sourcemap: false,
   external: ['__STATIC_CONTENT_MANIFEST'],
 };
 
 if (isWatch) {
   const ctx = await esbuild.context(config);
   await ctx.watch();
   console.log('[build] Watching for changes...');
 } else {
   const result = await esbuild.build(config);
   if (result.errors.length > 0) {
     console.error('[build] Errors:', result.errors);
     process.exit(1);
   }
   console.log('[build] ✓ dist/_worker.js 构建完成');
 }
