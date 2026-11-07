import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {XMLParser,XMLValidator} from 'fast-xml-parser'
import {mmpScenario} from '../src/parliament'
import {normalize} from '../lib/results/normalize'
import published from './fixtures/official-2023/published-summary.json'
import hashes from './fixtures/official-2023/sha256.json'
const fixture=(name:string)=>readFileSync(new URL(`./fixtures/official-2023/${name}`,import.meta.url),'utf8')
const parser=new XMLParser({ignoreAttributes:false,parseTagValue:false,parseAttributeValue:false,isArray:(_name,path)=>typeof path==='string'&&['parties.party','election.partystatus.party','electorates.electorate','candidates.candidate'].includes(path)})
const election=parser.parse(fixture('election.xml')).election
const statistics=parser.parse(fixture('statistics.xml')).statistics
const directories=parser.parse(fixture('parties.xml')).parties.party as {party_name:string;'@_p_no':string}[]
const results=election.partystatus.party as {votes:string;candidate_seats:string;party_seats:string;total_seats:string;'@_p_no':string}[]
describe('real archived 2023 XML, isolated from live results',()=>{
 it('retains unchanged source captures and valid XML',()=>{for(const [name,hash] of Object.entries(hashes)){const xml=fixture(name);expect(XMLValidator.validate(xml)).toBe(true);expect(createHash('sha256').update(xml).digest('hex')).toBe(hash)}})
 it('matches the independent official published party-vote and seat table',()=>{
  expect(results).toHaveLength(17)
  for(const result of results){const name=directories.find(d=>d['@_p_no']===result['@_p_no'])!.party_name;const expected=published.find(p=>p.name===name.replace(' (Umbrella party)',''));expect(expected,name).toBeDefined();expect(Number(result.votes)).toBe(expected!.votes);expect(Number(result.candidate_seats)).toBe(expected!.electorates);expect(Number(result.party_seats)).toBe(expected!.list);expect(Number(result.total_seats)).toBe(expected!.seats)}
  expect(results.reduce((n,r)=>n+Number(r.votes),0)).toBe(2851211)
 })
 it('reproduces the published 122-seat allocation, list splits and Māori electorate exception',()=>{
  const total=results.reduce((n,r)=>n+Number(r.votes),0)
  const model=mmpScenario(results.map(r=>Number(r.votes)/total*100),results.map(r=>Number(r.candidate_seats)))
  expect(model.totals).toEqual(results.map(r=>Number(r.total_seats)))
  expect(model.list).toEqual(results.map(r=>Number(r.party_seats)))
  expect(model.total).toBe(122);expect(model.overhang).toBe(2);expect(model.majority).toBe(62)
  const maori=results.findIndex(r=>directories.find(d=>d['@_p_no']===r['@_p_no'])?.party_name==='Te Pāti Māori')
  expect(Number(results[maori].votes)/total*100).toBeLessThan(5);expect(model.totals[maori]).toBe(6);expect(model.entitlement[maori]).toBe(4)
 })
 it('records historical schema differences instead of silently adapting them',()=>{
  expect(Number(statistics.total_registered_parties)).toBe(20);expect(results.length).toBe(17)
  expect(Number(election.statistics.total_voting_places_counted)).toBeGreaterThan(Number(statistics.total_voting_places))
  expect(election['@_updated']).toBe('2024-11-10T00:00:00')
  expect(published.reduce((n,r)=>n+r.electorates,0)).toBe(71);expect(Number(statistics.total_electorates)).toBe(72)
 })
 it('rejects the historical files unchanged at the production 2026 normalizer',()=>{
  const files={election:fixture('election.xml'),statistics:fixture('statistics.xml'),parties:fixture('parties.xml'),electorates:fixture('electorates.xml'),candidates:fixture('candidates.xml')}
  expect(()=>normalize(files,Date.now(),true)).toThrow('Invalid official feed')
 })
})
