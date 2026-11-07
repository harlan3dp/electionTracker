import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {readFileSync} from 'node:fs'
import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest'
import {normalize,RELEASE} from '../lib/results/normalize'
import {validSnapshot} from '../src/results/useFeed'
import {ParliamentView} from '../src/ParliamentView'
import {HomeDashboard} from '../src/results/HomeDashboard'
import {sourceSeatRows,type ParliamentModel} from '../src/ParliamentComposition'
import type {NationalState} from '../src/results/Official'
const read=(directory:string,name:string)=>readFileSync(new URL(`./fixtures/${directory}/${name}.xml`,import.meta.url),'utf8')
const files={election:read('counting-start','election'),statistics:read('counting-start','statistics'),parties:read('official-feed','parties'),electorates:read('official-feed','electorates'),candidates:read('official-feed','candidates')}
const now=RELEASE+8*60_000
const model:ParliamentModel={coverage:{snapshotTime:'',checked:0,leads:0,general:0,maori:0,ties:0,failed:0,parties:{}},registered:[],running:false,estimate:null}
const feed=(data:NationalState['data'],error:string|null=null):NationalState=>({data,error,loading:false,refresh:()=>{}})
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(now)})
afterEach(()=>vi.useRealTimers())
describe('captured counting feed through API and Parliament',()=>{
 it('validates progress against voting-place results, retaining source seat splits and overhang',()=>{
  const s=normalize(files,now,true)
  expect(s.status).toBe('preliminary');expect(validSnapshot(s)).toBe(true)
  expect(s.reporting).toEqual({counted:101,total:9387,percentage:1.1,unit:'voting-place results'})
  const later=files.election.replace('<total_voting_places_counted>101','<total_voting_places_counted>3000').replace('<percent_voting_places_counted>1.1','<percent_voting_places_counted>32.0')
  expect(normalize({...files,election:later},now,true).reporting!.counted).toBe(3000)
  expect(s.results!.reduce((n,r)=>n+r.votes,0)).toBe(119352)
  expect(s.results!.reduce((n,r)=>n+r.seats!.total,0)).toBe(122)
  expect(s.results!.find(r=>r.partyId==='14')!.seats).toEqual({list:0,electorate:2,total:2})
  const props={feed:feed(s),model}
  for(const html of [renderToStaticMarkup(createElement(ParliamentView,props)),renderToStaticMarkup(createElement(HomeDashboard,{...props,detail:null,active:true}))]){
   expect(html).toContain('Preliminary source seats');expect(html).toContain('62 for a majority')
   expect(html).not.toContain('Hypothetical example');expect(html).not.toContain('Awaiting party votes')
   expect(html.match(/<circle[^>]+data-party=/g)).toHaveLength(122)
  }
 })
 it('does not substitute fictional seats when the feed is withheld, stale or unavailable',()=>{
  const blocked=normalize(files,now,false)
  expect(blocked.status).toBe('withheld');expect(blocked.results).toBeNull();expect(sourceSeatRows(blocked)).toBeNull()
  for(const state of [feed(blocked),feed(null,'offline'),feed({...normalize(files,now,true),stale:true})]){
   const html=renderToStaticMarkup(createElement(ParliamentView,{feed:state,model}))
   expect(html).toContain('Seat allocation unavailable');expect(html).not.toContain('Hypothetical example');expect(html).not.toContain('<circle')
  }
  const html=renderToStaticMarkup(createElement(HomeDashboard,{feed:feed(blocked),model,detail:null,active:true}))
  expect(html).toContain('Results withheld');expect(html).not.toContain('Awaiting party votes')
 })
 it('still rejects inconsistent progress and corrupt seat splits at the server and browser boundaries',()=>{
  expect(()=>normalize({...files,election:files.election.replace('<percent_voting_places_counted>1.1','<percent_voting_places_counted>3.8')},now,true)).toThrow()
  expect(()=>normalize({...files,election:files.election.replace('<party_seats>13','<party_seats>14')},now,true)).toThrow()
  const s=normalize(files,now,true)
  expect(validSnapshot({...s,results:s.results!.map((r,i)=>i===0?{...r,seats:{list:14,electorate:0,total:13}}:r)})).toBe(false)
 })
})
