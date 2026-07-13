import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer, townChannel, PUSHER_EVENTS, type NewPostPayload } from '@/lib/pusher-server'
import { PostType } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const town = searchParams.get('town')
  const type = searchParams.get('type') as PostType | null

  if (!town) return NextResponse.json({ error: 'town is required' }, { status: 400 })

  const posts = await prisma.post.findMany({
    where: {
      active: true,
      business: { town: { slug: town }, active: true },
      ...(type ? { type } : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      business: { select: { id: true, name: true, slug: true, logo: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ posts })
}

const createPostSchema = z.object({
  type: z.nativeEnum(PostType),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  expiresAt: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  tableCount: z.number().int().positive().optional().nullable(),
  tableSizes: z.array(z.string()).optional(),
  discountText: z.string().max(50).optional().nullable(),
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
  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const post = await prisma.post.create({
    data: {
      businessId: business.id,
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    },
  })

  const payload: NewPostPayload = {
    id: post.id,
    type: post.type,
    title: post.title,
    body: post.body,
    expiresAt: post.expiresAt?.toISOString() ?? null,
    startsAt: post.startsAt?.toISOString() ?? null,
    tableCount: post.tableCount,
    discountText: post.discountText,
    createdAt: post.createdAt.toISOString(),
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      logo: business.logo,
      category: business.category,
    },
  }

  await pusherServer.trigger(townChannel(business.town.slug), PUSHER_EVENTS.NEW_POST, payload)

  return NextResponse.json({ post }, { status: 201 })
}
