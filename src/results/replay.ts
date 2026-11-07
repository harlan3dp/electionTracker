import {mmpScenario,predictionParties} from '../parliament'
// Intentionally fictional design-review frames. Never passed to a feed or stored as observed history.
const shares = [
 [36,8,6,34,10,4,2], [36.5,7.8,5.8,33.8,10.2,4.1,1.8],
 [37,7.5,5.6,33.2,10.5,4.4,1.8], [37.4,7.3,5.4,32.8,10.7,4.6,1.8],
 [37.8,7.1,5.2,32.3,10.9,4.8,1.9], [38,7,5,32,11,5,2],
]
export const replayFrames=shares.map((votes,i)=>{
 const general=[34,1,0,24,2,2,0],maori=i<3?[0,0,0,3,0,4,0]:i===3?[0,0,0,2,0,5,0]:[0,0,0,1,0,6,0]
 const allocation=mmpScenario(votes,general.map((n,j)=>n+maori[j]))
 return {votes,general,maori,allocation,reporting:[35,46,57,69,81,92][i],rows:predictionParties.map((p,j)=>({...p,seats:allocation.totals[j]}))}
})
