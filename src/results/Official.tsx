import { useState } from 'react'
import type { FeedState } from './useFeed'
import type { Snapshot } from './types'
import { useElectorate,isStale,nzTime } from './useFeed'
import { formatNumber, parties as demoParties } from '../demo'
import { electorates as referenceElectorates,normalizeSearch } from '../electorates'
import { coastPaths,project } from '../geography'
import { Icon } from '../Icons'
export type NationalState=FeedState<Snapshot>
export function color(name:string){
  const aliases:Record<string,string>={'act new zealand':'ACT','national party':'National','labour party':'Labour','new zealand national party':'National','new zealand labour party':'Labour','green party':'Green','green party of aotearoa new zealand':'Green','new zealand first party':'NZ First'}
  const canonical=aliases[normalizeSearch(name)]??name
  return demoParties.find(p=>normalizeSearch(p.name)===normalizeSearch(canonical))?.color??'#64736c'
}
export function FeedNotice({feed}:{feed:NationalState}) {
  const s=feed.data
  const stale=s?isStale(s,feed.error):false
  const state=s?stale?'Stale snapshot':s.status==='preliminary'?'Preliminary results':s.status==='withheld'?'Withheld':'Awaiting results':feed.loading?'Connecting':'Unavailable'
  const message=s?stale?'Updates delayed. Showing an older snapshot.':s.status==='preliminary'?'Preliminary results are being received.':s.status==='withheld'?'Results are withheld pending verification.':'Awaiting official results. The feed is connected.':feed.loading?'Connecting to official results.':'Official results are temporarily unavailable.'
  return <section className={`feed-notice concise-feed ${stale||(!s&&!feed.loading)?'feed-attention':''}`} aria-label="Election result status">
    <div className="feed-message" role="status"><Icon name={stale||(!s&&!feed.loading)?'info':'clock'}/><div><strong>{message}</strong>{s&&<p>Last successful check <time dateTime={s.fetchedAt}>{nzTime(s.fetchedAt)} NZ time</time></p>}</div></div>
    <div className="feed-actions"><span className="tag">{state}</span><a href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Official results <Icon name="external"/><span className="sr-only"> (opens in a new tab)</span></a></div>
    <details className="feed-diagnostics"><summary>Feed details</summary><p>{s?.message??feed.error??'Connecting to the Electoral Commission feed.'}</p>{s&&<p>Source updated {nzTime(s.updatedAt)} NZ time. Checked every 60 seconds while visible.</p>}{feed.error&&s&&<p>{feed.error}</p>}<button className="text-button" disabled={feed.loading} onClick={feed.refresh}><Icon name="refresh"/>{feed.loading?'Connecting…':'Retry feed'}</button><a href="#sources">Sources & methodology</a></details>
  </section>
}
export function OfficialParties({feed,compact=false}:{feed:NationalState;compact?:boolean}) {
  const [query,setQuery]=useState(''),[scope,setScope]=useState('all')
  const s=feed.data
  const filtered=s?.parties.filter(p=>normalizeSearch(p.name).includes(normalizeSearch(query))&&(scope==='all'||p.registered))??[]
  return <section className="party-details"><h2>Party directory</h2>{!compact&&<FeedNotice feed={feed}/>}<p className="tiny">Names and registration status supplied by the Electoral Commission.</p><div className="explorer-tools"><label>Search party names<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a party"/></label><label>Show<select aria-label="Party scope" value={scope} onChange={e=>setScope(e.target.value)}><option value="all">All source party entries</option><option value="registered">Registered parties only</option></select></label></div><p className="tiny" aria-live="polite">{s?`${filtered.length} source party entries`:'Party directory unavailable'}</p><ul className="party-directory">{filtered.map(p=><li key={p.id}><span className="party-dot" style={{backgroundColor:color(p.name)}}/><strong>{p.name}</strong><span>{p.registered?'Registered in source':'Not registered in source'} · {p.abbreviation}</span></li>)}</ul>{s&&!filtered.length&&<p>No matching parties. Try a shorter search.</p>}</section>
}
export function OfficialElectorates({feed,compact=false}:{feed:NationalState;compact?:boolean}) {
  const [query,setQuery]=useState(''),[roll,setRoll]=useState('All'),[selection,setSelection]=useState('1')
  const s=feed.data
  const filtered=s?.electorates.filter(e=>normalizeSearch(e.name).includes(normalizeSearch(query))&&(roll==='All'||e.roll===roll))??[]
  const selected=filtered.find(e=>e.id===selection)??filtered[0]
  const local=useElectorate(selected?.id??null)
  // An in-flight response for the previous electorate must never label the new one.
  const localData=local.data?.electorateId===selected?.id?local.data:null
  const candidates=s?.candidates.filter(c=>c.electorateId===selected?.id)??[]
  const values=localData?.candidates
  const leaderVotes=values?.length?Math.max(...values.map(c=>c.votes)):0
  const markers=filtered.flatMap(e=>{
    const reference=referenceElectorates.find(r=>normalizeSearch(r.name)===normalizeSearch(e.name))
    return reference?[{...e,longitude:reference.longitude,latitude:reference.latitude}]:[]
  })
  return <section className="electorate-section-content">
    <div className="section-heading"><h2>Electorates</h2><span className="tiny">General & Māori rolls</span></div>
    {!compact&&<FeedNotice feed={feed}/>}
    <div className="electorate-filters"><label className="directory-search">Find an electorate<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search electorates"/></label>
    <div className="layer-switch" role="group" aria-label="Electorate roll">{['All','General','Māori'].map(r=><button key={r} aria-pressed={roll===r} onClick={()=>setRoll(r)}>{r==='All'?'Both rolls':r}</button>)}</div></div>
    <p className="tiny" aria-live="polite">{s?`${filtered.length} electorates match`:'Electorate directory unavailable'}</p>
    <div className="local-results-grid"><div className="electorate-list" aria-label="Select an electorate">{filtered.map(e=><button key={e.id} aria-pressed={selected?.id===e.id} onClick={()=>setSelection(e.id)}><span>{e.name}</span><span className="list-leader">{e.roll}</span></button>)}</div>
    {selected?<div className="candidate-details"><h3>{selected.name}</h3><p className="leading-note" role="status">{localData?isStale(localData,local.error)?'Stale electorate snapshot.':localData.status==='preliminary'?'Preliminary candidate votes.':localData.status==='withheld'?'Candidate figures withheld.':'Candidate votes not yet published.':local.loading?'Loading candidate votes…':'Candidate votes unavailable.'}</p>
      {localData&&<p className="tiny">Updated {nzTime(localData.updatedAt)} NZ time{localData.reporting&&localData.reporting.total>0?` · ${localData.reporting.counted} / ${localData.reporting.total} voting places`:''}</p>}
      {local.error&&<button className="text-button" onClick={local.refresh}>Retry electorate feed</button>}
      <ul>{[...candidates].sort((a,b)=>(values?.find(v=>v.candidateId===b.id)?.votes??0)-(values?.find(v=>v.candidateId===a.id)?.votes??0)||a.name.localeCompare(b.name)).map(c=>{
        const count=values?.find(v=>v.candidateId===c.id)?.votes
        const name=s?.parties.find(p=>p.id===c.partyId)?.name??'No party listed in source'
        return <li key={c.id}><span><strong>{c.name}</strong><small><span className="party-dot" style={{backgroundColor:color(name)}}/>{name}</small>{count!==undefined&&leaderVotes>0&&count===leaderVotes&&<small>Leading count · no winner declared</small>}</span><strong>{count===undefined?'—':formatNumber(count)}<small className={count===undefined?'sr-only':undefined}>{count===undefined?'Not published':'votes'}</small></strong></li>
      })}</ul>
      <p className="tiny">Preliminary counts; no winner declared. Missing counts are not zero votes.</p>
    </div>:s?<div className="empty-state"><h3>No matching electorates</h3><button onClick={()=>{setQuery('');setRoll('All')}}>Clear filters</button></div>:<p className="tiny">Use the official results link above while the directory is unavailable.</p>}
    </div>
    <details className="electorate-map-details"><summary>Map & coverage</summary><div className="geographic-view"><h3>Across Aotearoa</h3><p className="tiny">{markers.length} of {filtered.length} matches have approximate anchors. Use the list for full coverage. Markers are not boundaries; Māori and general geography overlaps. Te Tai Tonga spans both islands.</p>
      <div className="electorate-map" role="group" aria-label="Source electorate selector"><svg className="nz-coast" viewBox="0 0 360 570" role="img" aria-label="New Zealand coastline"><title>Natural Earth coastline</title>{coastPaths.map((path,i)=><path key={i} d={path} fillRule="evenodd"/>)}</svg>{markers.map(e=>{
        const p=project(e.longitude,e.latitude)
        return <button key={e.id} className="map-point" style={{left:`${p.x/360*100}%`,top:`${p.y/570*100}%`,'--marker-color':'#64736c'} as React.CSSProperties} aria-label={`${e.name}, ${e.roll} electorate`} aria-pressed={selected?.id===e.id} onClick={()=>setSelection(e.id)}><span>{e.name}</span></button>
      })}</div><p className="map-credit">Natural Earth · Public domain · Offshore islands omitted. Neutral markers do not indicate winners.</p></div></details>
  </section>
}
export function OfficialInsights({feed,compact=false}:{feed:NationalState;compact?:boolean}) {
  const s=feed.data;const sorted=s?.results?[...s.results].sort((a,b)=>b.votes-a.votes):null
  const first=sorted?.[0],second=sorted?.[1]
  const tied=first&&second&&first.votes===second.votes
  return <section><h2>Count analysis</h2>{!compact&&<FeedNotice feed={feed}/>}{first&&second&&s?<><p className="analysis-answer">{tied?'The top party counts are tied.':`${s.parties.find(p=>p.id===first.partyId)?.name} leads the preliminary party count by ${formatNumber(first.votes-second.votes)} votes (${(first.percentage-second.percentage).toFixed(2)} percentage points).`}</p><p className="tiny">{isStale(s,feed.error)?'This snapshot is stale. ':''}This is a description of counted votes, not a forecast. Reporting order and special votes can change the picture. No seat allocation or coalition probability is inferred.</p></>:<div className="analysis-empty"><h3>No published counts to analyse yet</h3><p>Analysis will appear when publishable counts are available. No forecast is inferred.</p></div>}{s&&<dl className="coverage-list"><div><dt>Electorate coverage</dt><dd>{s.electorates.length} source electorates, including {s.electorates.filter(e=>e.roll==='Māori').length} Māori electorates</dd></div><div><dt>Candidate coverage</dt><dd>{s.candidates.length} source candidate entries, including list-only entries</dd></div><div><dt>Party coverage</dt><dd>{s.parties.length} source entries; {s.parties.filter(p=>p.registered).length} marked registered</dd></div></dl>}</section>
}
