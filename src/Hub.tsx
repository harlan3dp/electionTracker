import { useEffect, useState } from 'react'
import { Analysis, Explorer, Parliament } from './Explorer'
import { parties, formatNumber, voteShare, totalVotes } from './demo'
import { electorates } from './electorates'
import { allocateScenario } from './analysis'
import { useFeed, isStale } from './results/useFeed'
import { OfficialParties, OfficialElectorates, OfficialInsights } from './results/Official'
import { Prediction } from './Prediction'
import { HomeDashboard } from './results/HomeDashboard'
import type { NationalState } from './results/Official'
import { coalitionPresets, historicalSource } from './reference'
import { Icon } from './Icons'
import type { IconName } from './Icons'

export const views = ['Results', 'Electorates', 'Parties', 'Coalitions', 'Analysis', 'Sources', 'Prediction'] as const
export type View = typeof views[number]
const viewIcons: Record<View, IconName> = { Results: 'results', Electorates: 'electorates', Parties: 'parties', Coalitions: 'coalitions', Analysis: 'analysis', Sources: 'sources', Prediction: 'results' }
const readView = (): View => views.find(view => view.toLowerCase() === window.location.hash.slice(1)) ?? 'Results'

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children} <svg viewBox="0 0 24 24" width="14" height="14" className="external-icon" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg><span className="sr-only"> (opens in a new tab)</span></a>
}

function Overview({feed,active}:{feed:NationalState;active:boolean}) {
  const [demo,setDemo]=useState(true)
  return <HomeDashboard feed={feed} demo={demo} setDemo={setDemo} active={active}/>
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
  return <section className="sources-section"><h2>Sources & confidence</h2><p className="section-intro">Source access rechecked 6 November 2026 (NZ time). The adapter was verified against captured public XML; current reachability is shown by the feed status. The adapter parses the observed election, statistics, party, electorate and candidate XML schemas. Source directory data is displayed as supplied, with validation and provenance. Permissions, election/test identity and publishing requirements still need review before nonzero counts are activated.</p><dl className="source-ledger"><div><dt>Live results</dt><dd><SourceLink href="https://media.election.net.nz/xml/">Electoral Commission media XML</SourceLink><strong>Validated adapter · see current feed status</strong><p>National and selected electorate counts are checked every 60 seconds. The observed XML has no explicit election/test identifier, so nonzero publication requires release-time validation and a reviewed production setting. Feed-use terms and test status must be confirmed before activation.</p></dd></div><div><dt>Parties & candidates</dt><dd><SourceLink href="https://elections.nz/">Electoral Commission</SourceLink><strong>Media feed directory loaded dynamically</strong><p>Party registration flags, candidate affiliations and electorate names come from source XML. List-only candidates are retained in the data but are not presented as electorate candidates. This directory does not identify current MPs.</p></dd></div><div><dt>Historical representatives</dt><dd><SourceLink href={historicalSource}>Official 2023 election results</SourceLink><strong>Historical reference · unverified transcription</strong><p>Manually entered 2023 winners may differ from current MPs. Vacancies, by-elections, deaths and affiliation changes are not reflected. Verify before relying on a name.</p></dd></div><div><dt>Current MPs</dt><dd><SourceLink href="https://www.parliament.nz/">New Zealand Parliament</SourceLink><strong>Not imported</strong><p>Current MPs and nominated candidates require different sources and will be displayed separately.</p></dd></div><div><dt>Map geography</dt><dd><SourceLink href="https://www.naturalearthdata.com/">Natural Earth</SourceLink><strong>Bundled geographic coastline</strong><p>Public-domain 1:50m main-island coastline. Marker anchors are approximate, not electoral boundaries. Māori and general geography overlaps; Te Tai Tonga spans both islands.</p></dd></div><div><dt>Polls & predictive modelling</dt><dd><strong>No data loaded</strong><p>No poll estimates or probabilistic forecasts are generated. A future model needs attributed polls, fieldwork dates, historical boundary crosswalks and backtesting.</p></dd></div></dl><h3 className="subheading">Before public release</h3><p className="section-intro">Verify current rosters, results access and reuse permissions, full MMP allocation rules and applicable election-day publishing requirements. A hypothetical grouping is not an agreement to form a government.</p></section>
}

export function Hub() {
  const feed = useFeed()
  const [view, setView] = useState<View>('Results')
  const [demo, setDemo] = useState(false)
  useEffect(() => {
    const change = () => { if (window.location.hash !== '#main') { setView(readView()); window.scrollTo({top:0}) } }
    change()
    window.addEventListener('hashchange',change)
    return () => window.removeEventListener('hashchange',change)
  },[])
  useEffect(() => { document.title = `${view} · Tally` },[view])
  return <>
    <nav className="hub-nav" aria-label="Main sections">{views.map(name => <a key={name} href={`#${name.toLowerCase()}`} aria-current={view === name ? 'page' : undefined}><Icon name={viewIcons[name]}/>{name === 'Prediction' ? 'Make your prediction' : name}</a>)}</nav>
    <section className="hero" aria-labelledby="title"><div><h1 id="title">{view === 'Prediction' ? 'Your call. Your Parliament.' : view === 'Results' ? 'The count. The direction. The possibilities.' : view === 'Electorates' ? 'Your local picture.' : view === 'Parties' ? 'Every party in view.' : view === 'Coalitions' ? 'Explore the numbers together.' : view === 'Analysis' ? 'From numbers to understanding.' : 'Know what you’re reading.'}</h1><p className="hero-description">{view === 'Coalitions' ? 'Hypothetical groupings. Clear assumptions. No implied political agreements.' : 'An independent election dashboard with clear sources and honest limits.'}</p></div><div className="election-date"><Icon name="calendar"/><p>General election<strong>7 November 2026</strong></p></div></section>
    <div hidden={view === 'Results'} className={`notice ${demo ? '' : 'reference-notice'}`}><Icon name="info"/><p>{demo ? <><strong>Fictional demo enabled.</strong> Vote totals and scenarios are invented. No live results.</> : <><strong>{feed.data ? isStale(feed.data,feed.error) ? 'Stale source snapshot.' : feed.data.status==='preliminary' ? 'Preliminary feed connected.' : 'Official feed connected; no published results shown.' : 'Official feed connecting or unavailable.'}</strong> Scenarios always use fictional votes.</>}</p><a href="#sources">Sources <Icon name="arrow"/></a></div>
    <div className="hub-view" hidden={view !== 'Results'}><Overview feed={feed} active={view === 'Results'}/></div>
    <div className="hub-view" hidden={view !== 'Electorates'}>{demo?<Explorer demo/>:<OfficialElectorates feed={feed}/>}</div>
    <div className="hub-view" hidden={view !== 'Parties'}><OfficialParties feed={feed}/></div>
    <div className="hub-view" hidden={view !== 'Coalitions'}><div className="coalition-comparisons"><h2>Three possible groupings</h2><p className="section-intro">Illustrative combinations using fictional votes. These do not assert current alliances, coalition commitments or likelihood of forming a government.</p><div className="coalition-rows">{coalitionPresets.map(preset => {
      const allocated = allocateScenario(parties.map(p => p.votes))
      const count = parties.reduce((sum,p,i) => sum+(preset.parties.includes(p.name) ? allocated[i] : 0),0)
      return <div key={preset.name}><h3>{preset.name}</h3><div className="coalition-meter" aria-hidden="true"><span style={{width:`${count/120*100}%`}}/><i/></div><p><strong>{count} / 120</strong> · {count>=61 ? 'Reaches' : 'Below'} the 61-seat scenario threshold</p></div>
    })}</div></div><Parliament/></div>
    <div className="hub-view" hidden={view !== 'Analysis'}>{demo?<Insights demo setDemo={setDemo}/>:<><OfficialInsights feed={feed}/><button className="text-button" onClick={()=>setDemo(true)}>Explore fictional analysis instead</button><Analysis/></>}</div>
    <div className="hub-view" hidden={view !== 'Sources'}><Sources/></div>
    <div className="hub-view" hidden={view !== 'Prediction'}><Prediction/></div>
  </>
}
