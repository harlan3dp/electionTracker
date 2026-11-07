import {getElectorate,json,unavailable,type FeedEnv} from '../../../lib/results/feed'
export async function onRequestGet({env,params}:{env:FeedEnv;params:{id:string}}) {
 if(!/^[1-9]\d{0,2}$/.test(params.id))return Response.json({error:'Invalid electorate ID'},{status:400})
 try{return json(await getElectorate(params.id,env))}catch{return unavailable()}
}
