import { describe, expect, it } from 'vitest'
import { parties, totalVotes, voteShare } from './demo'
import { GET } from '../app/api/status/route'

describe('demo dashboard', () => {
  it('uses consistent party totals and percentages', () => {
    expect(totalVotes).toBe(100000)
    expect(parties.reduce((sum, party) => sum + voteShare(party.votes, totalVotes), 0)).toBeCloseTo(100)
    expect(voteShare(0, 0)).toBe(0)
  })
  it('redirects legacy status callers to the validated results API', () => {
    const response = GET()
    expect(response.status).toBe(307)
    expect(response.headers.get('Location')).toBe('/api/results')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
})
