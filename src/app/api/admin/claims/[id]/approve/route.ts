import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { getResend } from '@/lib/resend'
import { isAdminUser } from '@/lib/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!await isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const claim = await prisma.claimRequest.findUnique({
    where: { id },
    include: { business: { include: { town: true } } },
  })

  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  if (claim.status !== 'PENDING') {
    return NextResponse.json({ error: 'Claim is not pending' }, { status: 409 })
  }

  const client = await clerkClient()
  const org = await client.organizations.createOrganization({
    name: claim.business.name,
    createdBy: claim.clerkUserId,
    publicMetadata: {
      businessId: claim.business.id,
      townSlug: claim.business.town.slug,
    },
  })

  await prisma.$transaction([
    prisma.business.update({
      where: { id: claim.business.id },
      data: { clerkOrgId: org.id, claimed: true, verified: true, active: true },
    }),
    prisma.businessMember.upsert({
      where: { businessId_clerkUserId: { businessId: claim.business.id, clerkUserId: claim.clerkUserId } },
      create: { businessId: claim.business.id, clerkUserId: claim.clerkUserId, role: 'OWNER' },
      update: { role: 'OWNER' },
    }),
    prisma.claimRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    }),
  ])

  await getResend().emails.send({
    from: 'Twncryr <noreply@twncryr.co.uk>',
    to: claim.email,
    subject: `You're approved — ${claim.business.name} is now live on Twncryr`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">You're approved, ${claim.name}!</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">
          Your listing for <strong>${claim.business.name}</strong> on Twncryr is now active.
          Sign in to your dashboard to start posting deals, last-minute tables and events.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;margin-top:16px;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
          Go to your dashboard →
        </a>
        <p style="font-size:12px;color:#999;margin-top:24px">Questions? Reply to this email.</p>
      </div>
    `,
  })

  return NextResponse.redirect(
    new URL(`/admin/claims?approved=${encodeURIComponent(claim.business.name)}`, req.url),
    303
  )
}
