// Legacy callers should receive the same validated data/state as the dashboard.
export function onRequestGet() {
  return new Response(null,{status:307,headers:{Location:'/api/results','Cache-Control':'no-store'}})
}
