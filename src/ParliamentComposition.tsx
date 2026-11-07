import { Chamber } from './Chamber'
import { Icon } from './Icons'
import type { SeatRow } from './parliament'
import type { useElectorateCoverage } from './results/ElectorateCoverage'
import { color } from './results/Official'

export type ParliamentModel = ReturnType<typeof useElectorateCoverage>

export function modelledRows(model: ParliamentModel): SeatRow[] | null {
  return model.estimate ? model.registered.map((party, i) => ({ name: party.name, color: color(party.name), seats: model.estimate!.totals[i] })) : null
}

export function ParliamentComposition({ rows, selectedParties, title = 'The next Parliament', label = 'Modelled seats', children }: {
  rows: SeatRow[] | null; selectedParties?: readonly string[]; title?: string; label?: string; children?: React.ReactNode
}) {
  return <section className="desk-panel composition-panel" aria-label={title}>
    <div className="section-heading"><h2>{title}</h2><span className="tag">{rows ? label : 'Awaiting data'}</span></div>
    {rows ? <>
      <Chamber rows={rows} selectedParties={selectedParties} context={label}/>
      <ul className="compact-seat-breakdown" aria-label="Party seat totals">{rows.filter(row => row.seats > 0).map(row => <li key={row.name}><span className="party-name"><span className="party-dot" style={{ background: row.color }}/>{row.name}</span><strong>{row.seats}</strong></li>)}</ul>
      {children}
    </> : <div className="composition-empty"><Icon name="coalitions"/><h3>Seat allocation unavailable</h3><p>A seat illustration needs complete, fresh electorate counts.</p></div>}
  </section>
}
