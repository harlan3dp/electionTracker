import {it,expect} from 'vitest'
import {partyColor} from './partyStyle'
import {seatPoints} from './parliament'
it('uses the same teal for TOP and every source alias',()=>{
 for(const name of ['TOP','Opportunity Party','The Opportunities Party','The Opportunities Party (TOP)'])expect(partyColor(name)).toBe('#167b83')
 expect(partyColor('National Party')).toBe(partyColor('National'));expect(partyColor('Te Pati Maori')).toBe(partyColor('Te Pāti Māori'))
})
it('gives new parties a stable colour and preserves custom-party marks',()=>{
 expect(partyColor('Future Youth Party')).toBe(partyColor('Future Youth Party'))
 expect(partyColor('Future Youth Party')).not.toBe(partyColor('Human Rights Party'))
 const marks=seatPoints([{name:'National',color:'blue',seats:1},{name:'Labour',color:'red',seats:1}]);expect(marks[0].party).toBe('Labour');expect(marks[1].party).toBe('National')
})
