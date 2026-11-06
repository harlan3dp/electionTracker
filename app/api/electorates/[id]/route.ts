import { getElectorate, json, unavailable } from '../../../../lib/results/feed'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[1-9]\d{0,2}$/.test(id)) return Response.json({ error: 'Invalid electorate ID' }, { status: 400 })
  try { return json(await getElectorate(id, { RESULTS_PUBLICATION_CONFIRMED: process.env.RESULTS_PUBLICATION_CONFIRMED })) }
  catch { return unavailable() }
}
