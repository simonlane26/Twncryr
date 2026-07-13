import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

function extractTown(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? ''

  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const townParam = req.nextUrl.searchParams.get('town')
    return townParam ?? process.env.NEXT_PUBLIC_DEFAULT_TOWN ?? 'nantwich'
  }

  const parts = host.split('.')

  // twncryr.co.uk → 3 parts (no subdomain)
  // www.twncryr.co.uk → 4 parts but parts[0] === 'www' (no town subdomain)
  // nantwich.twncryr.co.uk → 4 parts, parts[0] is the town slug
  if (parts.length >= 4 && parts[0] !== 'www') {
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

  if (isDashboardRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

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
