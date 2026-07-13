import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer, townChannel, PUSHER_EVENTS } from '@/lib/pusher-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  // Verify this post belongs to this business
  const post = await prisma.post.findFirst({
    where: { id: params.id, businessId: business.id },
  })

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Mark inactive rather than hard delete — preserves enquiry history
  await prisma.post.update({
    where: { id: params.id },
    data: { active: false },
  })

  // Fire Pusher event so consumer feed removes it immediately
  await pusherServer.trigger(
    townChannel(business.town.slug),
    PUSHER_EVENTS.POST_EXPIRED,
    { id: post.id, businessId: business.id }
  )

  return NextResponse.json({ success: true })
}
