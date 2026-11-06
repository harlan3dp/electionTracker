import {expect,it} from 'vitest'
import {readFileSync} from 'node:fs'
import {normalize} from '../../functions/_lib/normalize'
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
