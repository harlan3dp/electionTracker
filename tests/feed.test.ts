import { describe,it,expect,vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalize,normalizeElectorate,RELEASE,timestamp } from '../functions/_lib/normalize'
import { getNational,getElectorate } from '../functions/_lib/feed'
import type { XmlFiles } from '../functions/_lib/normalize'
import type { FeedCache } from '../functions/_lib/feed'
const fixture=(name:string)=>readFileSync(new URL(`./fixtures/official-feed/${name}.xml`,import.meta.url),'utf8')
const files:XmlFiles={election:fixture('election'),statistics:fixture('statistics'),parties:fixture('parties'),electorates:fixture('electorates'),candidates:fixture('candidates')}
const now=Date.parse('2026-11-06T18:00:00+13:00')
function positive(updated='2026-11-07T19:05:00'):XmlFiles {
  let election=files.election.replaceAll('2026-11-06T16:19:53',updated)
  election=election.replace('<total_voting_places_counted>0</total_voting_places_counted>','<total_voting_places_counted>1</total_voting_places_counted>').replace('<percent_voting_places_counted>0.0</percent_voting_places_counted>','<percent_voting_places_counted>0.04</percent_voting_places_counted>')
  election=election.replace('<total_votes_cast>0</total_votes_cast>','<total_votes_cast>100</total_votes_cast>')
  election=election.replace('<votes>0</votes>','<votes>100</votes>').replace('<percent_votes>0</percent_votes>','<percent_votes>100</percent_votes>')
  return {...files,election}
}
describe('observed official XML, not an invented schema',()=>{
  it('loads all source directories and retains zero counts as waiting, not zero support',()=>{
    const s=normalize(files,now)
    expect(s.status).toBe('waiting');expect(s.results).toBeNull()
    expect(s.parties).toHaveLength(36);expect(s.parties.filter(p=>p.registered)).toHaveLength(17)
    expect(s.electorates).toHaveLength(71);expect(s.electorates.filter(e=>e.roll==='Māori')).toHaveLength(7)
    expect(s.candidates).toHaveLength(530);expect(s.updatedAt).toBe('2026-11-06T03:19:53.000Z')
    const e=normalizeElectorate(fixture('e01'),s,'1',now)
    expect(e.status).toBe('waiting');expect(e.candidates).toBeNull() // upstream final="true" is not certification
  })
  it('requires both release time and explicit publication confirmation',()=>{
    expect(normalize(positive('2026-11-06T16:19:53'),now,true).status).toBe('withheld')
    expect(normalize(positive(),RELEASE+6*60_000).status).toBe('withheld')
    expect(normalize(positive(),RELEASE+6*60_000).results).toBeNull()
    expect(()=>normalize({...positive(),election:positive().election.replace('<total_votes_cast>100','<total_votes_cast>0')},RELEASE+6*60_000,true)).toThrow()
    const s=normalize(positive(),RELEASE+6*60_000,true)
    expect(s.status).toBe('preliminary');expect(s.results?.[0].votes).toBe(100)
    expect(s.reporting?.percentage).toBe(0.04)
    expect(normalize(positive(),RELEASE+20*60_000,true).stale).toBe(true)
  })
  it('rejects malformed, dangerous, negative, duplicate, inconsistent and future data',()=>{
    for(const election of [files.election.replace('<votes>0</votes>','<votes>-1</votes>'),files.election.replace('p_no="68"','p_no="5"'),files.election.replace('2026-11-06T16:19:53','2023-11-06T16:19:53'),files.election.replace('<election ', '<election test="true" '),'<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]>'+files.election,files.election.slice(0,80)])expect(()=>normalize({...files,election},now)).toThrow()
    expect(()=>normalize({...files,statistics:files.statistics.replace('<total_candidates>530','<total_candidates>529')},now)).toThrow()
    expect(()=>timestamp('2026-11-31T10:00:00',Date.parse('2026-12-10T00:00Z'))).toThrow()
    expect(()=>timestamp('2026-11-06T19:00:00',now)).toThrow()
  })
  it('rejects an electorate identity mismatch and candidate ID mismatch',()=>{
    const s=normalize(files,now)
    expect(()=>normalizeElectorate(fixture('e01'),s,'2',now)).toThrow()
    expect(()=>normalizeElectorate(fixture('e01').replace('c_no="276"','c_no="999999"'),s,'1',now)).toThrow()
  })
})
describe('cached backend',()=>{
  function setup(){
    let clock=now;const store=new Map<string,Response>()
    const cache:FeedCache={match:async r=>store.get(r.url)?.clone(),put:async(r,s)=>{store.set(r.url,s)}}
    const fetcher=vi.fn(async(url:RequestInfo|URL)=>{
      const path=String(url).split('/').at(-1)!.replace('.xml','')
      return new Response(fixture(path))
    }) as unknown as typeof fetch & ReturnType<typeof vi.fn>
    return {d:{fetcher,cache,now:()=>clock},fetcher,advance:(ms:number)=>{clock+=ms}}
  }
  it('coalesces requests, caches per minute and keeps a bounded stale fallback',async()=>{
    const {d,fetcher,advance}=setup()
    const [a,b]=await Promise.all([getNational({},d),getNational({},d)])
    expect(a).toEqual(b);expect(fetcher).toHaveBeenCalledTimes(5)
    await getNational({},d);expect(fetcher).toHaveBeenCalledTimes(5)
    advance(61_000);fetcher.mockRejectedValue(new Error('offline'))
    expect((await getNational({},d)).stale).toBe(true)
    advance(11*60_000);await expect(getNational({},d)).rejects.toThrow()
  })
  it('separates approved/unapproved caches and refuses invalid route IDs',async()=>{
    const {d,fetcher}=setup()
    await getNational({},d);await getNational({RESULTS_PUBLICATION_CONFIRMED:'2026-preliminary'},d)
    expect(fetcher).toHaveBeenCalledTimes(10)
    await expect(getElectorate('../x',{},d)).rejects.toThrow();expect(fetcher).toHaveBeenCalledTimes(10)
    expect((await getElectorate('1',{},d)).status).toBe('waiting')
  })
  it('rejects HTML errors and oversized bodies rather than serving unvalidated data',async()=>{
    const {d,fetcher}=setup();fetcher.mockResolvedValue(new Response('<html>error</html>'))
    await expect(getNational({},d)).rejects.toThrow()
    fetcher.mockImplementation(async()=>new Response('x'.repeat(1_000_001)))
    await expect(getNational({},d)).rejects.toThrow()
  })
})
