import { expect, it } from 'vitest'
import { project, coastPaths } from './geography'
import { parties } from './demo'
import { scenarioShares, allocateScenario } from './analysis'
import { electorates } from './electorates'
it('projects coast and demo locations inside the main-island view', () => {
  expect(coastPaths.length).toBeGreaterThan(2)
  expect(coastPaths.join('')).not.toContain('NaN')
  for (const e of electorates) {
    const p = project(e.longitude, e.latitude)
    expect(p.x).toBeGreaterThan(0); expect(p.x).toBeLessThan(360)
    expect(p.y).toBeGreaterThan(0); expect(p.y).toBeLessThan(570)
  }
})
it('supports every party and conserves shares and seats at extreme inputs', () => {
  for (const [i,p] of parties.entries()) for (const share of [0,20,100]) {
    const shares = scenarioShares(share,p.name)
    expect(shares[i]).toBe(share)
    expect(shares.reduce((a,b)=>a+b,0)).toBeCloseTo(100)
    expect(allocateScenario(shares).reduce((a,b)=>a+b,0)).toBe(120)
  }
  expect(() => scenarioShares(50,'Unknown')).toThrow()
})
