import { describe, expect, it } from 'vitest'
import { allocateScenario, requiredRemainingShare, scenarioShares } from './analysis'
import { leaders, searchElectorates } from './electorates'

describe('transparent hypothetical analysis', () => {
  it('calculates remaining votes rather than a winning threshold', () => {
    expect(requiredRemainingShare(30, 50, 40)).toBe(50)
    expect(requiredRemainingShare(30, 0, 40)).toBe(40)
    expect(requiredRemainingShare(30, 100, 40)).toBeNull()
    expect(requiredRemainingShare(NaN, 30, 40)).toBeNull()
    expect(requiredRemainingShare(0, 99, 90)).toBeGreaterThan(100)
    expect(requiredRemainingShare(90, 99, 10)).toBeLessThan(0)
  })
  it('allocates known proportional examples and conserves all seats', () => {
    expect(allocateScenario([60, 40], 10)).toEqual([6, 4])
    expect(allocateScenario([100, 0])).toEqual([120, 0])
    for (const share of [0, 32.1, 50, 100]) {
      const shares = scenarioShares(share)
      expect(shares.reduce((a,b) => a+b,0)).toBeCloseTo(100)
      expect(allocateScenario(shares).reduce((a,b) => a+b,0)).toBe(120)
    }
    expect(() => allocateScenario([0,0])).toThrow()
  })
})
describe('electorate exploration', () => {
  it('supports macron-insensitive search, regions and empty matches', () => {
    expect(searchElectorates('  whangarei ')[0].name).toBe('Whangārei')
    expect(searchElectorates('Wellington', 'South Island')).toEqual([])
    expect(searchElectorates('not an electorate')).toEqual([])
  })
  it('reports all tied leaders without mutating candidate order', () => {
    const candidates = [{name:'A',party:'Labour',votes:1},{name:'B',party:'Green',votes:2},{name:'C',party:'National',votes:2}]
    expect(leaders(candidates).map(c => c.name)).toEqual(['B','C'])
    expect(candidates[0].name).toBe('A')
    expect(leaders([])).toEqual([])
  })
})
