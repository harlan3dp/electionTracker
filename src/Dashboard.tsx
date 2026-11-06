'use client'

import React from 'react'
import { Hub } from './Hub'

export function Dashboard() {
  return <>
    <a className="skip-link" href="#main">Skip to dashboard</a>
    <header className="site-header"><div className="shell flex items-center justify-between gap-4">
      <a className="brand" href="#results"><svg className="brand-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v24M4 16h24M7.5 7.5l17 17m-17 0 17-17" fill="none" stroke="currentColor" strokeWidth="3"/></svg><span>Election Tracker<span className="brand-sub">AOTEAROA NEW ZEALAND</span></span></a>
      <span className="edition">GENERAL ELECTION <strong>2026</strong></span>
    </div></header>
    <main id="main" tabIndex={-1} className="shell"><Hub/>
      <footer><p><strong>Election Tracker</strong> · An independent project.</p><p>Source counts are preliminary · Scenarios are fictional · <a href="#sources">Sources & limitations</a></p></footer>
    </main>
  </>
}
