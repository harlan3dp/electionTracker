import { useEffect, useState } from 'react'
import { useFeed } from './results/useFeed'
import { useElectorateCoverage } from './results/ElectorateCoverage'
import { HomeDashboard } from './results/HomeDashboard'
import { ParliamentView } from './ParliamentView'
import { Prediction } from './Prediction'
import { historicalSource } from './reference'
import { destinations, resolveRoute, type Route } from './navigation'
import { Icon } from './Icons'

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children} <Icon name="external"/><span className="sr-only"> (opens in a new tab)</span></a>
}

function Sources() {
  return <section className="sources-section"><h2>Sources & confidence</h2><p className="section-intro">Source access rechecked 6 November 2026 (NZ time). The adapter was verified against captured public XML; current reachability is shown by the feed status. The adapter parses the observed election, statistics, party, electorate and candidate XML schemas. Source directory data is displayed as supplied, with validation and provenance. Permissions, election/test identity and publishing requirements still need review before nonzero counts are activated.</p><dl className="source-ledger"><div><dt>Live results</dt><dd><SourceLink href="https://media.election.net.nz/xml/">Electoral Commission media XML</SourceLink><strong>Validated adapter · see current feed status</strong><p>National and selected electorate counts are checked every 60 seconds. The observed XML has no explicit election/test identifier, so nonzero publication requires release-time validation and a reviewed production setting. Feed-use terms and test status must be confirmed before activation.</p></dd></div><div><dt>Parties & candidates</dt><dd><SourceLink href="https://elections.nz/">Electoral Commission</SourceLink><strong>Media feed directory loaded dynamically</strong><p>Party registration flags, candidate affiliations and electorate names come from source XML. List-only candidates are retained in the data but are not presented as electorate candidates. This directory does not identify current MPs.</p></dd></div><div><dt>Historical representatives</dt><dd><SourceLink href={historicalSource}>Official 2023 election results</SourceLink><strong>Historical reference · unverified transcription</strong><p>Manually entered 2023 winners may differ from current MPs. Vacancies, by-elections, deaths and affiliation changes are not reflected. Verify before relying on a name.</p></dd></div><div><dt>Current MPs</dt><dd><SourceLink href="https://www.parliament.nz/">New Zealand Parliament</SourceLink><strong>Not imported</strong><p>Current MPs and nominated candidates require different sources and will be displayed separately.</p></dd></div><div><dt>Map geography</dt><dd><SourceLink href="https://www.naturalearthdata.com/">Natural Earth</SourceLink><strong>Bundled geographic coastline</strong><p>Public-domain 1:50m main-island coastline. Marker anchors are approximate, not electoral boundaries. Māori and general geography overlaps; Te Tai Tonga spans both islands.</p></dd></div><div><dt>Polls & predictive modelling</dt><dd><strong>No data loaded</strong><p>No poll estimates or probabilistic forecasts are generated. A future model needs attributed polls, fieldwork dates, historical boundary crosswalks and backtesting.</p></dd></div></dl><h3 className="subheading">Before public release</h3><p className="section-intro">Verify current rosters, results access and reuse permissions, full MMP allocation rules and applicable election-day publishing requirements. A hypothetical grouping is not an agreement to form a government.</p></section>
}

export function Hub() {
  const feed = useFeed()
  const model = useElectorateCoverage(feed.data)
  const [route, setRoute] = useState<Route>(() => resolveRoute(''))
  const titles = { results: 'Election 2026', parliament: 'Parliament', prediction: 'Your Prediction', sources: 'Sources & information' }
  useEffect(() => {
    const change = () => { if (window.location.hash !== '#main') setRoute(resolveRoute(window.location.hash)) }
    change()
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    document.title = `${titles[route.destination]} · Tally`
    const frame = requestAnimationFrame(() => {
      if (route.detail) {
        const target = document.getElementById(route.detail)
        if (target instanceof HTMLDetailsElement) target.open = true
        const legacyTarget = window.location.hash === '#analysis-title' ? document.getElementById('analysis-title') : null
        if (legacyTarget) {
          let parent: HTMLElement | null = legacyTarget.parentElement
          while (parent) { if (parent instanceof HTMLDetailsElement) parent.open = true; parent = parent.parentElement }
        }
        ;(legacyTarget ?? target)?.scrollIntoView({ block: 'start' })
      } else {
        window.scrollTo({ top: 0 })
      }
    })
    return () => cancelAnimationFrame(frame)
  // Titles are static display labels.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])
  return <>
    <nav className="hub-nav primary-nav" aria-label="Main sections">{destinations.map(destination => <a key={destination.id} href={`#${destination.id}`} aria-current={route.destination === destination.id ? 'page' : undefined}>{destination.label}</a>)}</nav>
    <header className="page-heading"><h1 id="title">{titles[route.destination]}</h1>{route.destination === 'results' && <a className="information-link" href="#sources"><Icon name="info"/><span>Sources & information</span></a>}</header>
    <div className="hub-view" hidden={route.destination !== 'results'}><HomeDashboard feed={feed} model={model} detail={route.detail} active={route.destination === 'results'}/></div>
    <div className="hub-view" hidden={route.destination !== 'parliament'}><ParliamentView feed={feed} model={model}/></div>
    <div className="hub-view" hidden={route.destination !== 'prediction'}><Prediction/></div>
    <div className="hub-view" hidden={route.destination !== 'sources'}><Sources/></div>
  </>
}
