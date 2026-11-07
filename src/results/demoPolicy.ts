import type {Snapshot} from './types'
export const DEMO_CUTOFF=Date.parse('2026-11-07T19:00:00+13:00')
export const DEMO_LOCK_KEY='tally-results-started-2026'
export function resultsStarted(s:Snapshot|null){return s?.status==='withheld'||s?.status==='preliminary'&&Boolean(s.results?.some(r=>r.votes>0))}
// A scheduled cutoff is an additional fail-closed protection for new browsers,
// source outages and feed resets. It never authorizes publishing vote totals.
export function demoAvailable(s:Snapshot|null,error:string|null,locked:boolean,now=Date.now()){
 return !locked&&now<DEMO_CUTOFF&&!error&&s?.demoAllowed===true&&s.status==='waiting'&&!s.stale&&now-Date.parse(s.fetchedAt)>=0&&now-Date.parse(s.fetchedAt)<120000
}
