import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer, townChannel, PUSHER_EVENTS } from '@/lib/pusher-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const post = await prisma.post.findFirst({
    where: { id, businessId: business.id },
  })

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  await prisma.post.update({
    where: { id },
    data: { active: false },
  })

  await pusherServer.trigger(
    townChannel(business.town.slug),
    PUSHER_EVENTS.POST_EXPIRED,
    { id: post.id, businessId: business.id }
  )

  return NextResponse.json({ success: true })
}
