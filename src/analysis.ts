import { parties } from './demo'

// A proportional illustration, not an implementation of all NZ MMP rules.
// All listed parties are assumed eligible; no electorate seats or overhangs.
export function allocateScenario(shares: readonly number[], seats = 120): number[] {
  if (!Number.isInteger(seats) || seats < 1 || shares.length === 0 || shares.some(n => !Number.isFinite(n) || n < 0) || !shares.some(n => n > 0)) throw new Error('Invalid scenario')
  const allocated = shares.map(() => 0)
  for (let seat = 0; seat < seats; seat++) {
    let best = 0
    for (let i = 1; i < shares.length; i++) {
      if (shares[i] / (2 * allocated[i] + 1) > shares[best] / (2 * allocated[best] + 1)) best = i
    }
    allocated[best]++
  }
  return allocated
}

// Percentages in, percentage out. Assumes the given counted fraction of a fixed final total.
export function requiredRemainingShare(currentShare: number, countedPercent: number, targetShare: number): number | null {
  if ([currentShare, countedPercent, targetShare].some(n => !Number.isFinite(n) || n < 0 || n > 100) || countedPercent === 100) return null
  return (targetShare - currentShare * countedPercent / 100) / (1 - countedPercent / 100)
}
export function scenarioShares(share: number, partyName: string = parties[0].name) {
  if (!parties.some(p => p.name === partyName) || !Number.isFinite(share) || share < 0 || share > 100) throw new Error('Invalid party scenario')
  const otherTotal = parties.filter(p => p.name !== partyName).reduce((sum, p) => sum + p.votes, 0)
  return parties.map(p => p.name === partyName ? share : (100 - share) * p.votes / otherTotal)
}
