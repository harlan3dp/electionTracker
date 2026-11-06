// Deliberately returns no election figures until an official feed is verified.
export function onRequestGet() {
  return Response.json(
    { mode: 'unavailable', message: 'Live results are not connected.', officialResultsUrl: 'https://www.electionresults.govt.nz/' },
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  )
}
