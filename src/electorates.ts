export type Candidate = { name: string; party: string; votes: number }
export type Electorate = { name: string; island: 'North Island' | 'South Island'; x: number; y: number; candidates: Candidate[] }
// Illustrative geographic positions, not boundaries or an official 2026 electorate roster.
// Candidate names are deliberately synthetic; every vote is fictional.
export const electorates: Electorate[] = [
  { name: 'Whangārei', island: 'North Island', x: 65, y: 8, candidates: [{ name: 'Demo candidate A', party: 'National', votes: 6300 }, { name: 'Demo candidate B', party: 'Labour', votes: 5100 }] },
  { name: 'Auckland Central', island: 'North Island', x: 61, y: 20, candidates: [{ name: 'Demo candidate C', party: 'Green', votes: 7200 }, { name: 'Demo candidate D', party: 'National', votes: 6100 }] },
  { name: 'Hamilton East', island: 'North Island', x: 70, y: 32, candidates: [{ name: 'Demo candidate E', party: 'National', votes: 6100 }, { name: 'Demo candidate F', party: 'Labour', votes: 5980 }] },
  { name: 'Tauranga', island: 'North Island', x: 83, y: 30, candidates: [{ name: 'Demo candidate G', party: 'National', votes: 8200 }, { name: 'Demo candidate H', party: 'Labour', votes: 4800 }] },
  { name: 'New Plymouth', island: 'North Island', x: 55, y: 40, candidates: [{ name: 'Demo candidate I', party: 'National', votes: 7400 }, { name: 'Demo candidate J', party: 'Labour', votes: 5200 }] },
  { name: 'Napier', island: 'North Island', x: 78, y: 43, candidates: [{ name: 'Demo candidate K', party: 'Labour', votes: 6800 }, { name: 'Demo candidate L', party: 'National', votes: 6500 }] },
  { name: 'Wellington Central', island: 'North Island', x: 55, y: 55, candidates: [{ name: 'Demo candidate M', party: 'Green', votes: 8400 }, { name: 'Demo candidate N', party: 'Labour', votes: 6100 }] },
  { name: 'Nelson', island: 'South Island', x: 39, y: 53, candidates: [{ name: 'Demo candidate O', party: 'Labour', votes: 6200 }, { name: 'Demo candidate P', party: 'National', votes: 5900 }] },
  { name: 'Christchurch Central', island: 'South Island', x: 40, y: 70, candidates: [{ name: 'Demo candidate Q', party: 'Labour', votes: 7800 }, { name: 'Demo candidate R', party: 'National', votes: 6900 }] },
  { name: 'Dunedin', island: 'South Island', x: 28, y: 84, candidates: [{ name: 'Demo candidate S', party: 'Labour', votes: 8200 }, { name: 'Demo candidate T', party: 'Green', votes: 6500 }] },
  { name: 'Invercargill', island: 'South Island', x: 12, y: 91, candidates: [{ name: 'Demo candidate U', party: 'National', votes: 7300 }, { name: 'Demo candidate V', party: 'Labour', votes: 6100 }] },
]
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function searchElectorates(query: string, island = 'All') {
  return electorates.filter(e => (island === 'All' || e.island === island) && normalizeSearch(e.name).includes(normalizeSearch(query)))
}
export function leaders(candidates: Candidate[]) {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)
  return sorted.filter(c => c.votes === sorted[0]?.votes)
}
