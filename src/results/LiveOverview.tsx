import { Trends } from './Trends'
import { ElectorateCoverage } from './ElectorateCoverage'
import { SeatScenario } from '../SeatScenario'
import { predictionParties } from '../parliament'
import { FeedNotice, color } from './Official'
import type { NationalState } from './Official'
import { formatNumber } from '../demo'
import { isStale } from './useFeed'

export function LiveOverview({ feed }: { feed: NationalState }) {
  const snapshot = feed.data
  const results = snapshot?.results ? [...snapshot.results].sort((a, b) => b.votes - a.votes) : null
  const stale = snapshot && isStale(snapshot, feed.error)
  const status = feed.loading && !snapshot ? 'Connecting' : !snapshot ? 'Unavailable' : stale ? 'Stale snapshot' : snapshot.status === 'preliminary' ? 'Preliminary' : snapshot.status === 'withheld' ? 'Awaiting verification' : 'Awaiting counts'
  const aliases = ['national','act','new zealand first','labour','green','māori','opportunit']
  const shares = predictionParties.map((_,i)=>results?.filter(r=>snapshot!.parties.find(p=>p.id===r.partyId)?.name.toLowerCase().includes(aliases[i])).reduce((n,r)=>n+r.percentage,0)??0)
  const completeShares = Math.abs(shares.reduce((a,b)=>a+b,0)-100)<0.05 ? shares : undefined
  return <div className="live-dashboard">
    <dl className="election-metrics">
      <div><dt>RESULTS STATUS</dt><dd><span className={`signal-dot ${results && !stale ? 'signal-active' : ''}`} aria-hidden="true"/>{status}</dd><dd className="metric-context">Validated source data only</dd></div>
      <div><dt>VALID PARTY VOTES</dt><dd>{results ? formatNumber(results.reduce((total, p) => total + p.votes, 0)) : '—'}</dd><dd className="metric-context">{results ? 'In this preliminary snapshot' : 'Not yet published'}</dd></div>
      <div><dt>VOTING PLACES COUNTED</dt><dd>{snapshot?.reporting && snapshot.reporting.total > 0 ? `${snapshot.reporting.percentage.toFixed(1)}%` : '—'}</dd><dd className="metric-context">{snapshot?.reporting && snapshot.reporting.total > 0 ? `${formatNumber(snapshot.reporting.counted)} of ${formatNumber(snapshot.reporting.total)} places` : 'Reporting progress not available'}</dd></div>
    </dl>
    <div className="night-grid">
      <section className="night-card" aria-labelledby="party-vote-title">
        <div className="night-card-heading"><div><h3 id="party-vote-title">Party vote</h3></div><span className="tag">{results ? 'PRELIMINARY' : 'LIVE COVERAGE'}</span></div>
        {results ? <ul className="party-list">{results.map(result => {
          const party = snapshot!.parties.find(p => p.id === result.partyId)!
          return <li key={party.id}><div className="party-row"><span className="party-name"><span className="party-dot" style={{ backgroundColor: color(party.name) }}/>{party.name}</span><span className="party-numbers"><span>{formatNumber(result.votes)}</span><strong>{result.percentage.toFixed(1)}<small>%</small></strong></span></div><div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${result.percentage}%`, backgroundColor: color(party.name) }}/></div></li>
        })}</ul> : <div className="election-empty">
          <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><circle cx="40" cy="40" r="33" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M40 20v21l14 8" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="40" cy="40" r="3" fill="currentColor"/></svg>
          <p className="eyebrow">{feed.loading && !snapshot ? 'CONNECTING TO THE SOURCE' : snapshot?.status === 'waiting' ? 'EVERY VOTE STARTS A STORY' : 'CLEAR SOURCES. VERIFIED COUNTS.'}</p>
          <h4>{feed.loading && !snapshot ? 'Getting the latest picture.' : snapshot?.status === 'waiting' ? 'Ready for the first results.' : snapshot?.status === 'withheld' ? 'Counts are awaiting verification.' : 'Waiting for a verified update.'}</h4>
          <p>{snapshot?.status === 'withheld' ? 'Figures are held until the source and publication requirements are confirmed.' : 'Results will appear here when the official feed supplies validated, publishable counts. Missing figures are never treated as zero votes.'}</p>
          <a className="empty-source-link" href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Visit official election results →</a>
        </div>}
        <p className="night-footnote">{results ? 'Share of valid party votes. Preliminary counts can change. Voting places reporting is not the share of all votes counted.' : 'Preliminary results are scheduled from 7pm NZ time, 7 November 2026. No results or projections are invented.'}</p>
      </section>
      <aside className="night-sidebar">
        <section className="official-card"><p className="mini-label">FROM THE SOURCE</p><h3>Your election.<br/>A clearer picture.</h3><p>Follow the count with transparent timestamps, local races and direct links to the Electoral Commission.</p><a href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Official election results <span aria-hidden="true">→</span></a></section>
        <section className="seat-status"><h3>Model not yet available</h3><p>Majority probabilities and uncertainty ranges will appear only after a forecasting model is validated. Seat scenarios below use explicit assumptions, not a live forecast.</p><a href="#electorates">Explore local races <span aria-hidden="true">→</span></a></section>
      </aside>
    </div>
    <FeedNotice feed={feed}/>
    <Trends snapshot={snapshot}/>
    <ElectorateCoverage snapshot={snapshot}/>
    <SeatScenario liveShares={completeShares}/>
    <div className="prediction-invite"><div><h2>What’s your Parliament?</h2><p>Make a seven-party seat prediction and save an image to compare with friends.</p></div><a className="primary-button" href="#prediction">Make your prediction →</a></div>
  </div>
}
