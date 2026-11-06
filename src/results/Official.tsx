import { useState } from 'react'
import type { FeedState } from './useFeed'
import type { Snapshot } from './types'
import { useElectorate,isStale,nzTime } from './useFeed'
import { formatNumber, parties as demoParties } from '../demo'
import { electorates as referenceElectorates,normalizeSearch } from '../electorates'
import { coastPaths,project } from '../geography'
export type NationalState=FeedState<Snapshot>
export function color(name:string){
  const aliases:Record<string,string>={'act new zealand':'ACT','national party':'National','labour party':'Labour','new zealand national party':'National','new zealand labour party':'Labour','green party':'Green','green party of aotearoa new zealand':'Green','new zealand first party':'NZ First'}
  const canonical=aliases[normalizeSearch(name)]??name
  return demoParties.find(p=>normalizeSearch(p.name)===normalizeSearch(canonical))?.color??'#64736c'
}
export function FeedNotice({feed}:{feed:NationalState}) {
  const s=feed.data
  return <div className="source-note" role="status">{s?<><strong>{isStale(s,feed.error)?'Stale snapshot · ':''}{s.message}</strong><p>Source updated {nzTime(s.updatedAt)} NZ time · Last successful check {nzTime(s.fetchedAt)} · Checks every 60 seconds while this page is visible.</p></>:<p>{feed.loading?'Connecting to the Electoral Commission feed…':feed.error??'Feed unavailable.'}</p>}{feed.error&&s&&<p>{feed.error}</p>}<button className="text-button" onClick={feed.refresh}>Retry feed</button><a href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Official results website</a></div>
}
export function OfficialParties({feed}:{feed:NationalState}) {
  const [query,setQuery]=useState(''),[scope,setScope]=useState('all')
  const s=feed.data
  const filtered=s?.parties.filter(p=>normalizeSearch(p.name).includes(normalizeSearch(query))&&(scope==='all'||p.registered))??[]
  return <section><h2>Parties in the source feed</h2><p className="section-intro">Source-supplied names and registration flags, not a historical transcription. A directory listing does not imply a party receives party votes, has elected members, or belongs to a coalition.</p><FeedNotice feed={feed}/><div className="explorer-tools"><label>Search party names<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a party"/></label><label>Show<select aria-label="Party scope" value={scope} onChange={e=>setScope(e.target.value)}><option value="all">All source party entries</option><option value="registered">Registered parties only</option></select></label></div><p className="tiny" aria-live="polite">{filtered.length} source party entries</p><ul className="party-directory">{filtered.map(p=><li key={p.id}><span className="party-dot" style={{backgroundColor:color(p.name)}}/><strong>{p.name}</strong><span>{p.registered?'Registered in source':'Not registered in source'} · {p.abbreviation}</span></li>)}</ul>{s&&!filtered.length&&<p>No matching parties. Try a shorter search.</p>}</section>
}
export function OfficialElectorates({feed}:{feed:NationalState}) {
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
  return <section><div className="section-heading"><h2>Electorates & candidates</h2><span className="tag">SOURCE DIRECTORY</span></div><p className="section-intro">Search every electorate in the official media feed, including Māori electorates. Candidate names and affiliations come from that feed; these are not assertions about current MPs or elected winners.</p><FeedNotice feed={feed}/><div className="layer-switch" role="group" aria-label="Electorate roll">{['All','General','Māori'].map(r=><button key={r} aria-pressed={roll===r} onClick={()=>setRoll(r)}>{r==='All'?'Both rolls':`${r} electorates`}</button>)}</div><label className="directory-search">Find an electorate<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search all source electorates"/></label>
    <div className="explorer-grid"><div className="geographic-view"><h3>Across Aotearoa</h3><p className="tiny">{markers.length} of {filtered.length} matching electorates have reference map anchors. Use the list for complete source coverage. Locations are approximate, not boundaries; Māori and general geography overlaps. Te Tai Tonga spans both islands.</p><div className="electorate-map" role="group" aria-label="Source electorate selector"><svg className="nz-coast" viewBox="0 0 360 570" role="img" aria-label="New Zealand coastline"><title>Natural Earth coastline</title>{coastPaths.map((path,i)=><path key={i} d={path} fillRule="evenodd"/>)}</svg>{markers.map(e=>{
      const p=project(e.longitude,e.latitude)
      return <button key={e.id} className="map-point" style={{left:`${p.x/360*100}%`,top:`${p.y/570*100}%`,'--marker-color':'#64736c'} as React.CSSProperties} aria-label={`${e.name}, ${e.roll} electorate`} aria-pressed={selected?.id===e.id} onClick={()=>setSelection(e.id)}><span>{e.name}</span></button>
    })}</div><p className="map-credit">Coastline: Natural Earth · Public domain · Offshore islands omitted. Neutral markers do not indicate winners.</p></div><div className="electorate-results"><p className="tiny" aria-live="polite">{filtered.length} source electorates match</p><div className="electorate-list" aria-label="Select an electorate">{filtered.map(e=><button key={e.id} aria-pressed={selected?.id===e.id} onClick={()=>setSelection(e.id)}><span>{e.name}</span><span className="list-leader">{e.roll}</span></button>)}</div>
    {selected?<div className="candidate-details"><h3>{selected.name}</h3><p className="leading-note" role="status">{localData?`${isStale(localData,local.error)?'Stale snapshot · ':''}${localData.message}`:local.loading?'Loading electorate counts…':local.error??'No count data available.'}</p>{localData&&<p className="tiny">Source updated {nzTime(localData.updatedAt)} NZ time{localData.reporting&&localData.reporting.total>0?` · ${localData.reporting.counted} / ${localData.reporting.total} voting places counted`:' · Voting-place totals not yet supplied'}</p>}{local.error&&<button className="text-button" onClick={local.refresh}>Retry electorate feed</button>}<ul>{[...candidates].sort((a,b)=>(values?.find(v=>v.candidateId===b.id)?.votes??0)-(values?.find(v=>v.candidateId===a.id)?.votes??0)||a.name.localeCompare(b.name)).map(c=>{
      const count=values?.find(v=>v.candidateId===c.id)?.votes
      const name=s?.parties.find(p=>p.id===c.partyId)?.name??'No party listed in source'
      return <li key={c.id}><span><strong>{c.name}</strong><small><span className="party-dot" style={{backgroundColor:color(name)}}/>{name}</small>{count!==undefined&&leaderVotes>0&&count===leaderVotes&&<small>Leading count · no winner declared</small>}</span><strong>{count===undefined?'—':formatNumber(count)}<small>{count===undefined?'Not published':'votes'}</small></strong></li>
    })}</ul><p className="tiny">Missing counts are not zero votes. Source “final” flags are not used to declare winners or certify official results.</p></div>:s?<div className="empty-state"><h3>No matching electorates</h3><button onClick={()=>{setQuery('');setRoll('All')}}>Clear filters</button></div>:null}
    </div></div>
  </section>
}
export function OfficialInsights({feed}:{feed:NationalState}) {
  const s=feed.data;const sorted=s?.results?[...s.results].sort((a,b)=>b.votes-a.votes):null
  const first=sorted?.[0],second=sorted?.[1]
  const tied=first&&second&&first.votes===second.votes
  return <section><h2>What the source counts show</h2><FeedNotice feed={feed}/>{first&&second&&s?<><p className="analysis-answer">{tied?'The top party counts are tied.':`${s.parties.find(p=>p.id===first.partyId)?.name} leads the preliminary party count by ${formatNumber(first.votes-second.votes)} votes (${(first.percentage-second.percentage).toFixed(2)} percentage points).`}</p><p className="tiny">{isStale(s,feed.error)?'This snapshot is stale. ':''}This is a description of counted votes, not a forecast. Reporting order and special votes can change the picture. No seat allocation or coalition probability is inferred.</p></>:<div className="analysis-empty"><h3>No published counts to analyse yet</h3><p>The feed connection can supply a roster without meaningful vote totals. Polls, swing, remaining-vote estimates and win probabilities are not inferred from an empty or withheld count.</p></div>}{s&&<dl className="coverage-list"><div><dt>Electorate coverage</dt><dd>{s.electorates.length} source electorates, including {s.electorates.filter(e=>e.roll==='Māori').length} Māori electorates</dd></div><div><dt>Candidate coverage</dt><dd>{s.candidates.length} source candidate entries, including list-only entries</dd></div><div><dt>Party coverage</dt><dd>{s.parties.length} source entries; {s.parties.filter(p=>p.registered).length} marked registered</dd></div></dl>}</section>
}
