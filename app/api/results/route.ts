import { getNational, json, unavailable } from '../../../lib/results/feed'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() {
  try { return json(await getNational({ RESULTS_PUBLICATION_CONFIRMED: process.env.RESULTS_PUBLICATION_CONFIRMED })) }
  catch { return unavailable() }
}
