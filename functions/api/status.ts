export function onRequestGet({request}:{request:Request}){return Response.redirect(new URL('/api/results',request.url),307)}
