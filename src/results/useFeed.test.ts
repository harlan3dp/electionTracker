import {expect,it} from 'vitest'
import {readFileSync} from 'node:fs'
import {normalize} from '../../lib/results/normalize'
import {validSnapshot,isStale} from './useFeed'
const file=(name:string)=>readFileSync(new URL(`../../tests/fixtures/official-feed/${name}.xml`,import.meta.url),'utf8')
it('validates the API envelope and never accepts published counts in a waiting state',()=>{
  const s=normalize({election:file('election'),statistics:file('statistics'),parties:file('parties'),electorates:file('electorates'),candidates:file('candidates')},Date.parse('2026-11-06T18:00:00+13:00'))
  expect(validSnapshot(s)).toBe(true)
  expect(validSnapshot({...s,source:'https://example.com/'})).toBe(false)
  expect(validSnapshot({...s,results:[{partyId:'5',votes:1,percentage:100}]})).toBe(false)
  expect(validSnapshot({...s,parties:[]})).toBe(false)
  expect(isStale(s,'Source failed')).toBe(true)
})
it('rejects future snapshots, duplicate IDs and inconsistent preliminary totals',()=>{
 const s=normalize({election:file('election'),statistics:file('statistics'),parties:file('parties'),electorates:file('electorates'),candidates:file('candidates')},Date.parse('2026-11-06T18:00:00+13:00'))
 expect(validSnapshot({...s,fetchedAt:new Date(Date.now()+3600000).toISOString()})).toBe(false)
 expect(validSnapshot({...s,parties:[...s.parties,s.parties[0]]})).toBe(false)
 expect(validSnapshot({...s,status:'preliminary',results:[{partyId:s.parties[0].id,votes:10,percentage:30}]})).toBe(false)
 expect(validSnapshot({...s,status:'preliminary',results:[{partyId:s.parties[0].id,votes:0,percentage:100}]})).toBe(false)
})
