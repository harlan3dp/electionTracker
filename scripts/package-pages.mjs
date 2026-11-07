import {build} from 'esbuild'
import {readFileSync,writeFileSync} from 'node:fs'

// Keep this Web-only artifact independent of Wrangler's injected Node shims.
// In particular, do not retain function names through class static initializers:
// the hosted Pages compilation path failed in __name(this, ...) at startup.
await build({
 entryPoints:['cloudflare/worker.ts'],outfile:'dist/_worker.js',bundle:true,
 format:'esm',platform:'browser',target:'es2020',keepNames:false,
 conditions:['worker','browser'],legalComments:'none',
})
const worker=readFileSync('dist/_worker.js','utf8')
if(worker.includes('__name')||worker.includes('unenv/')||/static\s*\{/.test(worker))throw Error('Unsafe Worker initializer or Node shim returned')
writeFileSync('dist/_routes.json',JSON.stringify({version:1,include:['/api/*'],exclude:[]},null,2))
