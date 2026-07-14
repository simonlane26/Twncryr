import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

function extractTown(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? ''

  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const townParam = req.nextUrl.searchParams.get('town')
    return townParam ?? process.env.NEXT_PUBLIC_DEFAULT_TOWN ?? 'nantwich'
  }

  const parts = host.split('.')

  // twncryr.com      → 2 parts (no subdomain)
  // twncryr.co.uk    → 3 parts, parts[0] === 'twncryr' (no subdomain)
  // www.twncryr.com  → 3 parts, parts[0] === 'www' (no town)
  // www.twncryr.co.uk → 4 parts, parts[0] === 'www' (no town)
  // nantwich.twncryr.com   → 3 parts, parts[0] = town slug
  // nantwich.twncryr.co.uk → 4 parts, parts[0] = town slug
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'twncryr') {
    return parts[0]
  }

  return null
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host') ?? ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  const town = extractTown(req)

  // Root domain (twncryr.co.uk or www.twncryr.co.uk) → serve landing page
  if (!isLocalhost && !town && !isApiRoute(req)) {
    const url = req.nextUrl.clone()
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/landing'
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  const { userId, orgId } = await auth()

  if (isAdminRoute(req) || isDashboardRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  if (isDashboardRoute(req)) {
    if (!orgId && !isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  const url = req.nextUrl.clone()

  if (town && !isApiRoute(req)) {
    url.searchParams.set('_town', town)
  }

  const response = NextResponse.rewrite(url)

  if (town) {
    response.headers.set('x-town', town)
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
