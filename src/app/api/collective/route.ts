import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CollectiveCategory } from '@prisma/client'

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true, townId: true },
  })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const { category } = await req.json()

  if (!Object.values(CollectiveCategory).includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  await prisma.collectiveInterest.upsert({
    where: {
      townId_businessId_category: {
        townId: business.townId,
        businessId: business.id,
        category,
      },
    },
    create: { townId: business.townId, businessId: business.id, category },
    update: {},
  })

  const count = await prisma.collectiveInterest.count({
    where: { townId: business.townId, category },
  })

  return NextResponse.json({ count })
}
