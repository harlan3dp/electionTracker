import {useEffect,useState} from 'react'
import {Icon} from '../Icons'
import {Chamber} from '../Chamber'
import {predictionParties} from '../parliament'
import {Trends} from './Trends'
import {ElectorateCoverage} from './ElectorateCoverage'
import {ParliamentComposition,modelledRows,type ParliamentModel} from '../ParliamentComposition'
import {OfficialElectorates,OfficialParties,OfficialInsights} from './Official'
import {Analysis} from '../Explorer'
import type {Detail} from '../navigation'
import {isStale} from './useFeed'
import {FeedNotice,color,type NationalState} from './Official'
import {demoAvailable,resultsStarted,DEMO_LOCK_KEY} from './demoPolicy'
import {replayFrames} from './replay'

function Probability(){return <p className="probability-note"><strong>Probabilities: Model not yet available.</strong> No chance of forming a government is inferred from these seats.</p>}
function VoteBars({rows,label}:{rows:{name:string;share:number;color:string}[];label:string}) {
 return <section className="desk-panel national-results"><div className="section-heading"><h2>National results</h2><span className="tag">{label}</span></div>
  {rows.length ? <ul className="desk-votes">{rows.map(row => <li key={row.name}><div className="party-row"><span className="party-name"><span className="party-dot" style={{background:row.color}}/>{row.name}</span><strong>{row.share.toFixed(1)}%</strong></div><div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{width:`${row.share}%`,background:row.color}}/></div></li>)}</ul>
  : <div className="brief-empty"><Icon name="results"/><h3>Awaiting party votes</h3><p>Official counts will appear here.</p></div>}
 </section>
}
export function HomeDashboard({feed,model,detail,active}:{feed:NationalState;model:ParliamentModel;detail:Detail;active:boolean}) {
 const [demo,setDemo]=useState(false)
 const [locked,setLocked]=useState(true)
 useEffect(()=>{let active=true;const sync=()=>{let stored=true;try{if(resultsStarted(feed.data))localStorage.setItem(DEMO_LOCK_KEY,'yes');stored=localStorage.getItem(DEMO_LOCK_KEY)==='yes'}catch{/* Fail closed when persistence is blocked. */}if(active)setLocked(stored||Boolean(resultsStarted(feed.data)))};queueMicrotask(sync);window.addEventListener('storage',sync);return()=>{active=false;window.removeEventListener('storage',sync)}},[feed.data])
 const allowed=demoAvailable(feed.data,feed.error,locked)
 const sample=demo&&allowed&&!detail
 return <div className="results-desk election-results">
  {sample&&<><div className="sample-return"><strong>Viewing fictional sample data</strong><button className="text-button" onClick={()=>setDemo(false)}>Back to live results</button></div><DemoDesk active={active}/></>}
  <div hidden={sample}><LiveDesk feed={feed} model={model}/></div>
  <details className="sample-tools"><summary>Preview with sample data</summary><p className="tiny" id="sample-help">{allowed?'Fictional figures for exploring the interface.':'Sample preview is locked after counting starts, after 7pm NZ time, or while source status is unverified.'}</p><button className="text-button" disabled={!allowed} aria-describedby="sample-help" onClick={()=>{setDemo(true);window.location.hash='results';window.scrollTo({top:0})}}>Open fictional preview</button></details>
 </div>
}
function DemoDesk({active}:{active:boolean}){
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false)
 useEffect(()=>{if(!playing||!active||step===replayFrames.length-1)return;const timer=setInterval(()=>{if(document.hidden)return;setStep(n=>{if(n>=replayFrames.length-1)return n;return n+1})},8000);return()=>clearInterval(timer)},[playing,active,step])
 const frame=replayFrames[step],previous=step?replayFrames[step-1]:null
 const grouping=frame.allocation.totals.slice(0,3).reduce((a,b)=>a+b,0),difference=grouping-frame.allocation.majority
 return <><div className="demo-banner"><strong>FICTIONAL DEMO · ALL COUNTS, TRENDS AND SEATS ARE INVENTED.</strong><span>Not live results, a poll or a forecast. The illustrative roster has 63 general + 7 Māori electorates; it is not the verified 2026 roster.</span></div>
 <div className="replay-toolbar"><span role="status">Demo update {step+1} of {replayFrames.length} · {frame.reporting}% fictional voting places reporting</span><div><button onClick={()=>{if(step===replayFrames.length-1)setStep(0);setPlaying(true)}} disabled={playing&&step<replayFrames.length-1}>Play</button><button disabled={!playing||step===replayFrames.length-1} onClick={()=>setPlaying(false)}>Pause</button><button onClick={()=>{setPlaying(false);setStep(0)}}>Reset replay</button><button disabled={step===replayFrames.length-1} onClick={()=>{setPlaying(false);setStep(n=>Math.min(n+1,replayFrames.length-1))}}>Next update</button></div></div>
 <div className="desk-summary"><VoteBars label="FICTIONAL COUNTS" rows={predictionParties.map((p,i)=>({...p,share:frame.votes[i]}))}/><section className="desk-panel"><div className="section-heading"><h2>The parliamentary picture</h2><span className="tag">FICTIONAL SEAT SCENARIO</span></div><Chamber rows={frame.rows}/><div className="desk-seat-totals"><strong>{frame.allocation.total} seats</strong><span>120 base + {frame.allocation.overhang} overhang</span><strong>{frame.allocation.majority} for a majority</strong></div><p className="grouping-summary">National + ACT + NZ First: <strong>{grouping} seats</strong> · {difference<0?`${-difference} short of a majority`:difference===0?'at the majority threshold':`${difference} above the majority threshold`}.</p><Probability/></section></div>
 <div className="desk-second-row"><section className="desk-panel"><h2>How the picture is changing</h2><p className="tiny">Fictional party-vote shares · replay updates, not real timestamps.</p><svg className="trend-chart" viewBox="0 0 720 225" role="img" aria-label="Fictional National and Labour share trends. Exact changes are shown alongside.">{[30,35,40].map(v=><g key={v}><line x1="45" x2="690" y1={190-(v-28)*12} y2={190-(v-28)*12} stroke="#dce3da"/><text x="2" y={194-(v-28)*12}>{v}%</text></g>)}{[0,3].map(i=><g key={i}><polyline stroke={predictionParties[i].color} fill="none" strokeWidth="3" points={replayFrames.slice(0,step+1).map((f,j)=>`${45+j*115},${190-(f.votes[i]-28)*12}`).join(' ')}/>{replayFrames.slice(0,step+1).map((f,j)=><circle key={j} cx={45+j*115} cy={190-(f.votes[i]-28)*12} r="4" fill={predictionParties[i].color}/>)}<text x="690" y={190-(frame.votes[i]-28)*12} textAnchor="end">{predictionParties[i].name} {frame.votes[i].toFixed(1)}%</text></g>)}<text x="45" y="220">Update 1</text><text x="690" y="220" textAnchor="end">Update {replayFrames.length}</text></svg><p className="tiny">Showing the two largest parties in this fictional example. Voting-place reporting is not the share of all votes counted.</p></section><section className="desk-panel"><h2>What changed this update</h2><dl className="change-list">{[0,3].map(i=>{const delta=previous?frame.votes[i]-previous.votes[i]:null;return <div key={i}><dt>{predictionParties[i].name} share</dt><dd>{delta===null?'First update':`${delta>0?'+':''}${delta.toFixed(1)} pp`}</dd></div>})}<div><dt>Parliament size</dt><dd>{previous?`${previous.allocation.total} → ${frame.allocation.total}`:`${frame.allocation.total} seats`}</dd></div><div><dt>Majority needed</dt><dd>{frame.allocation.majority} seats</dd></div></dl><p className="tiny">Overhangs change the chamber size, so the majority threshold is recalculated at every step.</p></section></div>
 <details className="desk-details"><summary>Seat breakdown, Māori electorates & demo assumptions</summary><table className="seat-table"><caption>Fictional allocation · electorate wins include general and Māori electorates</caption><thead><tr><th>Party</th><th>Electorate</th><th>List</th><th>Total</th></tr></thead><tbody>{predictionParties.map((p,i)=><tr key={p.name}><th>{p.name}</th><td>{frame.general[i]+frame.maori[i]}</td><td>{frame.allocation.list[i]}</td><td>{frame.allocation.totals[i]}</td></tr>)}</tbody></table><p>Māori electorates are within the electorate total, not additional seats. Te Pāti Māori’s assumed {frame.general[5]+frame.maori[5]} electorates here comprise {frame.general[5]} general and {frame.maori[5]} Māori seats.</p><p>The example applies a 5% or electorate-win eligibility threshold and Sainte-Laguë allocation. Electorate wins above proportional entitlement create overhangs. Unlisted parties, independents and exceptional statutory rules are excluded.</p></details><a className="section-link" href="#advanced-scenarios">Explore advanced scenarios <Icon name="arrow"/></a></>
}
function LiveDesk({feed,model}:{feed:NationalState;model:ParliamentModel}) {
 const s=feed.data
 const results=s?.results?[...s.results].sort((a,b)=>b.votes-a.votes):[]
 const rows=results.map(result=>{const party=s!.parties.find(p=>p.id===result.partyId)!;return{name:party.name,share:result.percentage,color:color(party.name)}})
 const fresh = s && !isStale(s,feed.error)
 const composition=fresh?modelledRows(model):null
 return <>
  <FeedNotice feed={feed}/>
  <div className="desk-summary election-summary"><VoteBars label={rows.length?'Preliminary party vote':'Party vote'} rows={rows.slice(0,7)}/>
   <ParliamentComposition rows={composition}><p className="tiny model-caveat">If current shares and leads held. Not an official seat allocation.</p><a className="section-link" href="#parliament">Explore coalitions <Icon name="arrow"/></a></ParliamentComposition>
  </div>
  <div className="result-detail-links"><a href="#electorates">Find an electorate <Icon name="arrow"/></a><a href="#parties">Party details</a><a href="#analysis">Trends & analysis</a></div>
  <section id="electorates" className="results-local"><OfficialElectorates feed={feed} compact/></section>
  <details className="desk-details" id="parties"><summary>Party details</summary>
   {rows.length>0&&<table className="seat-table"><caption>All preliminary party-vote shares</caption><thead><tr><th>Party</th><th>Share</th></tr></thead><tbody>{rows.map(row=><tr key={row.name}><th>{row.name}</th><td>{row.share.toFixed(1)}%</td></tr>)}</tbody></table>}
   <OfficialParties feed={feed} compact/>
  </details>
  <details className="desk-details" id="analysis"><summary>Trends & analysis</summary><Trends snapshot={s}/><OfficialInsights feed={feed} compact/>
   <details className="desk-details"><summary>Electorate coverage & seat assumptions</summary><ElectorateCoverage snapshot={s} model={model}/></details>
   <details className="desk-details"><summary>Remaining-vote calculator</summary><Analysis/></details>
  </details>
 </>
}
