import { getElectorate, json, unavailable } from '../../_lib/feed'
import type { FeedEnv } from '../../_lib/feed'
export async function onRequestGet({env,params}: {env:FeedEnv;params:{id:string}}) {
  if(!/^[1-9]\d{0,2}$/.test(params.id))return Response.json({error:'Invalid electorate ID'},{status:400})
  try { return json(await getElectorate(params.id,env)) } catch (error) { console.warn('Official feed request failed:', error instanceof Error ? error.message.slice(0,160) : 'Unknown error'); return unavailable() }
}
