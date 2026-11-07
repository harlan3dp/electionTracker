import { useState } from 'react'
import { allocateScenario } from './analysis'
import { parties } from './demo'
import { normalizeSearch } from './electorates'
import { Parliament as LegacyScenarios } from './Explorer'
import { majority, type SeatRow } from './parliament'
import { ParliamentComposition, modelledRows, type ParliamentModel } from './ParliamentComposition'
import { coalitionPresets } from './reference'
import { SeatScenario } from './SeatScenario'
import type { NationalState } from './results/Official'
import { isStale } from './results/useFeed'

const baseline = allocateScenario(parties.map(party => party.votes))
const exampleRows: SeatRow[] = parties.map((party, i) => ({ name: party.name, color: party.color, seats: baseline[i] }))
const aliases: Record<string, string> = {
  'national party': 'national', 'new zealand national party': 'national',
  'labour party': 'labour', 'new zealand labour party': 'labour',
  'act new zealand': 'act', 'new zealand first party': 'nz first',
  'green party': 'green', 'green party of aotearoa new zealand': 'green',
}
const canonical = (name: string) => aliases[normalizeSearch(name)] ?? normalizeSearch(name)

export function ParliamentView({ feed, model }: { feed: NationalState; model: ParliamentModel }) {
  const [selected, setSelected] = useState<string[]>([])
  const [example, setExample] = useState(false)
  const sourceRows = feed.data && !isStale(feed.data, feed.error) ? modelledRows(model) : null
  const hypothetical = example || !sourceRows
  const rows = hypothetical ? exampleRows : sourceRows!
  const selectedRows = rows.filter(row => selected.includes(canonical(row.name)))
  const total = rows.reduce((sum, row) => sum + row.seats, 0)
  const threshold = majority(total)
  const coalitionSeats = selectedRows.reduce((sum, row) => sum + row.seats, 0)
  const outcome = coalitionSeats >= threshold ? 'Majority reached' : `${threshold - coalitionSeats} seats short`
  const withSeats = rows.filter(row => row.seats > 0)

  function toggle(name: string) {
    const key = canonical(name)
    setSelected(current => current.includes(key) ? current.filter(value => value !== key) : [...current, key])
  }
  return <section className="parliament-page">
    <div className={hypothetical ? 'scenario-label' : 'model-label'}>
      <strong>{hypothetical ? 'Hypothetical example · fictional votes' : 'Modelled seats · not an official allocation'}</strong>
      <span>{hypothetical ? 'Explore a fictional 120-seat Parliament.' : 'If current party shares and electorate leads held.'}</span>
      {sourceRows && <button className="text-button" onClick={() => setExample(value => !value)}>{hypothetical ? 'Use current modelled seats' : 'Use fictional example'}</button>}
    </div>
    <div className="coalition-workspace">
      <div className="sticky-chamber" id="coalition-chamber"><ParliamentComposition rows={rows} selectedParties={selectedRows.map(row => row.name)} title="Parliamentary composition" label={hypothetical ? 'Fictional scenario' : 'Modelled seats'}>
        <div className="coalition-outcome" aria-live="polite"><strong>{coalitionSeats} seats</strong><span>{selected.length ? outcome : `Select parties · ${threshold} seats for a majority`}</span></div>
      </ParliamentComposition></div>
      <div className="coalition-builder">
        <h2>Possible coalitions</h2><p className="tiny">Mathematical combinations, not political agreements.</p>
        {selected.length>0&&<div className="mobile-coalition-status"><span><strong>{coalitionSeats} seats</strong><small>{outcome}</small></span><button className="text-button" onClick={()=>document.getElementById('coalition-chamber')?.scrollIntoView({block:'start'})}>View chamber ↑</button></div>}
        <div className="coalition-options">{coalitionPresets.map(preset => {
          const names = preset.parties.map(canonical)
          const seats = rows.reduce((sum, row) => sum + (names.includes(canonical(row.name)) ? row.seats : 0), 0)
          const pressed = selected.length === names.length && names.every(name => selected.includes(name))
          return <button key={preset.name} aria-pressed={pressed} onClick={() => setSelected(names)}><span>{preset.name}</span><strong>{seats} seats</strong><small>{seats >= threshold ? 'Majority reached' : `${threshold - seats} seats short`}</small></button>
        })}</div>
        <details className="build-coalition"><summary>Build your own coalition</summary><fieldset><legend className="sr-only">Select coalition parties</legend>{withSeats.map(row => <label className="partner-choice" key={row.name}><input type="checkbox" checked={selected.includes(canonical(row.name))} onChange={() => toggle(row.name)}/><span className="party-dot" style={{ background: row.color }}/><span>{row.name}</span><strong>{row.seats}</strong></label>)}</fieldset>

        </details>
        <button className="text-button" onClick={() => setSelected([])}>Clear selection</button>
      </div>
    </div>
    <details className="desk-details" id="advanced-scenarios"><summary>Advanced scenarios</summary>
          {rows.some(row => row.seats === 0) && <details className="other-parties"><summary>Other coalition parties (no allocated seats)</summary>{rows.filter(row => row.seats === 0).map(row => <label className="partner-choice" key={row.name}><input type="checkbox" checked={selected.includes(canonical(row.name))} onChange={() => toggle(row.name)}/>{row.name}<strong>0</strong></label>)}</details>}
      <SeatScenario/>
      <details className="desk-details"><summary>Explore a party-vote share and custom grouping</summary><LegacyScenarios/></details>
    </details>
    <p className="tiny scenario-method-link"><a href="#sources">Sources & methodology</a></p>
  </section>
}
