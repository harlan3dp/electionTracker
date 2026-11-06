import { majority,seatPoints,type SeatRow } from './parliament'
import { nzTime } from './results/useFeed'
export async function exportPrediction(name:string,date:string,rows:SeatRow[],electorates:number[],pool:number,overhang:number,values:number[],units:string[]) {
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1560
 const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');const c:CanvasRenderingContext2D=context
 c.fillStyle='#f7f8f4';c.fillRect(0,0,1000,1560);c.fillStyle='#18352f';c.fillRect(0,0,1000,110)
 function text(value:string,x:number,y:number,size=24,color='#18352f',bold=false){c.fillStyle=color;c.font=`${bold?'600':'400'} ${size}px sans-serif`;c.fillText(value,x,y)}
 text('Tally / YOUR PARLIAMENT',50,70,36,'#ffffff',true)
 text(name.length>30?name.slice(0,29)+'…':name,50,170,36,'#18352f',true)
 text('PERSONAL PREDICTION · NOT OFFICIAL RESULTS',50,215,22)
 text(`Saved ${nzTime(date)} NZ time`,50,255,22)
 const total=rows.reduce((n,r)=>n+r.seats,0)
 for(const p of seatPoints(rows)){c.beginPath();c.arc(50+p.x*2.25,300+p.y*2.25,8,0,Math.PI*2);c.fillStyle=p.color;c.fill()}
 c.textAlign='center';text(`${total} seats`,500,690,32,'#18352f',true);text(`${majority(total)} for a majority`,500,750,24);c.textAlign='left'
 rows.forEach((r,i)=>{const y=800+i*58;c.fillStyle=r.color;c.fillRect(50,y-19,16,16);text(r.name,90,y,26,'#18352f',true);text(String(r.seats),840,y,28,'#18352f',true);c.strokeStyle='#dce3da';c.beginPath();c.moveTo(50,y+17);c.lineTo(950,y+17);c.stroke()})
 text(`TOTAL ${total} · 120 BASE + ${overhang} ASSUMED OVERHANG`,50,1235,25,'#18352f',true)
 text('Seven parties only; unlisted parties excluded.',50,1280,22)
 text(`Eligible vote pool: ${pool}%. Assumed electorate seats:`,50,1320,22)
 text(electorates.slice(0,4).map((n,i)=>`${rows[i].name} ${n}`).join(' / '),50,1355,21)
 text(electorates.slice(4).map((n,i)=>`${rows[i+4].name} ${n}`).join(' / '),50,1390,21)
 text('Inputs: '+values.map((v,i)=>`${rows[i].name} ${v}${units[i]==='seats'?'s':'%'}`).slice(0,4).join(' / '),50,1425,20)
 text(values.map((v,i)=>`${rows[i].name} ${v}${units[i]==='seats'?'s':'%'}`).slice(4).join(' / '),50,1455,20)
 text('Percentage conversion is approximate. Direct seats are personal choices.',50,1505,21)
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG failed')),'image/png'))
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`tally-${name.replace(/[^a-z0-9]/gi,'-')}-${date.slice(0,10)}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000)
}
