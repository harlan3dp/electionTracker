// Shared display colours and diagram order, not official chamber seating.
const normalize=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')
const definitions = [
 {name:'Labour',color:'#d9354c',order:0,aliases:['Labour Party','New Zealand Labour Party']},
 {name:'Green',color:'#32834d',order:1,aliases:['Green Party','Green Party of Aotearoa New Zealand']},
 {name:'Te Pāti Māori',color:'#a83a44',order:2,aliases:['Te Pati Maori','TPM']},
 {name:'TOP',color:'#167b83',order:3,aliases:['Opportunity Party','The Opportunities Party','The Opportunities Party (TOP)','Opportunities Party']},
 {name:'NZ First',color:'#55616b',order:5,aliases:['New Zealand First','New Zealand First Party']},
 {name:'ACT',color:'#b88612',order:6,aliases:['ACT New Zealand']},
 {name:'National',color:'#2766c5',order:7,aliases:['National Party','New Zealand National Party']},
 {name:'New Zealand Loyal',color:'#7055a0',order:4,aliases:[]},
 {name:'NewZeal',color:'#95613b',order:4,aliases:[]},
 {name:'Aotearoa Legalise Cannabis Party',color:'#72863a',order:4,aliases:[]},
 {name:'Freedoms NZ',color:'#ac5b85',order:4,aliases:['Freedoms NZ (Umbrella party)']},
 {name:'DemocracyNZ',color:'#466b8e',order:4,aliases:[]},
 {name:'Animal Justice Party',color:'#527c72',order:4,aliases:['Animal Justice Party Aotearoa New Zealand']},
 {name:'New Conservative',color:'#6a5a85',order:4,aliases:['New Conservatives','Conservative Party NZ']},
 {name:'Leighton Baker Party',color:'#9a7038',order:4,aliases:[]},
 {name:'Women’s Rights Party',color:'#9c4673',order:4,aliases:["Women's Rights Party"]},
 {name:'New Nation Party',color:'#497c90',order:4,aliases:[]},
]
const aliases=new Map(definitions.flatMap(p=>[p.name,...p.aliases].map(name=>[normalize(name),p] as const)))
export function partyStyle(name:string){
 const known=aliases.get(normalize(name));if(known)return known
 // Stable display colour for any new source party; never collapse every entry to grey.
 const key=normalize(name)||'independent'
 const hash=[...key].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0)
 return {name,color:`hsl(${hash%360} 45% 37%)`,order:4,aliases:[]}
}
export const partyColor=(name:string)=>partyStyle(name).color
