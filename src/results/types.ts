export const OFFICIAL_SOURCE = 'https://media.election.net.nz/xml/'
export type Party = { id: string; name: string; abbreviation: string; registered: boolean }
export type Electorate = { id: string; name: string; roll: 'General' | 'Māori' }
export type Candidate = { id: string; name: string; partyId: string; electorateId: string | null }
export type PartyResult = { partyId: string; votes: number; percentage: number }
export type Snapshot = {
  schemaVersion: 1
  demoAllowed?: boolean
  electionYear: 2026
  source: typeof OFFICIAL_SOURCE
  fetchedAt: string
  updatedAt: string
  status: 'waiting' | 'preliminary' | 'withheld'
  stale: boolean
  message: string
  parties: Party[]
  electorates: Electorate[]
  candidates: Candidate[]
  results: PartyResult[] | null
  reporting: { counted: number; total: number; percentage: number } | null
}
export type ElectorateSnapshot = {
  schemaVersion: 1; electorateId: string; source: string; updatedAt: string; fetchedAt: string
  status: Snapshot['status']; stale: boolean; message: string
  reporting: Snapshot['reporting']; candidates: { candidateId: string; votes: number }[] | null
}
export type Unavailable = { schemaVersion: 1; status: 'unavailable'; message: string; source: string }
