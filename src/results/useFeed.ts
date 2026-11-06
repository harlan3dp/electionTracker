import { useEffect, useRef, useState } from 'react'
import { OFFICIAL_SOURCE } from './types'
import type { Snapshot, ElectorateSnapshot } from './types'

const object = (value: unknown): value is Record<string,unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const str = (v:unknown):v is string => typeof v==='string' && v.length>0
const num = (v:unknown):v is number => typeof v==='number' && Number.isFinite(v) && v>=0
const date = (v:unknown) => str(v) && Number.isFinite(Date.parse(v))
const stages=['waiting','preliminary','withheld']
function reporting(v:unknown) { return v===null || object(v)&&num(v.counted)&&num(v.total)&&num(v.percentage)&&v.percentage<=100&&v.counted<=v.total }
export function validSnapshot(v:unknown):v is Snapshot {
  if(!object(v)||v.schemaVersion!==1||v.electionYear!==2026||v.source!==OFFICIAL_SOURCE||!date(v.fetchedAt)||!date(v.updatedAt)||!stages.includes(String(v.status))||typeof v.stale!=='boolean'||!str(v.message)||!reporting(v.reporting))return false
  if(!Array.isArray(v.parties)||!v.parties.length||!v.parties.every(p=>object(p)&&str(p.id)&&str(p.name)&&str(p.abbreviation)&&typeof p.registered==='boolean'))return false
  if(!Array.isArray(v.electorates)||!v.electorates.length||!v.electorates.every(e=>object(e)&&str(e.id)&&str(e.name)&&['General','Māori'].includes(String(e.roll))))return false
  if(!Array.isArray(v.candidates)||!v.candidates.every(c=>object(c)&&str(c.id)&&str(c.name)&&str(c.partyId)&&(c.electorateId===null||str(c.electorateId))))return false
  return v.status==='preliminary' ? Array.isArray(v.results)&&v.results.length>0&&v.results.every(p=>object(p)&&str(p.partyId)&&num(p.votes)&&Number.isSafeInteger(p.votes)&&num(p.percentage)&&p.percentage<=100&&v.parties instanceof Array&&v.parties.some(d=>d.id===p.partyId)) : v.results===null
}
function validElectorate(v:unknown,id:string):v is ElectorateSnapshot {
  return object(v)&&v.schemaVersion===1&&v.electorateId===id&&v.source===`${OFFICIAL_SOURCE}e${id.padStart(2,'0')}/e${id.padStart(2,'0')}.xml`&&date(v.fetchedAt)&&date(v.updatedAt)&&stages.includes(String(v.status))&&typeof v.stale==='boolean'&&str(v.message)&&reporting(v.reporting)&&(v.status==='preliminary'?Array.isArray(v.candidates)&&v.candidates.every(c=>object(c)&&str(c.candidateId)&&num(c.votes)&&Number.isSafeInteger(c.votes)):v.candidates===null)
}
export type FeedState<T> = { data:T|null; loading:boolean; error:string|null; refresh:()=>void }
function usePolling<T extends {fetchedAt:string}>(url:string|null,validate:(value:unknown)=>value is T):FeedState<T> {
  const [data,setData]=useState<T|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[revision,setRevision]=useState(0)
  const previousUrl = useRef(url)
  useEffect(()=>{
    let active=true;let controller:AbortController|undefined;let busy=false
    // Reset only when the resource changes; manual retry retains its last snapshot.
    queueMicrotask(() => {
      if (!active) return
      if (previousUrl.current !== url) { setData(null); previousUrl.current = url }
      setError(null); setLoading(Boolean(url))
    })
    if(!url)return () => { active = false }
    const load=async()=>{
      if(busy||document.hidden)return
      busy=true;controller=new AbortController()
      const timeout=setTimeout(()=>controller?.abort(),12_000)
      try {
        const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}})
        if(!response.ok)throw new Error('Feed unavailable')
        const value:unknown=await response.json()
        if(!validate(value))throw new Error('Invalid API response')
        if(active){setData(value);setError(null)}
      }catch{
        if(active){setError('The official feed could not be refreshed. Retry or use the official results website.');setData(previous=>previous&&Date.now()-Date.parse(previous.fetchedAt)<=10*60_000?previous:null)}
      }finally{clearTimeout(timeout);busy=false;if(active)setLoading(false)}
    }
    void load();const timer=setInterval(()=>void load(),60_000)
    const visibility=()=>{if(!document.hidden)void load()}
    document.addEventListener('visibilitychange',visibility)
    return()=>{active=false;controller?.abort();clearInterval(timer);document.removeEventListener('visibilitychange',visibility)}
  // Validation functions are stable module-level functions or captured by URL.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[url,revision])
  return {data,loading,error,refresh:()=>setRevision(r=>r+1)}
}
export function useFeed() { return usePolling<Snapshot>('/api/results',validSnapshot) }
export function useElectorate(id:string|null) { return usePolling<ElectorateSnapshot>(id?`/api/electorates/${id}`:null,(v):v is ElectorateSnapshot=>id!==null&&validElectorate(v,id)) }
export function isStale(data: {stale:boolean;status:string;updatedAt:string;fetchedAt:string}, error: string|null) { return data.stale||Boolean(error)||Date.now()-Date.parse(data.fetchedAt)>2*60_000||(data.status==='preliminary'&&Date.now()-Date.parse(data.updatedAt)>10*60_000) }
export const nzTime=(value:string)=>new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',dateStyle:'medium',timeStyle:'short'}).format(new Date(value))
