import {getNational,json,unavailable,type FeedEnv} from '../../lib/results/feed'
export async function onRequestGet({env}:{env:FeedEnv}) {
 try{return json(await getNational(env))}catch{return unavailable()}
}
