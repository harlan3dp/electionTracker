import { majority, seatPoints, type SeatRow } from './parliament'
export function Chamber({rows}:{rows:SeatRow[]}) {
 const total=rows.reduce((n,r)=>n+r.seats,0)
 return <svg className="parliament-chart" viewBox="0 0 400 220" role="img" aria-label={`${total} scenario seats. ${rows.map(r=>`${r.name}: ${r.seats}`).join(', ')}. ${majority(total)} needed for a majority.`}>
  {seatPoints(rows).map((p,i)=><circle key={i} cx={p.x.toFixed(3)} cy={p.y.toFixed(3)} r={total>150?3:4.2} fill={p.color}/>)}
  <text x="200" y="172" textAnchor="middle" className="chamber-total" style={{fontSize:22}}>{total} seats</text><text x="200" y="202" textAnchor="middle" className="chamber-label">{majority(total)} for a majority</text>
 </svg>
}
