import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ─────────────────────────────────────────────
// GET /api/community?town=nantwich
// Returns all community posts for a town.
// Requires auth — B2B only, not public.
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const town = req.nextUrl.searchParams.get('town')
  if (!town) return NextResponse.json({ error: 'town is required' }, { status: 400 })

  const posts = await prisma.communityPost.findMany({
    where: {
      town: { slug: town },
    },
    include: {
      business: {
        select: { id: true, name: true, slug: true, logo: true, category: true },
      },
      replies: {
        include: {
          business: {
            select: { id: true, name: true, logo: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [
      { pinned: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({ posts })
}

// ─────────────────────────────────────────────
// POST /api/community
// Creates a new community post.
// ─────────────────────────────────────────────

const postSchema = z.object({
  body: z.string().min(1).max(1000),
})

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const post = await prisma.communityPost.create({
    data: {
      townId:     business.townId,
      businessId: business.id,
      body:       parsed.data.body,
    },
    include: {
      business: {
        select: { id: true, name: true, slug: true, logo: true, category: true },
      },
      replies: true,
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}
