import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

async function exchangeCode(code: string): Promise<{
  access_token: string
  refresh_token?: string
}> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return res.json()
}

async function fetchFirstLocation(accessToken: string): Promise<{
  accountId: string
  locationId: string
} | null> {
  const accountsRes = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!accountsRes.ok) return null
  const { accounts } = await accountsRes.json()
  if (!accounts?.length) return null

  const accountName: string = accounts[0].name // e.g. "accounts/12345"
  const accountId = accountName.split('/')[1]

  const locRes = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!locRes.ok) return null
  const { locations } = await locRes.json()
  if (!locations?.length) return null

  const locationName: string = locations[0].name // e.g. "locations/67890"
  const locationId = locationName // keep full path for API calls

  return { accountId, locationId }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/dashboard?google=denied', req.url)
    )
  }

  try {
    const tokens = await exchangeCode(code)

    const location = await fetchFirstLocation(tokens.access_token)

    const business = await prisma.business.findFirst({
      where: {
        members: { some: { clerkUserId: userId } },
      },
    })

    if (!business) {
      return NextResponse.redirect(
        new URL('/dashboard?google=no-business', req.url)
      )
    }

    await prisma.business.update({
      where: { id: business.id },
      data: {
        ...(tokens.refresh_token && { googleRefreshToken: tokens.refresh_token }),
        ...(location && {
          googleAccountId:  location.accountId,
          googleLocationId: location.locationId,
        }),
      },
    })

    return NextResponse.redirect(
      new URL('/dashboard?google=connected', req.url)
    )
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/dashboard?google=error', req.url)
    )
  }
}
