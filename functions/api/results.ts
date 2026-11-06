import { getNational, json, unavailable } from '../_lib/feed'
import type { FeedEnv } from '../_lib/feed'
export async function onRequestGet({env}: {env:FeedEnv}) {
  try { return json(await getNational(env)) } catch (error) { console.warn('Official feed request failed:', error instanceof Error ? error.message.slice(0,160) : 'Unknown error'); return unavailable() }
}
