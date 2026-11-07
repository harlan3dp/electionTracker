import { useState } from 'react'
import { Chamber } from './Chamber'
import { majority, percentageSeats, predictionParties } from './parliament'
import { exportPrediction } from './predictionImage'
import { nzTime } from './results/useFeed'
const zero=()=>predictionParties.map(()=>0)
export function Prediction() {
 const [name,setName]=useState(''),[values,setValues]=useState(zero),[units,setUnits]=useState(()=>predictionParties.map(()=>'seats'))
 const [electorates,setElectorates]=useState(zero),[pool,setPool]=useState(100),[overhang,setOverhang]=useState(0),[message,setMessage]=useState(''),[saving,setSaving]=useState(false)
 const [stamp,setStamp]=useState<string|null>(null)
 const seats=values.map((n,i)=>units[i]==='seats'?n:percentageSeats(Math.min(n,pool),electorates[i],pool))
 const total=seats.reduce((n,v)=>n+v,0)
 const validInputs=!values.some((v,i)=>!Number.isFinite(v)||v<0||(units[i]==='seats'?!Number.isInteger(v)||v>150:v>pool))&&!seats.some((seat,i)=>seat<electorates[i])
 const remaining=120+overhang-total
 const errors=[...values.some((v,i)=>!Number.isFinite(v)||v<0||(units[i]==='seats'? !Number.isInteger(v)||v>150 : v>pool))?['Check your seat and percentage inputs.']:[],...seats.some((s,i)=>s<electorates[i])?['A party’s seats cannot be fewer than its assumed electorate seats.']:[],...total!==120+overhang?[`Allocate ${120+overhang} seats in total (${total} entered).`]:[]]
 const readyToShare=errors.length===0&&Boolean(name.trim())
 const rows=predictionParties.map((p,i)=>({...p,seats:seats[i]}))
 function update(index:number,value:number){setStamp(null);setValues(old=>old.map((v,i)=>i===index?value:v))}
 async function save(){setMessage('');if(errors.length||!name.trim()){setMessage(!name.trim()?'Enter your nickname before saving.':errors.join(' '));return}setSaving(true);try{const date=new Date().toISOString();await exportPrediction(name.trim(),date,rows,electorates,pool,overhang,values,units);setStamp(date);setMessage('Prediction image saved. Share the PNG with your friends.')}catch{setMessage('Image could not be saved. Please try again.')}finally{setSaving(false)}}
 return <section className="prediction-page">
 <p className="prediction-intro">Pick your seats. Save and share your Parliament.</p>
 <div className={`prediction-layout ${total===0?'prediction-start':''}`}><div className="results-card prediction-form">
 <label className="directory-search">Your nickname<input maxLength={40} value={name} onChange={e=>{setName(e.target.value);setStamp(null)}} placeholder="Name on your image"/></label>
 <dl className="prediction-progress" aria-live="polite"><div><dt>Allocated</dt><dd>{total} <span>/ {120+overhang}</span></dd></div><div><dt>{remaining<0?'Over allocated':'Remaining'}</dt><dd>{Math.abs(remaining)} <span>seats</span></dd></div></dl>
 {(total>0||!validInputs)&&errors.length>0&&<p className="validation-message" role="status">{errors.join(' ')}</p>}
 <div className="prediction-inputs"><div className="prediction-column-labels" aria-hidden="true"><span>Party</span><span>Amount</span><span>Entry type</span></div>{predictionParties.map((p,i)=><div className="prediction-input-row" key={p.name}>
 <label htmlFor={`predict-${i}`}><span className="party-dot" style={{background:p.color}}/>{p.name}</label>
 <input id={`predict-${i}`} aria-label={`${p.name} prediction`} type="number" min="0" max={units[i]==='seats'?150:100} step={units[i]==='seats'?1:0.1} value={values[i]} onChange={e=>update(i,Number(e.target.value))}/>
 <select aria-label={`${p.name} unit`} value={units[i]} onChange={e=>{const unit=e.target.value;setUnits(old=>old.map((v,j)=>j===i?unit:v));update(i,unit==='seats'?seats[i]:Math.round(seats[i]/120*pool*10)/10)}}><option value="seats">seats</option><option value="percent">vote %</option></select>
 {units[i]==='percent'&&<small>Approximate conversion: {seats[i]} seats</small>}
 </div>)}</div>
 <details className="methodology"><summary>Electorate & MMP assumptions</summary><p>*A seat-to-vote proxy is not an inverse MMP calculation. Percentage mode rounds a share of 120 seats within your eligible vote pool, with a 5% threshold or an electorate win. It does not jointly allocate the full Parliament. Use Advanced scenarios on Parliament for a joint Sainte-Laguë calculation. Electorate seats include general and Māori electorates; party identity does not determine the roll.</p>
 <label className="assumption-field">Eligible party-vote pool (%)<input type="number" min="1" max="100" value={pool} onChange={e=>{setPool(Math.max(1,Math.min(100,Number(e.target.value))));setStamp(null)}}/></label>
 {predictionParties.map((p,i)=><label className="assumption-field" key={p.name}>{p.name} electorate seats<input aria-label={`${p.name} assumed electorates`} type="number" min="0" max="100" value={electorates[i]} onChange={e=>{setElectorates(old=>old.map((v,j)=>i===j?Math.max(0,Math.min(100,Math.floor(Number(e.target.value)))):v));setStamp(null)}}/></label>)}
 <label className="assumption-field">Assumed overhang seats<input type="number" min="0" max="50" value={overhang} onChange={e=>{setOverhang(Math.max(0,Math.min(50,Math.floor(Number(e.target.value)))));setStamp(null)}}/></label><p>Overhang here is your explicit assumption, not a verified allocation. Total seats must equal 120 plus your overhang.</p></details>

 <div className="prediction-actions"><button className="primary-button" disabled={saving} onClick={save}>{saving?'Saving…':'Save prediction as image'}</button><button className="text-button" onClick={()=>{setValues(zero());setUnits(predictionParties.map(()=>'seats'));setElectorates(zero());setPool(100);setOverhang(0);setStamp(null);setMessage('')}}>Reset</button><button className="text-button" onClick={()=>{setValues([44,8,7,38,13,8,2]);setUnits(predictionParties.map(()=>'seats'));setElectorates(zero());setPool(100);setOverhang(0);setStamp(null);setMessage('Fictional example loaded. Edit it to make your own prediction.')}}>Load fictional example</button></div>
 <p role="status" className="tiny">{message}</p></div>
 {total>0&&validInputs&&total<=170&&<aside className="prediction-preview" aria-label="Personal Parliament preview">
 <div className={`prediction-card ${!readyToShare?'prediction-incomplete':''}`}>
 {readyToShare&&<div className="prediction-card-brand">Tally <span>YOUR PARLIAMENT</span></div>}
 <h2>{readyToShare?`${name.trim()}’s prediction`:remaining===0?'Your Parliament':'Your Parliament so far'}</h2>
 <span className="tag">Personal prediction · {readyToShare?'not official results':remaining===0?'add your nickname':'incomplete'}</span>
 <Chamber rows={rows} majorityTotal={120+overhang} context="Personal prediction"/>
 {readyToShare?<>
 <p className="tiny">{stamp?`Saved ${nzTime(stamp)} NZ time`:'Ready to save. NZ date and time are added to the image.'}</p>
 <table className="seat-table"><thead><tr><th>Party</th><th>Seats</th></tr></thead><tbody>{rows.map(p=><tr key={p.name}><th><span className="party-dot" style={{background:p.color}}/>{p.name}</th><td>{p.seats}</td></tr>)}</tbody><tfoot><tr><th>Total</th><td>{total}</td></tr></tfoot></table>
 <p className="tiny">120 base + {overhang} assumed overhang · {majority(120+overhang)} for a majority. Seven parties only.</p>
 </>:<p className="tiny">{remaining===0?'Add your nickname to prepare the shareable image.':`${remaining>=0?`${remaining} seats remaining`:`${-remaining} seats over allocated`}. Complete your allocation to see the shareable image.`}</p>}
 </div>{readyToShare&&<p className="tiny">Saved as a PNG on your device. Nothing is uploaded.</p>}
 </aside>}
 </div>
 </section>
}
