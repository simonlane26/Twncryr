import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const body = z.object({
  title: z.string().min(1),
  body:  z.string().min(1),
  type:  z.enum(['DEAL', 'TABLE', 'EVENT', 'ANNOUNCEMENT']),
})

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token:  refreshToken,
      client_id:      process.env.GOOGLE_CLIENT_ID!,
      client_secret:  process.env.GOOGLE_CLIENT_SECRET!,
      grant_type:     'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

const TOPIC_MAP: Record<string, string> = {
  DEAL:         'OFFER',
  TABLE:        'STANDARD',
  EVENT:        'EVENT',
  ANNOUNCEMENT: 'STANDARD',
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = body.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { title, body: text, type } = parsed.data

  const business = await prisma.business.findFirst({
    where: { members: { some: { clerkUserId: userId } } },
    select: {
      googleRefreshToken: true,
      googleLocationId:   true,
    },
  })

  if (!business?.googleRefreshToken || !business?.googleLocationId) {
    return NextResponse.json(
      { error: 'Google Business Profile not connected' },
      { status: 400 }
    )
  }

  // Validate locationId format to prevent URL manipulation (e.g. "locations/12345")
  if (!/^locations\/\d+$/.test(business.googleLocationId)) {
    return NextResponse.json({ error: 'Invalid Google location configuration' }, { status: 500 })
  }

  const accessToken = await refreshAccessToken(business.googleRefreshToken)

  const postRes = await fetch(
    `https://mybusiness.googleapis.com/v4/${business.googleLocationId}/localPosts`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        languageCode: 'en-GB',
        summary:      `${title}\n\n${text}`,
        topicType:    TOPIC_MAP[type] ?? 'STANDARD',
      }),
    }
  )

  if (!postRes.ok) {
    const errText = await postRes.text()
    console.error('Google local post error:', errText)
    return NextResponse.json({ error: 'Google API error', detail: errText }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
