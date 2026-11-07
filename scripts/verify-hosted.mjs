import assert from 'node:assert/strict'
const base=process.argv[2]||'https://electiontracker-40v.pages.dev'
async function read(path,options={}){return fetch(new URL(path,base),{...options,signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}})}
const page=await read('/');assert.equal(page.status,200);const html=await page.text();assert.match(html,/<title>Tally/)
const asset=html.match(/src="([^"]+\.js)"/)?.[1];assert.ok(asset,'Current browser bundle missing');const js=await read(asset);assert.equal(js.status,200);assert.match(js.headers.get('content-type')||'',/javascript/)
const response=await read('/api/results'),data=await response.json();assert.ok([200,503].includes(response.status));assert.equal(data.applicationBuild,'tally-live-v2','Old API deployment is still serving');if(!response.ok)assert.equal(data.status,'unavailable')
assert.equal((await read('/api/electorates/0')).status,400)
console.log(`Hosted build and API checks PASS: ${base}; ${response.status} ${data.status}. Publication permission and election identity require separate release review.`)
