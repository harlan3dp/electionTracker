import { describe, expect, it } from 'vitest'
import { parties, totalVotes, voteShare } from './demo'
import { onRequestGet } from '../functions/api/status'

describe('demo dashboard', () => {
  it('uses consistent party totals and percentages', () => {
    expect(totalVotes).toBe(100000)
    expect(parties.reduce((sum, party) => sum + voteShare(party.votes, totalVotes), 0)).toBeCloseTo(100)
    expect(voteShare(0, 0)).toBe(0)
  })
  it('keeps the backend explicitly unavailable without publishing demo results', async () => {
    const response = onRequestGet()
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60')
    const body = await response.json()
    expect(body.mode).toBe('unavailable')
    expect(body).not.toHaveProperty('results')
    expect(body.officialResultsUrl).toBe('https://www.electionresults.govt.nz/')
  })
})
