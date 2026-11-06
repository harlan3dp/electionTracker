// Compile first: npm run build:functions. Defaults to attributed, captured XML;
// pass --live to read the real official source. No publication flag is supplied.
const {createRequire}=require('node:module');
const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const {Miniflare,convertV4MiniflareOptions}=createRequire(path.join(root,'package.json'))('miniflare');
const live=process.argv.includes('--live');
(async()=>{
 let requests=0;
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,scriptPath:path.join(root,'.wrangler/functions/index.js'),compatibilityDate:'2026-11-06',outboundService:async request=>{
   if(!request.url.startsWith('https://media.election.net.nz/xml/'))return new Response('Not allowed',{status:403});
   requests++;
   // Workerd doesn't read this sandbox's proxy itself. The supported Node bridge
   // preserves inherited proxy routing and TLS validation; it is test-only.
   if(live)return fetch(request.url,{headers:request.headers,redirect:'manual',signal:AbortSignal.timeout(8000)});
   const file=path.basename(new URL(request.url).pathname);
   return new Response(fs.readFileSync(path.join(root,'tests/fixtures/official-feed',file)),{headers:{'Content-Type':'application/xml'}});
 }}));
 try {
  for(const endpoint of ['/api/results','/api/results','/api/electorates/1']){
    const response=await mf.dispatchFetch('https://local.test'+endpoint);const body=await response.json();
    if(response.status!==200||!['waiting','withheld'].includes(body.status))throw Error(`${endpoint}: unexpected status ${response.status}`);
    console.log(endpoint,response.status,body.status,'upstream requests:',requests);
  }
  if(requests!==6)throw Error('Cache did not reuse national snapshot: '+requests);
  console.log(`Cloudflare isolate + ${live?'live official source':'captured fixture'} + cache reuse PASS`);
 }finally{await mf.dispose()}
})().catch(e=>{console.error(e);process.exit(1)});
