export type Candidate = { name: string; party: string; votes: number }
export type Electorate = { name: string; island: 'North Island' | 'South Island'; longitude: number; latitude: number; candidates: Candidate[] }
// Approximate city-centre locations, not electorate centroids or boundaries or an official 2026 electorate roster.
// Candidate names are deliberately synthetic; every vote is fictional.
export const electorates: Electorate[] = [
  { name: 'Whangārei', island: 'North Island', longitude: 174.32, latitude: -35.73, candidates: [{ name: 'Demo candidate A', party: 'National', votes: 6300 }, { name: 'Demo candidate B', party: 'Labour', votes: 5100 }] },
  { name: 'Auckland Central', island: 'North Island', longitude: 174.76, latitude: -36.85, candidates: [{ name: 'Demo candidate C', party: 'Green', votes: 7200 }, { name: 'Demo candidate D', party: 'National', votes: 6100 }] },
  { name: 'Hamilton East', island: 'North Island', longitude: 175.28, latitude: -37.78, candidates: [{ name: 'Demo candidate E', party: 'National', votes: 6100 }, { name: 'Demo candidate F', party: 'Labour', votes: 5980 }] },
  { name: 'Tauranga', island: 'North Island', longitude: 176.17, latitude: -37.69, candidates: [{ name: 'Demo candidate G', party: 'National', votes: 8200 }, { name: 'Demo candidate H', party: 'Labour', votes: 4800 }] },
  { name: 'New Plymouth', island: 'North Island', longitude: 174.08, latitude: -39.06, candidates: [{ name: 'Demo candidate I', party: 'National', votes: 7400 }, { name: 'Demo candidate J', party: 'Labour', votes: 5200 }] },
  { name: 'Napier', island: 'North Island', longitude: 176.92, latitude: -39.49, candidates: [{ name: 'Demo candidate K', party: 'Labour', votes: 6800 }, { name: 'Demo candidate L', party: 'National', votes: 6500 }] },
  { name: 'Wellington Central', island: 'North Island', longitude: 174.78, latitude: -41.29, candidates: [{ name: 'Demo candidate M', party: 'Green', votes: 8400 }, { name: 'Demo candidate N', party: 'Labour', votes: 6100 }] },
  { name: 'Nelson', island: 'South Island', longitude: 173.28, latitude: -41.27, candidates: [{ name: 'Demo candidate O', party: 'Labour', votes: 6200 }, { name: 'Demo candidate P', party: 'National', votes: 5900 }] },
  { name: 'Christchurch Central', island: 'South Island', longitude: 172.64, latitude: -43.53, candidates: [{ name: 'Demo candidate Q', party: 'Labour', votes: 7800 }, { name: 'Demo candidate R', party: 'National', votes: 6900 }] },
  { name: 'Dunedin', island: 'South Island', longitude: 170.5, latitude: -45.87, candidates: [{ name: 'Demo candidate S', party: 'Labour', votes: 8200 }, { name: 'Demo candidate T', party: 'Green', votes: 6500 }] },
  { name: 'Invercargill', island: 'South Island', longitude: 168.35, latitude: -46.41, candidates: [{ name: 'Demo candidate U', party: 'National', votes: 7300 }, { name: 'Demo candidate V', party: 'Labour', votes: 6100 }] },
]
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function searchElectorates(query: string, island = 'All') {
  return electorates.filter(e => (island === 'All' || e.island === island) && normalizeSearch(e.name).includes(normalizeSearch(query)))
}
export function leaders(candidates: Candidate[]) {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)
  return sorted.filter(c => c.votes === sorted[0]?.votes)
}
