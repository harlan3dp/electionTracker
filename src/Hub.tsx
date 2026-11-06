import { useEffect, useState } from 'react'
import { Analysis, Explorer, Parliament } from './Explorer'
import { DemoResults } from './DemoResults'
import { parties, formatNumber, voteShare, totalVotes } from './demo'
import { electorates } from './electorates'
import { allocateScenario } from './analysis'
import { coalitionPresets, historicalParties, historicalSource } from './reference'

export const views = ['Results', 'Electorates', 'Parties', 'Coalitions', 'Analysis', 'Sources'] as const
export type View = typeof views[number]
const readView = (): View => views.find(view => view.toLowerCase() === window.location.hash.slice(1)) ?? 'Results'

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children} <svg viewBox="0 0 24 24" width="14" height="14" className="external-icon" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg><span className="sr-only"> (opens in a new tab)</span></a>
}

function Overview({ demo, setDemo }: { demo: boolean; setDemo: (value: boolean) => void }) {
  return <>
    <div className="results-toolbar"><div><h2>National picture</h2><p>Party vote, seats and reporting progress</p></div><label className="demo-toggle"><input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)}/>Show fictional demo</label></div>
    {demo ? <DemoResults/> : <>
      <dl className="status-strip"><div><dt>Live results</dt><dd>Unavailable</dd></div><div><dt>Reporting progress</dt><dd>Not supplied</dd></div><div><dt>Results updated</dt><dd>No verified feed</dd></div></dl>
      <section className="waiting-room"><div className="waiting-symbol" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M7 35V23m11 12V13m12 22V19m11 16V7" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M5 42h38" fill="none" stroke="currentColor" strokeWidth="2"/></svg></div><h3>Ready for results. Waiting for a verified source.</h3><p>No live vote totals or projected winners are published here. Follow the Electoral Commission for official results; explore the directory and explicitly fictional tools while this site’s feed is being verified.</p><SourceLink href="https://www.electionresults.govt.nz/">View official election results</SourceLink></section>
    </>}
    <div className="reading-grid"><section><h3>Find your local race</h3><p>General and Māori electorates have separate rolls and overlapping geography. Search both, and distinguish a historical representative from a current candidate.</p><a href="#electorates">Explore electorates →</a></section><section><h3>Understand the route to government</h3><p>A party’s vote share is not a winning threshold. Explore possible groupings in a hypothetical 120-seat Parliament.</p><a href="#coalitions">Open coalition scenarios →</a></section></div>
  </>
}

function Parties() {
  const [query, setQuery] = useState('')
  const filtered = historicalParties.filter(p => p.toLowerCase().includes(query.toLowerCase().trim()))
  return <section className="directory-section"><div className="section-heading"><h2>Party directory</h2><span className="tag">2023 REFERENCE · RECHECK PENDING</span></div><p className="section-intro">All 17 names in our historical 2023 party-vote reference are listed here, not just the parties with parliamentary seats. This is an editorial reference awaiting source recheck, not a verified 2026 register. Names, registration, coalitions and candidate affiliations may have changed.</p><label className="directory-search">Search party names<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a party"/></label><p className="tiny" aria-live="polite">{filtered.length} matching historical party names</p><ul className="party-directory">{filtered.map(name => <li key={name}><span className="party-dot" style={{backgroundColor:parties.find(p => p.name === name)?.color}}/><strong>{name}</strong><span>2026 status unverified</span></li>)}</ul>{filtered.length === 0 && <div className="empty-state"><h3>No matching parties</h3><button onClick={() => setQuery('')}>Clear party search</button></div>}<p className="source-note"><SourceLink href="https://elections.nz/">Check the Electoral Commission’s current register</SourceLink> · <SourceLink href={historicalSource}>Official 2023 results</SourceLink></p></section>
}

function Insights({ demo, setDemo }: { demo: boolean; setDemo: (value: boolean) => void }) {
  const ordered = [...parties].sort((a,b) => b.votes-a.votes)
  const gap = ordered[0].votes - ordered[1].votes
  const seats = allocateScenario(parties.map(p => p.votes))
  const maoriCount = electorates.filter(e => e.kind === 'Māori').length
  return <>
    <section className="insights-section"><div className="section-heading"><h2>What the data can tell us</h2><span className="tag">{demo ? 'FICTIONAL DEMO' : 'CURRENT DATA UNAVAILABLE'}</span></div>
      <p className="section-intro">Start with the evidence, then the interpretation. Polls, historical vote totals and live results are not verified or loaded. There is no supported 2026 forecast or win probability.</p>
      {!demo ? <div className="analysis-empty"><h3>No current result analysis yet</h3><p>Without verified counts, we cannot identify a national leader, calculate swing, estimate remaining votes or project seats. Use the explicitly fictional walkthrough to see how these summaries will read.</p><button className="primary-button" onClick={() => setDemo(true)}>Explore fictional analysis</button></div> : <><dl className="status-strip"><div><dt>Demo party-vote leader</dt><dd>{ordered[0].name}</dd></div><div><dt>Demo margin over second</dt><dd>{formatNumber(gap)} votes</dd></div><div><dt>Demo percentage-point gap</dt><dd>{(voteShare(gap,totalVotes)).toFixed(1)} pp</dd></div></dl><p className="analysis-answer">{ordered[0].name} leads the fictional party vote, but receives {seats[parties.findIndex(p => p.name === ordered[0].name)]} seats in the simplified allocation—short of the 61-seat scenario majority.</p><p className="tiny">Computed directly from fictional votes; not a poll, prediction or report of actual voting.</p><button className="text-button" onClick={() => setDemo(false)}>Leave fictional analysis</button></>}
      <h3 className="subheading">Coverage at a glance</h3><dl className="coverage-list"><div><dt>Māori electorate names</dt><dd>{maoriCount} historical reference entries; current roster recheck pending</dd></div><div><dt>General electorate names</dt><dd>{electorates.length-maoriCount} reference entries; incomplete coverage</dd></div><div><dt>Representatives</dt><dd>2023 election-winner references only; no verified current MPs or 2026 candidates</dd></div><div><dt>Party coverage</dt><dd>17 historical reference names; current register unverified</dd></div></dl>
      <div className="reading-grid"><section><h3>Reporting order matters</h3><p>Early counts may overrepresent particular places or voting methods. A national percentage can move as different electorates and special votes arrive. Polling places reporting is not the share of all votes counted.</p></section><section><h3>Two votes, different jobs</h3><p>The party vote drives proportional representation. The electorate vote chooses a local representative. A local candidate lead cannot be treated as a national party-vote lead.</p></section></div>
    </section><Analysis/>
  </>
}

function Sources() {
  return <section className="sources-section"><h2>Sources & confidence</h2><p className="section-intro">Source access rechecked 6 November 2026 (NZ time). The official results homepage and media XML directory are now reachable. The directory is an index, not a validated results dataset. Roster verification, feed permissions, schema and update cadence remain pending.</p><dl className="source-ledger"><div><dt>Live results</dt><dd><SourceLink href="http://media.election.net.nz/xml/">Electoral Commission media XML</SourceLink><strong>Not connected</strong><p>Access, permission, schema, update cadence and reuse terms remain unverified. No invented XML adapter or current vote totals.</p></dd></div><div><dt>Parties & candidates</dt><dd><SourceLink href="https://elections.nz/">Electoral Commission</SourceLink><strong>Source recheck pending</strong><p>2026 register and candidate lists are not imported. Historical names are editorial reference entries only.</p></dd></div><div><dt>Historical representatives</dt><dd><SourceLink href={historicalSource}>Official 2023 election results</SourceLink><strong>Historical reference · unverified transcription</strong><p>Manually entered 2023 winners may differ from current MPs. Vacancies, by-elections, deaths and affiliation changes are not reflected. Verify before relying on a name.</p></dd></div><div><dt>Current MPs</dt><dd><SourceLink href="https://www.parliament.nz/">New Zealand Parliament</SourceLink><strong>Not imported</strong><p>Current MPs and nominated candidates require different sources and will be displayed separately.</p></dd></div><div><dt>Map geography</dt><dd><SourceLink href="https://www.naturalearthdata.com/">Natural Earth</SourceLink><strong>Bundled geographic coastline</strong><p>Public-domain 1:50m main-island coastline. Marker anchors are approximate, not electoral boundaries. Māori and general geography overlaps; Te Tai Tonga spans both islands.</p></dd></div><div><dt>Polls & predictive modelling</dt><dd><strong>No data loaded</strong><p>No poll estimates or probabilistic forecasts are generated. A future model needs attributed polls, fieldwork dates, historical boundary crosswalks and backtesting.</p></dd></div></dl><h3 className="subheading">Before public release</h3><p className="section-intro">Verify current rosters, results access and reuse permissions, full MMP allocation rules and applicable election-day publishing requirements. A hypothetical grouping is not an agreement to form a government.</p></section>
}

export function Hub() {
  const [view, setView] = useState<View>(readView)
  const [demo, setDemo] = useState(false)
  useEffect(() => {
    const change = () => { if (window.location.hash !== '#main') { setView(readView()); window.scrollTo({top:0}) } }
    window.addEventListener('hashchange',change)
    return () => window.removeEventListener('hashchange',change)
  },[])
  useEffect(() => { document.title = `${view} · NZ Election Tracker` },[view])
  return <>
    <nav className="hub-nav" aria-label="Main sections">{views.map(name => <a key={name} href={`#${name.toLowerCase()}`} aria-current={view === name ? 'page' : undefined}>{name}</a>)}</nav>
    <div className={`notice ${demo ? '' : 'reference-notice'}`}><span className="notice-dot" aria-hidden="true"/><p>{demo ? <><strong>Fictional demo enabled.</strong> Vote totals and scenarios are invented. No live results.</> : <><strong>Live results unavailable.</strong> Historical directory entries await source recheck. Scenarios use fictional votes.</>}</p></div>
    <section className="hero" aria-labelledby="title"><div><h1 id="title">{view === 'Results' ? 'New Zealand, vote by vote.' : view === 'Electorates' ? 'Your local picture.' : view === 'Parties' ? 'Every party in view.' : view === 'Coalitions' ? 'Explore the numbers together.' : view === 'Analysis' ? 'From numbers to understanding.' : 'Know what you’re reading.'}</h1><p className="hero-description">{view === 'Coalitions' ? 'Hypothetical groupings. Clear assumptions. No implied political agreements.' : 'An independent election dashboard with clear sources and honest limits.'}</p></div><p className="election-date">General election<strong>7 November 2026</strong></p></section>
    <div className="hub-view" hidden={view !== 'Results'}><Overview demo={demo} setDemo={setDemo}/></div>
    <div className="hub-view" hidden={view !== 'Electorates'}><Explorer demo={demo}/></div>
    <div className="hub-view" hidden={view !== 'Parties'}><Parties/></div>
    <div className="hub-view" hidden={view !== 'Coalitions'}><div className="coalition-comparisons"><h2>Three possible groupings</h2><p className="section-intro">Illustrative combinations using fictional votes. These do not assert current alliances, coalition commitments or likelihood of forming a government.</p><div className="coalition-rows">{coalitionPresets.map(preset => {
      const allocated = allocateScenario(parties.map(p => p.votes))
      const count = parties.reduce((sum,p,i) => sum+(preset.parties.includes(p.name) ? allocated[i] : 0),0)
      return <div key={preset.name}><h3>{preset.name}</h3><div className="coalition-meter" aria-hidden="true"><span style={{width:`${count/120*100}%`}}/><i/></div><p><strong>{count} / 120</strong> · {count>=61 ? 'Reaches' : 'Below'} the 61-seat scenario threshold</p></div>
    })}</div></div><Parliament/></div>
    <div className="hub-view" hidden={view !== 'Analysis'}><Insights demo={demo} setDemo={setDemo}/></div>
    <div className="hub-view" hidden={view !== 'Sources'}><Sources/></div>
  </>
}
