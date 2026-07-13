import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ business: null })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })

  return NextResponse.json({ business })
}
