import {onRequestGet as national} from '../functions/api/results'
import {onRequestGet as electorate} from '../functions/api/electorates/[id]'
import {onRequestGet as status} from '../functions/api/status'
import type {FeedEnv} from '../lib/results/feed'

type Environment=FeedEnv & {ASSETS:{fetch(request:Request):Promise<Response>}}
// Web APIs only: no Node compatibility shims or generated Pages dispatcher.
const worker = {
 async fetch(request:Request,env:Environment):Promise<Response> {
  const path=new URL(request.url).pathname
  if(!path.startsWith('/api/'))return env.ASSETS.fetch(request)
  if(request.method!=='GET'&&request.method!=='HEAD')return Response.json({error:'Method not allowed'},{status:405,headers:{Allow:'GET, HEAD'}})
  if(path==='/api/results')return national({env})
  if(path==='/api/status')return status({request})
  const match=/^\/api\/electorates\/([^/]+)$/.exec(path)
  if(match)return electorate({env,params:{id:match[1]}})
  return Response.json({error:'Unknown API route'},{status:404})
 }
}

export default worker
