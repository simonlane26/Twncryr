import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ business: null })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    select: {
      id: true, name: true, slug: true, category: true,
      tagline: true, description: true, address: true, postcode: true,
      phone: true, email: true, website: true, logo: true, photos: true,
      claimed: true, verified: true, active: true,
      clerkOrgId: true, townId: true,
      town: { select: { id: true, name: true, slug: true, county: true } },
    },
  })

  return NextResponse.json({ business })
}
