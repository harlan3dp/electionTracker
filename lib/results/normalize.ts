import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { OFFICIAL_SOURCE } from '../../src/results/types'
import type { Snapshot, ElectorateSnapshot } from '../../src/results/types'

export const RELEASE = Date.parse('2026-11-07T19:00:00+13:00')
export const STALE_MS = 10 * 60_000
const maori = new Set(['Hauraki-Waikato','Ikaroa-Rāwhiti','Tāmaki Makaurau','Te Tai Hauāuru','Te Tai Tokerau','Te Tai Tonga','Waiariki'])
// Treat every upstream value as text, then validate it explicitly.
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false, parseAttributeValue: false, trimValues: true, isArray: (_name, path) => typeof path === 'string' && ['parties.party','election.partystatus.party','electorates.electorate','candidates.candidate','electorate.candidatevotes.candidate','electorate.partyvotes.party'].includes(path) })
type Node = Record<string, unknown>
function fail(): never { throw new Error('Invalid official feed') }
function node(value: unknown): Node { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Node : fail() }
function text(value: unknown): string { return typeof value === 'string' && value.length > 0 && value.length <= 240 ? value : fail() }
function integer(value: unknown): number { const s = text(value); return /^\d+$/.test(s) && Number.isSafeInteger(Number(s)) ? Number(s) : fail() }
function id(value: unknown): string { return String(integer(value)) }
function percent(value: unknown): number { const s = text(value); const n = Number(s); return /^\d+(\.\d+)?$/.test(s) && Number.isFinite(n) && n >= 0 && n <= 100 ? n : fail() }
function list(root: Node, key: string): Node[] { return Array.isArray(root[key]) && root[key].length > 0 ? root[key].map(node) : fail() }
function unique<T extends { id: string }>(values: T[]): T[] { if (new Set(values.map(v => v.id)).size !== values.length) fail(); return values }
function parse(xml: string, root: string): Node {
  if (xml.length > 1_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) fail()
  const document = node(parser.parse(xml))
  if (Object.keys(document).some(key => key !== root && key !== '?xml')) fail()
  return node(document[root])
}
// This feed's observed timestamps have no timezone. NZ is UTC+13 throughout the
// accepted November–December 2026 window; reject other windows rather than guess DST.
export function timestamp(value: unknown, now: number): string {
  const s = text(value)
  if (!/^2026-(11|12)-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) fail()
  const date = new Date(`${s}+13:00`)
  if (!Number.isFinite(date.getTime()) || date.getTime() > now + 5 * 60_000) fail()
  if (new Date(date.getTime()+13*3600_000).toISOString().slice(0,19) !== s) fail()
  return date.toISOString()
}
function stage(votes: number, updated: string, now: number, approved: boolean): { status: Snapshot['status']; message: string } {
  if (votes === 0) return { status: 'waiting', message: 'Official feed connected. No counted votes have been published.' }
  if (now < RELEASE || Date.parse(updated) < RELEASE) return { status: 'withheld', message: 'Feed figures precede the announced result-release time and are withheld.' }
  if (!approved) return { status: 'withheld', message: 'Feed connected. Publication awaits verification of feed use, election identity and test status.' }
  return { status: 'preliminary', message: 'Preliminary counts from the Electoral Commission media feed. No winners are declared.' }
}
export type XmlFiles = { election: string; statistics: string; parties: string; electorates: string; candidates: string }
export function normalize(files: XmlFiles, now: number, approved = false): Snapshot {
  const election = parse(files.election, 'election')
  const statistics = parse(files.statistics, 'statistics')
  const updatedAt = timestamp(election['@_updated'], now)
  const statsUpdated = timestamp(statistics['@_updated'], now)
  // statistics.xml is a static directory inventory, not a results heartbeat.
  void statsUpdated
  const parties = unique(list(parse(files.parties, 'parties'), 'party').map(p => {
    if (p.registered !== 'yes' && p.registered !== 'no') fail()
    return { id: id(p['@_p_no']), name: text(p.party_name), abbreviation: text(p.abbrev), registered: p.registered === 'yes' }
  }))
  const electorates = unique(list(parse(files.electorates, 'electorates'), 'electorate').map(e => ({ id: id(e['@_e_no']), name: text(e.electorate_name), roll: maori.has(text(e.electorate_name)) ? 'Māori' as const : 'General' as const })))
  const candidates = unique(list(parse(files.candidates, 'candidates'), 'candidate').map(c => ({ id: id(c['@_c_no']), name: text(c.candidate_name), partyId: id(c.party), electorateId: id(c.electorate) === '0' ? null : id(c.electorate) })))
  const partyIds = new Set(parties.map(p => p.id)); const electorateIds = new Set(electorates.map(e => e.id))
  if (candidates.some(c => (c.partyId !== '0' && !partyIds.has(c.partyId)) || c.electorateId !== null && !electorateIds.has(c.electorateId))) fail()
  const registered = parties.filter(p => p.registered).length
  if (integer(statistics.total_all_parties) !== parties.length || integer(statistics.total_registered_parties) !== registered || integer(statistics.total_electorates) !== electorates.length || integer(statistics.total_candidates) !== candidates.length) fail()
  if (Object.keys(election).some(key => /test|rehearsal/i.test(key))) fail()
  const electionStats = node(election.statistics)
  if (integer(electionStats.total_registered_parties) !== registered) fail()
  const raw = list(node(election.partystatus), 'party').map(p => ({ partyId: id(p['@_p_no']), votes: integer(p.votes), percentage: percent(p.percent_votes) }))
  if (raw.length !== registered || new Set(raw.map(p => p.partyId)).size !== raw.length || raw.some(p => !parties.some(d => d.id === p.partyId && d.registered))) fail()
  const totalVotes = raw.reduce((n,p) => n+p.votes,0)
  if (!Number.isSafeInteger(totalVotes) || integer(electionStats.total_votes_cast) < totalVotes) fail()
  if (raw.some(p => Math.abs(p.percentage - (totalVotes ? p.votes/totalVotes*100 : 0)) > 0.25)) fail()
  const counted = integer(electionStats.total_voting_places_counted); const total = integer(statistics.total_voting_places); const percentage = percent(electionStats.percent_voting_places_counted)
  if (counted > total || (counted === 0 && totalVotes > 0) || Math.abs(percentage - (total ? counted/total*100 : 0)) > 0.25) fail()
  const resultStage = stage(totalVotes, updatedAt, now, approved)
  return { schemaVersion: 1, electionYear: 2026, source: OFFICIAL_SOURCE, fetchedAt: new Date(now).toISOString(), updatedAt, ...resultStage, stale: totalVotes > 0 && now-Date.parse(updatedAt)>STALE_MS, parties, electorates, candidates,
    results: resultStage.status === 'preliminary' ? raw.map(p => ({ ...p, percentage: p.votes/totalVotes*100 })) : null,
    reporting: resultStage.status === 'withheld' ? null : { counted, total, percentage } }
}
export function normalizeElectorate(xml: string, snapshot: Snapshot, electorateId: string, now: number, approved = false): ElectorateSnapshot {
  const root = parse(xml,'electorate')
  if (id(root['@_e_no']) !== electorateId || !snapshot.electorates.some(e => e.id === electorateId)) fail()
  if (Object.keys(root).some(key => /test|rehearsal/i.test(key))) fail()
  const updatedAt = timestamp(root['@_updated'],now)
  const stats = node(root.statistics)
  const eligible = snapshot.candidates.filter(c => c.electorateId === electorateId)
  const votes = list(node(root.candidatevotes),'candidate').map(c => ({ candidateId: id(c['@_c_no']), votes: integer(c.votes) }))
  if (new Set(votes.map(c=>c.candidateId)).size !== votes.length || votes.length !== eligible.length || integer(stats.total_candidates) !== eligible.length || votes.some(c => !eligible.some(d => d.id===c.candidateId))) fail()
  const totalVotes = votes.reduce((sum,c)=>sum+c.votes,0)
  if (!Number.isSafeInteger(totalVotes) || integer(stats.total_votes_cast) < totalVotes) fail()
  const counted = integer(stats.total_voting_places_counted); const total = integer(stats.total_voting_places); const percentage = percent(stats.percent_voting_places_counted)
  if (counted>total || (counted===0 && totalVotes>0) || Math.abs(percentage-(total ? counted/total*100 : 0))>0.25) fail()
  // 'final' in the observed feed is true even for zero counts. Never treat it as
  // certified official results or use it to declare an elected candidate.
  const resultStage = stage(totalVotes,updatedAt,now,approved)
  return { schemaVersion:1, electorateId, source:`${OFFICIAL_SOURCE}e${electorateId.padStart(2,'0')}/e${electorateId.padStart(2,'0')}.xml`, fetchedAt:new Date(now).toISOString(), updatedAt, ...resultStage, stale:totalVotes>0 && now-Date.parse(updatedAt)>STALE_MS, reporting:resultStage.status==='withheld' ? null : {counted,total,percentage}, candidates:resultStage.status==='preliminary' ? votes : null }
}
