import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ body: z.string().min(1).max(1000) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id: communityPostId } = await params

  const business = await prisma.business.findUnique({ where: { clerkOrgId: orgId } })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const post = await prisma.communityPost.findUnique({ where: { id: communityPostId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Prevent cross-town replies — business must be in the same town as the post
  if (post.townId !== business.townId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const reply = await prisma.communityReply.create({
    data: {
      communityPostId,
      businessId: business.id,
      body: parsed.data.body,
    },
    include: {
      business: { select: { id: true, name: true, logo: true } },
    },
  })

  return NextResponse.json({
    reply: {
      id:        reply.id,
      body:      reply.body,
      createdAt: reply.createdAt.toISOString(),
      business: {
        id:   reply.business.id,
        name: reply.business.name,
        logo: reply.business.logo,
      },
    },
  }, { status: 201 })
}
