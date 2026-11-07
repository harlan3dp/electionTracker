import {partyStyle,partyColor} from './partyStyle'
import { allocateScenario } from './analysis'
export const predictionParties = ['National','ACT','NZ First','Labour','Green','Te Pāti Māori','TOP'].map(name=>({name,color:partyColor(name)}))
export const majority = (total:number) => Math.floor(total / 2) + 1
export function mmpScenario(votes:readonly number[], electorates:readonly number[], independentSeats=0) {
  if(votes.some(v=>!Number.isFinite(v)||v<0||v>100)||votes.length!==electorates.length || electorates.some(n=>!Number.isInteger(n)||n<0) || !Number.isInteger(independentSeats)||independentSeats<0||independentSeats>=120) throw Error('Invalid electorate assumptions')
  const eligible = votes.map((v,i)=>v>=5 || electorates[i]>0 ? v : 0)
  const entitlement = allocateScenario(eligible,120-independentSeats)
  const totals = entitlement.map((n,i)=>Math.max(n,electorates[i]))
  const list = totals.map((n,i)=>n-electorates[i])
  const overhang = totals.reduce((n,v,i)=>n+Math.max(0,v-entitlement[i]),0)
  const total = totals.reduce((n,v)=>n+v,independentSeats)
  return {entitlement,totals,list,overhang,total,majority:majority(total)}
}
export function percentageSeats(share:number,electorates:number,eligiblePool:number) {
  if(!Number.isFinite(share)||share<0||share>100||eligiblePool<=0||eligiblePool>100||share>eligiblePool)throw Error('Invalid vote percentage')
  return Math.max(electorates, share>=5||electorates>0 ? Math.round(120*share/eligiblePool) : 0)
}
export type SeatRow={name:string;color:string;seats:number}
export function seatPoints(rows:readonly SeatRow[]) {
  const total=rows.reduce((s,r)=>s+r.seats,0)
  const ordered=[...rows].sort((a,b)=>partyStyle(a.name).order-partyStyle(b.name).order||partyStyle(a.name).name.localeCompare(partyStyle(b.name).name))
  const dots=ordered.flatMap(r=>Array.from({length:r.seats},()=>({name:r.name,color:partyStyle(r.name).order===4?r.color:partyColor(r.name)})))
  const points: {x:number;y:number;color:string;angle:number}[]=[]
  // Evenly distribute exactly the requested number of seats over five arcs.
  const counts=[14,19,24,29,34].map(n=>Math.floor(n/120*total))
  for(let i=0;counts.reduce((a,b)=>a+b,0)<total;i++)counts[i%5]++
  counts.forEach((n,row)=>Array.from({length:n},(_,i)=>{
    const angle=n===1?Math.PI/2:Math.PI-i*Math.PI/(n-1)
    points.push({x:200+Math.cos(angle)*(64+row*24),y:185-Math.sin(angle)*(64+row*24),color:'',angle})
  }))
  points.sort((a,b)=>b.angle-a.angle||a.x-b.x)
  return points.map((p,i)=>({...p,color:dots[i].color,party:dots[i].name}))
}
