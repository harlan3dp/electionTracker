import {describe,it,expect} from 'vitest'
import {replayFrames} from './replay'
import {majority} from '../parliament'
describe('isolated fictional count replay',()=>{
 it('has complete vote shares and internally consistent seats at every step',()=>{
  for(const f of replayFrames){expect(f.votes.reduce((a,b)=>a+b,0)).toBeCloseTo(100);expect(f.rows.reduce((n,r)=>n+r.seats,0)).toBe(f.allocation.total);expect(f.allocation.total).toBe(120+f.allocation.overhang);expect(f.allocation.majority).toBe(majority(f.allocation.total));expect(f.general.reduce((a,b)=>a+b,0)).toBe(63);expect(f.maori.reduce((a,b)=>a+b,0)).toBe(7)}
 })
 it('starts with a 61-seat majority',()=>{expect(replayFrames[0].allocation.majority).toBe(61)})
 it('finishes with two overhangs and a 62-seat majority',()=>{const f=replayFrames.at(-1)!;expect(f.allocation.total).toBe(122);expect(f.allocation.overhang).toBe(2);expect(f.allocation.majority).toBe(62)})
})
