import {partyStyle} from './partyStyle'
import { majority, seatPoints, type SeatRow } from './parliament'
export function Chamber({rows, selectedParties = [], majorityTotal, context = 'Scenario'}:{rows:SeatRow[]; selectedParties?:readonly string[]; majorityTotal?:number; context?:string}) {
 const total=rows.reduce((n,r)=>n+r.seats,0)
 const highlighted=new Set(selectedParties)
 const selected=rows.reduce((sum,row)=>sum+(highlighted.has(row.name)?row.seats:0),0)
 const threshold=majority(majorityTotal??total)
 return <svg className="parliament-chart" viewBox="0 0 400 220" role="img" aria-label={`${context}: ${total} seats. ${rows.map(r=>`${r.name}: ${r.seats}`).join(', ')}. ${threshold} needed for a majority.${selectedParties.length?` Selected parties: ${selected} seats.`:''}`}>
  {seatPoints(rows).map((p,i)=><circle key={i} data-party={p.party} data-selected={highlighted.has(p.party)} className={highlighted.size&&!highlighted.has(p.party)?'seat-muted':undefined} cx={p.x.toFixed(3)} cy={p.y.toFixed(3)} r={total>150?3:4.2} fill={p.color}/>)}
  <desc>Display arrangement only: Labour at the left, National at the right. Party groups are not coalition agreements or official chamber positions.</desc>
  {rows.some(r=>partyStyle(r.name).name==='Labour'&&r.seats>0)&&<text x="18" y="210" className="chamber-label">Labour</text>}
  {rows.some(r=>partyStyle(r.name).name==='National'&&r.seats>0)&&<text x="382" y="210" textAnchor="end" className="chamber-label">National</text>}
  <text x="200" y="172" textAnchor="middle" className="chamber-total" style={{fontSize:22}}>{total} seats</text><text x="200" y="202" textAnchor="middle" className="chamber-label">{threshold} for a majority</text>
 </svg>
}
