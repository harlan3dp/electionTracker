import { FeedNotice, color } from './Official'
import type { NationalState } from './Official'
import { formatNumber } from '../demo'
import { isStale } from './useFeed'

export function LiveOverview({ feed }: { feed: NationalState }) {
  const snapshot = feed.data
  const results = snapshot?.results ? [...snapshot.results].sort((a, b) => b.votes - a.votes) : null
  const stale = snapshot && isStale(snapshot, feed.error)
  const status = feed.loading && !snapshot ? 'Connecting' : !snapshot ? 'Unavailable' : stale ? 'Stale snapshot' : snapshot.status === 'preliminary' ? 'Preliminary' : snapshot.status === 'withheld' ? 'Awaiting verification' : 'Awaiting counts'
  return <div className="live-dashboard">
    <dl className="election-metrics">
      <div><dt>RESULTS STATUS</dt><dd><span className={`signal-dot ${results && !stale ? 'signal-active' : ''}`} aria-hidden="true"/>{status}</dd><p>Validated source data only</p></div>
      <div><dt>VALID PARTY VOTES</dt><dd>{results ? formatNumber(results.reduce((total, p) => total + p.votes, 0)) : '—'}</dd><p>{results ? 'In this preliminary snapshot' : 'Not yet published'}</p></div>
      <div><dt>VOTING PLACES COUNTED</dt><dd>{snapshot?.reporting && snapshot.reporting.total > 0 ? `${snapshot.reporting.percentage.toFixed(1)}%` : '—'}</dd><p>{snapshot?.reporting && snapshot.reporting.total > 0 ? `${formatNumber(snapshot.reporting.counted)} of ${formatNumber(snapshot.reporting.total)} places` : 'Reporting progress not available'}</p></div>
    </dl>
    <div className="night-grid">
      <section className="night-card" aria-labelledby="party-vote-title">
        <div className="night-card-heading"><div><p className="eyebrow">THE NATIONAL PICTURE</p><h3 id="party-vote-title">Party vote</h3></div><span className="tag">{results ? 'PRELIMINARY' : 'LIVE COVERAGE'}</span></div>
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
        <section className="seat-status"><p className="eyebrow">PARLIAMENT</p><h3>Seats follow the evidence.</h3><p>No seat projection is available from this feed. Preliminary vote leads are never presented as elected winners.</p><a href="#electorates">Explore local races <span aria-hidden="true">→</span></a></section>
      </aside>
    </div>
    <FeedNotice feed={feed}/>
  </div>
}
