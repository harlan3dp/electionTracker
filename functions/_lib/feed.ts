import { normalize, normalizeElectorate, STALE_MS } from './normalize'
import { OFFICIAL_SOURCE } from '../../src/results/types'
import type { Snapshot, ElectorateSnapshot } from '../../src/results/types'

export type FeedEnv = { RESULTS_PUBLICATION_CONFIRMED?: string }
export type FeedCache = { match(request: Request): Promise<Response | undefined>; put(request: Request, response: Response): Promise<void> }
type FeedValue = Snapshot | ElectorateSnapshot
export type Dependencies = { fetcher: typeof fetch; now: () => number; cache?: FeedCache }
const inFlight = new Map<string,Promise<FeedValue>>()
function defaults(): Dependencies {
  const storage = globalThis.caches as CacheStorage & { default?: FeedCache } | undefined
  return { fetcher: fetch.bind(globalThis), now: Date.now, cache: storage?.default }
}
async function xml(path: string, dependencies: Dependencies): Promise<string> {
  const response = await dependencies.fetcher(`${OFFICIAL_SOURCE}${path}`, { redirect:'manual', signal:AbortSignal.timeout(8000), headers:{Accept:'application/xml,text/xml'} })
  if (!response.ok || Number(response.headers.get('content-length') ?? 0)>1_000_000) throw new Error('Source unavailable')
  // Bound the actual streamed body too, even if no Content-Length was supplied.
  const reader = response.body?.getReader(); if (!reader) throw new Error('Empty source')
  const chunks: Uint8Array[]=[];let size=0
  while(true) { const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1_000_000){await reader.cancel();throw new Error('Source too large')}chunks.push(value) }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes)
}
async function cached<T extends FeedValue>(key: string, build:()=>Promise<T>, d: Dependencies): Promise<T> {
  // Synthetic internal cache key: never an upstream-request parameter or user URL.
  const request=new Request(`https://election-tracker.internal/${key}`)
  let previous:T|undefined
  try { const hit=await d.cache?.match(request); if(hit)previous=await hit.json() as T } catch { /* Cache failure must not defeat a fresh read. */ }
  const age=previous ? d.now()-Date.parse(previous.fetchedAt) : Infinity
  if(previous && age>=0 && age<60_000)return previous
  const active=inFlight.get(key);if(active)return active as Promise<T>
  const task=(async()=>{
    try {
      const value=await build()
      try { await d.cache?.put(request,new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json','Cache-Control':'max-age=86400'}})) } catch { /* Fresh data remains usable. */ }
      return value
    } catch(error) {
      if(previous && age>=0 && age<=STALE_MS)return {...previous,stale:true,message:'Source refresh failed. Showing the last validated snapshot; do not treat it as current.'}
      throw error
    }
  })()
  inFlight.set(key,task)
  try{return await task as T}finally{inFlight.delete(key)}
}
export function getNational(env: FeedEnv, dependencies=defaults()): Promise<Snapshot> {
  const approved=env.RESULTS_PUBLICATION_CONFIRMED==='2026-preliminary'
  return cached(`national-v1-${approved?'approved':'unapproved'}`,async()=>{
    const paths=['election.xml','statistics.xml','parties.xml','electorates.xml','candidates.xml']
    const values=await Promise.all(paths.map(path=>xml(path,dependencies)))
    return normalize({election:values[0],statistics:values[1],parties:values[2],electorates:values[3],candidates:values[4]},dependencies.now(),approved)
  },dependencies)
}
export function getElectorate(id: string, env:FeedEnv, dependencies=defaults()): Promise<ElectorateSnapshot> {
  if(!/^[1-9]\d{0,2}$/.test(id))return Promise.reject(new Error('Invalid electorate'))
  const approved=env.RESULTS_PUBLICATION_CONFIRMED==='2026-preliminary'
  return cached(`electorate-v1-${id}-${approved?'approved':'unapproved'}`,async()=>{
    const national=await getNational(env,dependencies)
    if(!national.electorates.some(e=>e.id===id))throw new Error('Unknown electorate')
    const padded=id.padStart(2,'0')
    return normalizeElectorate(await xml(`e${padded}/e${padded}.xml`,dependencies),national,id,dependencies.now(),approved)
  },dependencies)
}
export function unavailable() {
  return Response.json({schemaVersion:1,status:'unavailable',source:OFFICIAL_SOURCE,message:'The official feed is unavailable or failed validation. No unverified results are shown.'},{status:503,headers:{'Cache-Control':'no-store'}})
}
export function json(value:FeedValue) {
  return Response.json(value,{headers:{'Cache-Control':value.stale?'no-store':'public, max-age=15, s-maxage=30','X-Content-Type-Options':'nosniff'}})
}
