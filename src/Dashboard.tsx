'use client'

import React from 'react'
import { Hub } from './Hub'
import { TallyMark } from './Icons'

export function Dashboard() {
  return <>
    <a className="skip-link" href="#main">Skip to dashboard</a>
    <header className="site-header"><div className="shell flex items-center justify-between gap-4">
      <a className="brand" href="#results" aria-label="Tally home"><TallyMark/><span>Tally<span className="brand-sub">AOTEAROA NEW ZEALAND</span></span></a>
      <span className="edition">GENERAL ELECTION <strong>2026</strong></span>
    </div></header>
    <main id="main" tabIndex={-1} className="shell"><Hub/>
      <footer><p><strong>Tally</strong><span className="footer-separator">/</span>An independent project.</p><p>Source counts are preliminary · Scenarios are fictional · <a href="#sources">Sources & limitations</a></p></footer>
    </main>
  </>
}
