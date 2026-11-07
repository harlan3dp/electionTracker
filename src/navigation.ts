export const destinations = [
  { id: 'results', label: 'Results' },
  { id: 'parliament', label: 'Parliament' },
  { id: 'prediction', label: 'Your Prediction' },
] as const

export type Destination = typeof destinations[number]['id'] | 'sources'
export type Detail = 'electorates' | 'parties' | 'analysis' | 'advanced-scenarios' | null
export type Route = { destination: Destination; detail: Detail }

// Retain bookmarks from the seven-section interface and its embedded tools.
export function resolveRoute(hash: string): Route {
  const key = hash.replace(/^#/, '').toLowerCase()
  if (['parliament', 'coalitions'].includes(key)) return { destination: 'parliament', detail: null }
  if (['seat-title', 'advanced-scenarios'].includes(key)) return { destination: 'parliament', detail: 'advanced-scenarios' }
  if (key === 'prediction') return { destination: 'prediction', detail: null }
  if (['sources', 'information'].includes(key)) return { destination: 'sources', detail: null }
  if (['electorates', 'electorate-explorer'].includes(key)) return { destination: 'results', detail: 'electorates' }
  if (key === 'parties') return { destination: 'results', detail: 'parties' }
  if (['analysis', 'analysis-title'].includes(key)) return { destination: 'results', detail: 'analysis' }
  return { destination: 'results', detail: null }
}
