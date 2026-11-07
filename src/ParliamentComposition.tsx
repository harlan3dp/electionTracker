import { Chamber } from './Chamber'
import { Icon } from './Icons'
import type { SeatRow } from './parliament'
import type { useElectorateCoverage } from './results/ElectorateCoverage'
import { color } from './results/Official'
import type { Snapshot } from './results/types'

export function sourceSeatRows(snapshot: Snapshot | null): SeatRow[] | null {
  if(snapshot?.status!=='preliminary'||!snapshot.results?.length||!snapshot.results.every(result=>result.seats))return null
  const rows=snapshot.results.map(result=>{
    const party=snapshot.parties.find(p=>p.id===result.partyId)!
    return {name:party.name,color:color(party.name),seats:result.seats!.total}
  })
  return rows.some(row=>row.seats>0)?rows:null
}

export type ParliamentModel = ReturnType<typeof useElectorateCoverage>

export function modelledRows(model: ParliamentModel): SeatRow[] | null {
  return model.estimate ? model.registered.map((party, i) => ({ name: party.name, color: color(party.name), seats: model.estimate!.totals[i] })) : null
}

export function ParliamentComposition({ rows, selectedParties, title = 'The next Parliament', label = 'Modelled seats', children }: {
  rows: SeatRow[] | null; selectedParties?: readonly string[]; title?: string; label?: string; children?: React.ReactNode
}) {
  const total=rows?.reduce((sum,row)=>sum+row.seats,0)??0
  return <section className="desk-panel composition-panel" aria-label={title}>
    <div className="section-heading"><h2>{title}</h2><span className="tag">{rows ? label : 'Awaiting data'}</span></div>
    {rows ? <>
      <Chamber rows={rows} selectedParties={selectedParties} context={label}/>
      {total>=120&&<p className="tiny">120 base seats + {total-120} overhang · {total} seats in total</p>}
      <ul className="compact-seat-breakdown" aria-label="Party seat totals">{rows.filter(row => row.seats > 0).map(row => <li key={row.name}><span className="party-name"><span className="party-dot" style={{ background: row.color }}/>{row.name}</span><strong>{row.seats}</strong></li>)}</ul>
      {children}
    </> : <div className="composition-empty"><Icon name="coalitions"/><h3>Seat allocation unavailable</h3><p>Waiting for a fresh preliminary seat calculation from the official feed.</p></div>}
  </section>
}
