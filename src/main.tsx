import React from 'react'
import { createRoot } from 'react-dom/client'
import { formatNumber, parties, totalVotes, voteShare } from './demo'
import './styles.css'
import { Explorer, Parliament, Analysis } from './Explorer'

function App() {
  return <>
    <header className="site-header"><div className="shell flex items-center justify-between gap-4">
      <a className="brand" href="#main"><span className="brand-icon" aria-hidden="true">✳</span><span>Election Tracker<span className="brand-sub">AOTEAROA NEW ZEALAND</span></span></a>
      <span className="edition">GENERAL ELECTION <strong>2026</strong></span>
    </div></header>
    <main id="main" className="shell">
      <nav className="dashboard-nav" aria-label="Dashboard sections"><a href="#main">National results</a><a href="#electorates">Electorates</a><a href="#parliament">Parliament & analysis</a></nav>
      <div className="notice"><span className="notice-dot" aria-hidden="true"/><p><strong>Demonstration mode.</strong> All figures below are fictional. Live election results are not connected.</p></div>
      <section className="hero" aria-labelledby="title"><div><p className="eyebrow">7 NOVEMBER 2026 · NEW ZEALAND</p><h1 id="title">Every vote.<br/><span>The bigger picture.</span></h1><p className="hero-description">A clear view of the election, from your electorate to the nation.</p></div><div className="hero-note"><span className="mini-label">YOUR ELECTION NIGHT COMPANION</span><p>One country.<br/>Many voices.</p><span className="leaf" aria-hidden="true">✳</span></div></section>
      <div className="section-heading"><div><p className="eyebrow">THE NATIONAL PICTURE</p><h2>Party vote</h2></div><span className="tag">DEMO DATA</span></div>
      <div className="dashboard-grid">
        <section className="results-card" aria-label="Demonstration party vote results"><div className="card-heading"><h3>Share of the vote</h3><span>Illustrative figures</span></div>
          <ul className="party-list">{parties.map(party => <li key={party.name}><div className="party-row"><span className="party-name"><span className="party-dot" style={{ backgroundColor: party.color }} />{party.name}</span><span className="party-numbers"><span>{formatNumber(party.votes)}</span><strong>{voteShare(party.votes, totalVotes).toFixed(1)}<small>%</small></strong></span></div><div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${voteShare(party.votes, totalVotes)}%`, backgroundColor: party.color }}/></div></li>)}</ul>
          <p className="card-footnote">Fictional party votes for interface demonstration only. These are not polls or predictions.</p>
        </section>
        <aside className="space-y-5"><section className="summary-card"><p className="mini-label">DEMONSTRATION VOTES</p><p className="big-number">{formatNumber(totalVotes)}</p><p className="muted">Across the illustrative party totals</p><div className="summary-divider"/><div className="flex justify-between gap-4"><span className="muted">Reporting progress</span><strong>Unavailable</strong></div><p className="tiny">Official reporting progress and timestamps will appear when a verified feed is connected.</p></section>
        <section className="official-card"><span className="mini-label">LOOKING FOR LIVE RESULTS?</span><h3>Go straight to the source.</h3><p>This independent project is still being built. Visit the Electoral Commission for official election results.</p><a href="https://www.electionresults.govt.nz/" target="_blank" rel="noreferrer">Official results <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></section></aside>
      </div>
      <Explorer />
      <Parliament />
      <Analysis />
      <footer><p><strong>Election Tracker</strong> · An independent project.</p><p>Demo only · No live results · Not affiliated with the Electoral Commission</p></footer>
    </main>
  </>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
