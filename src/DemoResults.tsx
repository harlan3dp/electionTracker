import { formatNumber, parties, totalVotes, voteShare } from './demo'
export function DemoResults() { return <>
      <div className="section-heading"><div><h2>Party vote</h2></div><span className="tag">DEMO DATA</span></div>
      <div className="dashboard-grid">
        <section className="results-card" aria-label="Demonstration party vote results"><div className="card-heading"><h3>Share of the vote</h3><span>Illustrative figures</span></div>
          <ul className="party-list">{parties.map(party => <li key={party.name}><div className="party-row"><span className="party-name"><span className="party-dot" style={{ backgroundColor: party.color }} />{party.name}</span><span className="party-numbers"><span>{formatNumber(party.votes)}</span><strong>{voteShare(party.votes, totalVotes).toFixed(1)}<small>%</small></strong></span></div><div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${voteShare(party.votes, totalVotes)}%`, backgroundColor: party.color }}/></div></li>)}</ul>
          <p className="card-footnote">Fictional party votes for interface demonstration only. These are not polls or predictions.</p>
        </section>
        <aside className="space-y-5"><section className="summary-card"><p className="mini-label">DEMONSTRATION VOTES</p><p className="big-number">{formatNumber(totalVotes)}</p><p className="muted">Across the illustrative party totals</p><div className="summary-divider"/><div className="flex justify-between gap-4"><span className="muted">Reporting progress</span><strong>Unavailable</strong></div><p className="tiny">Official reporting progress and timestamps will appear when a verified feed is connected.</p></section>
        <section className="official-card"><span className="mini-label">LOOKING FOR LIVE RESULTS?</span><h3>Go straight to the source.</h3><p>This independent project is still being built. Visit the Electoral Commission for official election results.</p><a href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Official results <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg><span className="sr-only"> (opens in a new tab)</span></a></section></aside>
      </div>

</> }
