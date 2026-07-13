import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params

  const business = await prisma.business.findUnique({ where: { clerkOrgId: orgId } })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const post = await prisma.communityPost.findFirst({
    where: { id, businessId: business.id },
  })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  await prisma.communityPost.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
