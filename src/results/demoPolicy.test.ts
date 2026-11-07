import {describe,it,expect} from 'vitest'
import {demoAvailable,resultsStarted,DEMO_CUTOFF} from './demoPolicy'
import type {Snapshot} from './types'
const waiting={status:'waiting',demoAllowed:true,stale:false,fetchedAt:new Date(DEMO_CUTOFF-10000).toISOString(),results:null} as Snapshot
const now=DEMO_CUTOFF-5000
describe('live-first demo lock',()=>{
 it('allows only a server-approved fresh zero-count waiting state before release',()=>{expect(demoAvailable(waiting,null,false,now)).toBe(true);expect(demoAvailable({...waiting,demoAllowed:false},null,false,now)).toBe(false);expect(demoAvailable(waiting,null,false,DEMO_CUTOFF)).toBe(false)})
 it('fails closed for outages, stale data, withheld counts and persisted locks',()=>{expect(demoAvailable(null,null,false,now)).toBe(false);expect(demoAvailable(waiting,'offline',false,now)).toBe(false);expect(demoAvailable({...waiting,stale:true},null,false,now)).toBe(false);expect(demoAvailable(waiting,null,true,now)).toBe(false);expect(demoAvailable(waiting,null,false,DEMO_CUTOFF+200000)).toBe(false)})
 it('detects published or withheld counts without exposing withheld figures',()=>{expect(resultsStarted({...waiting,status:'withheld'})).toBe(true);expect(resultsStarted({...waiting,status:'preliminary',results:[{partyId:'1',votes:1,percentage:100}]})).toBe(true);expect(resultsStarted(waiting)).toBe(false)})
})
