// Simple Cloudflare Worker for BullTeam PWA
// This prevents build errors and provides basic functionality

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get the request URL
  const url = new URL(request.url)
  
  // Handle different routes
  if (url.pathname === '/') {
    return new Response('BullTeam PWA - Cloudflare Worker', {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
  
  // For all other requests, return a simple response
  return new Response('BullTeam PWA API', {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
