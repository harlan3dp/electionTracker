import { useState } from 'react'
import { formatNumber, parties } from './demo'
import { electorates, leaders, searchElectorates } from './electorates'
import { allocateScenario, requiredRemainingShare, scenarioShares } from './analysis'

const partyColor = (name: string) => parties.find(p => p.name === name)?.color ?? '#687970'

export function Explorer() {
  const [query, setQuery] = useState('')
  const [island, setIsland] = useState('All')
  const [selectedName, setSelectedName] = useState(electorates[1].name)
  const filtered = searchElectorates(query, island)
  const selected = filtered.find(e => e.name === selectedName) ?? filtered[0]
  const leading = selected ? leaders(selected.candidates) : []
  return <section id="electorates" className="explorer-section" aria-labelledby="electorates-title">
    <div className="section-heading"><h2 id="electorates-title">Explore the electorates</h2><span className="tag">FICTIONAL RESULTS</span></div>
    <p className="section-intro">Follow the local picture. This demo includes {electorates.length} illustrative electorates, with synthetic candidates and votes. It is not the complete 2026 roster.</p>
    <div className="explorer-tools"><label>Find an electorate<input type="search" placeholder="Try Auckland or Whangārei" value={query} onChange={e => setQuery(e.target.value)}/></label><label>Region<select value={island} onChange={e => setIsland(e.target.value)}><option>All</option><option>North Island</option><option>South Island</option></select></label></div>
    <div className="explorer-grid"><div className="geographic-view"><div className="map-heading"><h3>Electorate schematic</h3><span>North ↑</span></div><p className="tiny">Approximate locations only · Not official boundaries<br/>Colour indicates the demo leader’s party.</p>
      <div className="electorate-map" role="group" aria-label="Illustrative geographic electorate selector">
        <span className="island-label north-label">TE IKA-A-MĀUI</span><span className="island-label south-label">TE WAIPOUNAMU</span>
        {filtered.map(e => <button key={e.name} className="map-point" style={{ left: `${e.x}%`, top: `${e.y}%`, backgroundColor: partyColor(leaders(e.candidates)[0].party) }} onClick={() => setSelectedName(e.name)} aria-label={`${e.name}, ${leaders(e.candidates)[0].party} leads in demo`} aria-pressed={selected?.name === e.name} title={e.name}><span>{e.name}</span></button>)}
      </div>
      <ul className="map-legend">{['National', 'Labour', 'Green'].map(name => <li key={name}><span className="party-dot" style={{ backgroundColor: partyColor(name) }}/>{name}</li>)}</ul>
    </div><div className="electorate-results"><p className="tiny" aria-live="polite">{filtered.length} demo electorates match</p><div className="electorate-list" aria-label="Select an electorate">{filtered.map(e => <button key={e.name} onClick={() => setSelectedName(e.name)} aria-pressed={selected?.name === e.name}>{e.name}<span aria-hidden="true">→</span></button>)}</div>
      {selected ? <div className="candidate-details" aria-live="polite"><h3>{selected.name}</h3><p className="leading-note">{leading.length > 1 ? 'Tied for the lead' : `${leading[0].party} leading`} · Demo only, no winner declared</p><ul>{[...selected.candidates].sort((a,b) => b.votes-a.votes).map(c => <li key={c.name}><span><strong>{c.name}</strong><small><span className="party-dot" style={{backgroundColor: partyColor(c.party)}}/>{c.party}</small></span><strong>{formatNumber(c.votes)}<small>votes</small></strong></li>)}</ul><p className="tiny">Reporting progress and result status unavailable. Candidate votes are separate from the national party vote.</p></div> : <div className="empty-state"><h3>No matching electorates</h3><p>Try a shorter name or choose a different region.</p><button onClick={() => { setQuery(''); setIsland('All') }}>Clear filters</button></div>}
    </div></div>
  </section>
}

export function Parliament() {
  const [labourShare, setLabourShare] = useState(32.1)
  const shares = scenarioShares(labourShare)
  const seats = allocateScenario(shares)
  const [partners, setPartners] = useState<string[]>(['Labour', 'Green'])
  const coalitionSeats = parties.reduce((sum, p, i) => sum + (partners.includes(p.name) ? seats[i] : 0), 0)
  const dots = seats.flatMap((count, party) => Array.from({length: count}, () => party))
  let offset = 0
  const positions = [14, 19, 24, 29, 34].flatMap((count, row) => Array.from({length:count}, (_, i) => {
    const angle = Math.PI - Math.PI * i / (count - 1)
    const radius = 64 + row * 24
    return { x: 200 + Math.cos(angle) * radius, y: 185 - Math.sin(angle) * radius, party: dots[offset++] }
  }))
  return <section className="analysis-section" id="parliament" aria-labelledby="parliament-title"><div className="section-heading"><h2 id="parliament-title">The shape of Parliament</h2><span className="tag">SCENARIO · NOT A FORECAST</span></div><p className="section-intro">Explore a hypothetical 120-seat chamber. Change Labour’s share to see a proportional seat illustration; other parties scale proportionally to keep the total at 100%.</p>
    <div className="scenario-grid"><div><svg className="parliament-chart" viewBox="0 0 400 215" role="img" aria-label={`Hypothetical Parliament: ${parties.map((p,i) => `${p.name} ${seats[i]} seats`).join(', ')}`}><title>120 hypothetical seats, not projected election results</title>{positions.map((point,i) => <circle key={i} cx={point.x} cy={point.y} r="4.2" fill={parties[point.party].color}/>)}<text x="200" y="158" textAnchor="middle" className="chamber-total">120</text><text x="200" y="177" textAnchor="middle" className="chamber-label">hypothetical seats</text></svg><ul className="seat-legend">{parties.map((p,i) => <li key={p.name}><span className="party-name"><span className="party-dot" style={{backgroundColor:p.color}}/>{p.name}</span><strong>{seats[i]} <small>seats</small></strong></li>)}</ul></div>
    <div className="scenario-controls"><label htmlFor="labour-share">Labour party vote <strong>{labourShare.toFixed(1)}%</strong></label><input id="labour-share" type="range" min="0" max="100" step="0.1" value={labourShare} onChange={e => setLabourShare(Number(e.target.value))}/><fieldset><legend>Explore a possible grouping</legend>{parties.map(p => <label className="partner-choice" key={p.name}><input type="checkbox" checked={partners.includes(p.name)} onChange={() => setPartners(current => current.includes(p.name) ? current.filter(n => n !== p.name) : [...current, p.name])}/>{p.name}</label>)}</fieldset><p className="coalition-total" aria-live="polite"><strong>{coalitionSeats}</strong> / 120 seats</p><p>{coalitionSeats >= 61 ? `${coalitionSeats - 61} seats above a 61-seat majority threshold.` : `${61 - coalitionSeats} more seats needed for a 61-seat majority.`}</p><p className="tiny">Grouping parties here does not imply they would work together or form a government.</p></div></div>
    <details className="methodology"><summary>Read the scenario assumptions</summary><p>Seats use the Sainte-Laguë highest-averages method with divisors 1, 3, 5… and a fixed total of 120. All six demo parties are assumed eligible, including those below 5%. Exact ties use display order. This deliberately simplified illustration omits electorate qualification, electorate seat wins, overhangs, vacancies and other official allocation rules. It is not a complete NZ MMP calculator or an election projection. The 61-seat threshold applies only to this fixed 120-seat scenario.</p></details>
  </section>
}

export function Analysis() {
  const [current, setCurrent] = useState(32.1)
  const [counted, setCounted] = useState(40)
  const [target, setTarget] = useState(35)
  const required = requiredRemainingShare(current, counted, target)
  const message = required === null ? 'No votes remain in this scenario. There is no remaining-vote threshold to calculate.' : required > 100 ? 'This target cannot be reached with the assumed votes remaining.' : required <= 0 ? 'The target is already secured under these fixed-total assumptions, even with no further Labour votes.' : `Labour would need ${required.toFixed(1)}% of the remaining party votes to finish at ${target.toFixed(1)}%.`
  return <section className="analysis-section" aria-labelledby="analysis-title"><div className="section-heading"><h2 id="analysis-title">What would it take?</h2><span className="tag">HYPOTHETICAL ANALYSIS</span></div><p className="section-intro">A vote-share target is not a winning threshold. Forming a government depends on seats and parliamentary support. This calculator answers a narrower question: how much of the remaining vote reaches your chosen target?</p><div className="target-inputs">{[{label:'Labour share so far',value:current,set:setCurrent},{label:'Final party votes counted',value:counted,set:setCounted},{label:'Target final Labour share',value:target,set:setTarget}].map(input => <label key={input.label}>{input.label}<span><input type="range" min="0" max="100" step="0.1" value={input.value} onChange={e => input.set(Number(e.target.value))}/><output>{input.value.toFixed(1)}%</output></span></label>)}</div><p className="analysis-answer" aria-live="polite">{message}</p><p className="tiny">All inputs are hypothetical. “Counted” means a share of the assumed final valid party-vote total, not polling places reporting or turnout. The final vote total is treated as fixed; special votes and reporting patterns can change the picture. Formula: (target − current share × counted fraction) ÷ remaining fraction.</p><details className="methodology"><summary>Historical comparisons, polls & live projections</summary><p>Not connected yet. Before showing forecasts, we need licensed, attributed poll observations with fieldwork dates and methodology; verified historical results matched across boundary changes; and an authenticated, validated official results feed. A future model should account for reporting bias, special votes, uncertainty, MMP eligibility and coalition assumptions, with timestamped inputs and published backtesting. It must distinguish counted results, polls, scenarios and model forecasts. No historical figures, poll estimates or win probabilities are invented here.</p></details></section>
}
