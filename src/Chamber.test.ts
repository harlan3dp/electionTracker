import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Chamber } from './Chamber'

const rows = [{ name: 'A', color: '#123456', seats: 54 }, { name: 'B', color: '#123456', seats: 66 }]
const circles = (markup: string) => markup.match(/<circle[^>]+>/g) ?? []

describe('shared Parliament chamber', () => {
  it('highlights party identity without reallocating seats, even when colors match', () => {
    const plain = renderToStaticMarkup(createElement(Chamber, { rows }))
    const selected = renderToStaticMarkup(createElement(Chamber, { rows, selectedParties: ['B'] }))
    expect(circles(selected)).toHaveLength(120)
    expect(circles(selected).filter(mark => mark.includes('data-selected="true"'))).toHaveLength(66)
    expect(circles(selected).filter(mark => mark.includes('seat-muted'))).toHaveLength(54)
    const geometry = (markup: string) => circles(markup).map(mark => mark.match(/cx="[^"]+" cy="[^"]+"/)?.[0])
    expect(geometry(selected)).toEqual(geometry(plain))
    expect(selected).toContain('61 for a majority')
  })
  it('uses the chamber size for overhang majorities', () => {
    const markup = renderToStaticMarkup(createElement(Chamber, { rows: [{ name: 'A', color: '#123456', seats: 122 }] }))
    expect(circles(markup)).toHaveLength(122)
    expect(markup).toContain('62 for a majority')
  })
  it('keeps the complete-Parliament threshold while a personal prediction is incomplete', () => {
    const markup = renderToStaticMarkup(createElement(Chamber, { rows: [{ name: 'A', color: '#123456', seats: 10 }], majorityTotal: 120, context: 'Personal prediction' }))
    expect(circles(markup)).toHaveLength(10)
    expect(markup).toContain('Personal prediction: 10 seats')
    expect(markup).toContain('61 for a majority')
  })
})

it('puts Labour at the far left and National at the far right, preserving selected identity',()=>{
 const known=[{name:'National Party',color:'#000',seats:48},{name:'Labour Party',color:'#000',seats:34},{name:'Green',color:'#000',seats:15},{name:'ACT',color:'#000',seats:11},{name:'NZ First',color:'#000',seats:8},{name:'Te Pāti Māori',color:'#000',seats:6}]
 const markup=renderToStaticMarkup(createElement(Chamber,{rows:known,selectedParties:['National Party']}))
 const marks=circles(markup)
 expect(marks[0]).toContain('data-party="Labour Party"');expect(marks.at(-1)).toContain('data-party="National Party"')
 expect(marks.filter(m=>m.includes('data-selected="true"'))).toHaveLength(48)
 expect(marks.filter(m=>m.includes('fill="#2766c5"'))).toHaveLength(48)
})
