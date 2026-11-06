export function GET() { return new Response(null, { status: 307, headers: { Location: '/api/results', 'Cache-Control': 'no-store' } }) }
