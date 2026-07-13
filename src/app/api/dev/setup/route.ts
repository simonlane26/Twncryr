import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    // If a business is already linked to this user, just return it
    const existing = await prisma.business.findFirst({
      where: {
        members: { some: { clerkUserId: userId } },
        clerkOrgId: { not: null },
      },
    })
    if (existing) {
      return NextResponse.json({ orgId: existing.clerkOrgId, businessName: existing.name, alreadySetUp: true })
    }

    // Find a pending claim, or fall back to any unclaimed seeded business
    const claim = await prisma.claimRequest.findFirst({
      where: { clerkUserId: userId, status: 'PENDING' },
    })

    const business = claim
      ? await prisma.business.findUnique({
          where: { id: claim.businessId },
          include: { town: true },
        })
      : await prisma.business.findFirst({
          where: { claimed: false, clerkOrgId: null },
          include: { town: true },
        })

    if (!business) {
      return NextResponse.json(
        { error: 'No unclaimed businesses found. Run: npx prisma db seed' },
        { status: 404 }
      )
    }

    const client = await clerkClient()
    const org = await client.organizations.createOrganization({
      name: business.name,
      createdBy: userId,
      publicMetadata: { businessId: business.id, townSlug: business.town.slug },
    })

    await prisma.$transaction([
      prisma.business.update({
        where: { id: business.id },
        data: { clerkOrgId: org.id, claimed: true, verified: true },
      }),
      prisma.businessMember.upsert({
        where: { businessId_clerkUserId: { businessId: business.id, clerkUserId: userId } },
        create: { businessId: business.id, clerkUserId: userId, role: 'OWNER' },
        update: { role: 'OWNER' },
      }),
      ...(claim
        ? [prisma.claimRequest.update({ where: { id: claim.id }, data: { status: 'APPROVED' } })]
        : []),
    ])

    return NextResponse.json({ orgId: org.id, businessName: business.name })
  } catch (err: unknown) {
    console.error('[dev/setup]', err)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
