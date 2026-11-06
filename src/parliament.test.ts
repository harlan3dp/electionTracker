import {describe,it,expect} from 'vitest'
import {mmpScenario,majority,percentageSeats,seatPoints} from './parliament'
describe('explicit MMP scenarios',()=>{
 it('separates electorate/list seats and increases the majority for overhang',()=>{
  const r=mmpScenario([38,7,5,32,11,5,2],[34,1,0,25,2,8,0])
  expect(r.entitlement[5]).toBe(6);expect(r.totals[5]).toBe(8);expect(r.list[5]).toBe(0)
  expect(r.overhang).toBe(2);expect(r.total).toBe(122);expect(r.majority).toBe(62)
  expect(r.list.reduce((a,b)=>a+b,0)+70).toBe(122)
 })
 it('enforces 5% eligibility while allowing the electorate exception',()=>{
  expect(mmpScenario([96,4],[50,0]).totals).toEqual([120,0])
  expect(mmpScenario([96,4],[50,1]).totals[1]).toBeGreaterThan(1)
 })
 it('accounts for independent seats separately and rejects invalid assumptions',()=>{
  const r=mmpScenario([100],[50],1);expect(r.total).toBe(120);expect(r.totals[0]).toBe(119)
  expect(()=>mmpScenario([-1,101],[0,0])).toThrow()
  expect(()=>mmpScenario([100],[1.5])).toThrow()
 })
 it('labels approximate conversions while respecting eligibility and electorate floors',()=>{
  expect(percentageSeats(30,0,100)).toBe(36)
  expect(percentageSeats(4,0,100)).toBe(0)
  expect(percentageSeats(4,8,100)).toBe(8)
  expect(()=>percentageSeats(50,0,40)).toThrow()
 })
 it('draws exactly one mark per allocated seat, including overhangs',()=>{
  const dots=seatPoints([{name:'A',color:'red',seats:61},{name:'B',color:'blue',seats:61}]);expect(dots).toHaveLength(122);expect(dots.filter(d=>d.color==='red')).toHaveLength(61)
  expect(majority(120)).toBe(61);expect(majority(121)).toBe(61);expect(majority(122)).toBe(62)
 })
})
