import { majority, seatPoints, type SeatRow } from './parliament'
export function Chamber({rows, selectedParties = [], majorityTotal, context = 'Scenario'}:{rows:SeatRow[]; selectedParties?:readonly string[]; majorityTotal?:number; context?:string}) {
 const total=rows.reduce((n,r)=>n+r.seats,0)
 const names=rows.flatMap(row=>Array.from({length:row.seats},()=>row.name))
 const highlighted=new Set(selectedParties)
 const selected=rows.reduce((sum,row)=>sum+(highlighted.has(row.name)?row.seats:0),0)
 const threshold=majority(majorityTotal??total)
 return <svg className="parliament-chart" viewBox="0 0 400 220" role="img" aria-label={`${context}: ${total} seats. ${rows.map(r=>`${r.name}: ${r.seats}`).join(', ')}. ${threshold} needed for a majority.${selectedParties.length?` Selected parties: ${selected} seats.`:''}`}>
  {seatPoints(rows).map((p,i)=><circle key={i} data-party={names[i]} data-selected={highlighted.has(names[i])} className={highlighted.size&&!highlighted.has(names[i])?'seat-muted':undefined} cx={p.x.toFixed(3)} cy={p.y.toFixed(3)} r={total>150?3:4.2} fill={p.color}/>)}
  <text x="200" y="172" textAnchor="middle" className="chamber-total" style={{fontSize:22}}>{total} seats</text><text x="200" y="202" textAnchor="middle" className="chamber-label">{threshold} for a majority</text>
 </svg>
}
