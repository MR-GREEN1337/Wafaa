import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add webhook route to public routes
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/', 
  '/api/webhook/stripe(.*)'
])

// Handle webhook requests separately
function handleWebhook(request: NextRequest) {
  // Only apply to Stripe webhook routes
  if (request.nextUrl.pathname.startsWith('/api/webhook/stripe')) {
    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, {
        headers: {
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Add CORS headers to the response
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature')
    
    return response
  }
  return null
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // First check if it's a webhook request
  const webhookResponse = handleWebhook(request)
  if (webhookResponse) {
    return webhookResponse
  }

  // Then proceed with normal Clerk auth
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}