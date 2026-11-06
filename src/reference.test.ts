import { expect, it } from 'vitest'
import { historicalParties, historicalWinners, coalitionPresets } from './reference'
import { electorates, searchElectorates } from './electorates'
import { parties } from './demo'
import { allocateScenario } from './analysis'

it('covers seven distinct Māori reference entries with historical representatives and no invented candidate votes', () => {
  const maori = searchElectorates('', 'All', 'Māori')
  expect(maori).toHaveLength(7)
  expect(new Set(maori.map(e => e.name)).size).toBe(7)
  expect(searchElectorates('tamaki', 'All', 'Māori')[0].name).toBe('Tāmaki Makaurau')
  expect(searchElectorates('te tai tonga', 'All', 'Māori')).toHaveLength(1)
  expect(searchElectorates('te tai tonga', 'North Island', 'Māori')).toHaveLength(1)
  expect(searchElectorates('te tai tonga', 'South Island', 'Māori')).toHaveLength(1)
  for (const e of maori) {
    expect(historicalWinners[e.name]).toBeTruthy()
    expect(e.candidates).toEqual([])
  }
  expect(searchElectorates('', 'All', 'General')).toHaveLength(electorates.length-7)
})
it('includes every historical reference party in the scenario tools without inventing minor-party votes', () => {
  expect(historicalParties).toHaveLength(17)
  expect(new Set(historicalParties).size).toBe(17)
  for (const name of historicalParties) expect(parties.some(p => p.name===name)).toBe(true)
  for (const p of parties.slice(6)) expect(p.votes).toBe(0)
})
it('coalition comparisons use the same conserved seat allocation as the interactive chamber', () => {
  const allocated=allocateScenario(parties.map(p=>p.votes))
  expect(allocated.reduce((a,b)=>a+b,0)).toBe(120)
  for (const preset of coalitionPresets) {
    expect(new Set(preset.parties).size).toBe(preset.parties.length)
    for(const name of preset.parties) expect(parties.some(p=>p.name===name)).toBe(true)
    const seats=parties.reduce((sum,p,i)=>sum+(preset.parties.includes(p.name)?allocated[i]:0),0)
    expect(seats).toBeGreaterThan(0);expect(seats).toBeLessThanOrEqual(120)
  }
})
