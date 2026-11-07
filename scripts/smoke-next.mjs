// Run after npm run build. Starts only its own production server and cleans it up.
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
const port = 3197
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NO_PROXY: '127.0.0.1,localhost' } })
let output = ''
child.stdout.on('data', data => { output += data })
child.stderr.on('data', data => { output += data })
const base = `http://127.0.0.1:${port}`
try {
  let root
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error(`Next exited: ${output}`)
    try { root = await fetch(base, { signal: AbortSignal.timeout(1000) }); if (root.ok) break } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(root?.ok, output)
  const html = await root.text()
  assert.match(html, /The count/)
  assert.match(html, /Live results are the default/)
  const invalid = await fetch(`${base}/api/electorates/0`)
  assert.equal(invalid.status, 400)
  const redirect = await fetch(`${base}/api/status`, { redirect: 'manual' })
  assert.equal(redirect.status, 307)
  assert.equal(redirect.headers.get('location'), '/api/results')
  const result = await fetch(`${base}/api/results`, { signal: AbortSignal.timeout(15000) })
  const body = await result.json()
  assert.ok([200, 503].includes(result.status))
  assert.ok(['waiting', 'withheld', 'preliminary', 'unavailable'].includes(body.status))
  if (result.status === 503) assert.equal(body.status, 'unavailable')
  console.log(`PASS production HTML, invalid ID, redirect and API contract (${result.status} ${body.status})`)
  if (body.status === 'unavailable') console.log('Live source not verified; fixture route tests cover validated responses.')
} finally {
  child.kill('SIGTERM')
  await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve) })
}
