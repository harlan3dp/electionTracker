import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Development uses the same handlers as Cloudflare Pages, without bundling them
// into the browser. Production /api routes are served by Pages Functions.
function pagesApi(): Plugin {
  return { name:'pages-api-dev', configureServer(server) {
    server.middlewares.use(async(req,res,next)=>{
      const path=(req.url??'').split('?')[0]
      const electorate=/^\/api\/electorates\/([1-9]\d{0,2})$/.exec(path)
      if(path!=='/api/results'&&!electorate)return next()
      if(req.method!=='GET'){res.statusCode=405;res.end();return}
      try {
        const module=await server.ssrLoadModule(electorate?'/functions/api/electorates/[id].ts':'/functions/api/results.ts')
        const response:Response=await module.onRequestGet({env:{RESULTS_PUBLICATION_CONFIRMED:process.env.RESULTS_PUBLICATION_CONFIRMED},params:{id:electorate?.[1]}})
        res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(await response.text())
      }catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({status:'unavailable'}))}
    })
  } }
}
export default defineConfig({ plugins: [react(), tailwindcss(), pagesApi()] })
