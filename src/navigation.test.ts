import { describe, expect, it } from 'vitest'
import { destinations, resolveRoute } from './navigation'

describe('three-destination navigation', () => {
  it('keeps Results as the landing destination and exposes only three main links', () => {
    expect(destinations.map(d => d.label)).toEqual(['Results', 'Parliament', 'Your Prediction'])
    expect(resolveRoute('')).toEqual({ destination: 'results', detail: null })
    expect(resolveRoute('#unknown')).toEqual(resolveRoute('#results'))
  })
  it.each(['electorates', 'parties', 'analysis'])('keeps the former #%s bookmark within Results', detail => {
    expect(resolveRoute(`#${detail}`)).toEqual({ destination: 'results', detail })
  })
  it('keeps coalition, source and embedded calculator bookmarks', () => {
    expect(resolveRoute('#coalitions')).toEqual(resolveRoute('#parliament'))
    expect(resolveRoute('#sources').destination).toBe('sources')
    expect(resolveRoute('#prediction').destination).toBe('prediction')
    expect(resolveRoute('#seat-title')).toEqual({ destination: 'parliament', detail: 'advanced-scenarios' })
    expect(resolveRoute('#electorate-explorer').detail).toBe('electorates')
    expect(resolveRoute('#analysis-title').detail).toBe('analysis')
  })
})
