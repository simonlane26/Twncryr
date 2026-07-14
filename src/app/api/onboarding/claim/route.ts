import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend } from '@/lib/resend'
import { z } from 'zod'
import { esc } from '@/lib/email'
import { rateLimitIP } from '@/lib/ratelimit'

const claimSchema = z.object({
  businessId:    z.string().cuid(),
  businessName:  z.string().min(1).max(120),
  claimantName:  z.string().min(1).max(80),
  claimantEmail: z.string().email(),
  claimantRole:  z.string().max(60).optional(),
  claimantPhone: z.string().max(20).optional(),
})

export async function POST(req: NextRequest) {
  if (!rateLimitIP(req, 5, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const parsed = claimSchema.safeParse(await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { businessId, businessName, claimantName, claimantEmail, claimantRole, claimantPhone } = parsed.data

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { town: true },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  if (business.claimed && business.clerkOrgId) {
    return NextResponse.json(
      { error: 'This listing has already been claimed. Email ignistech999@gmail.com if you believe this is an error.' },
      { status: 409 }
    )
  }

  const existing = await prisma.claimRequest.findFirst({
    where: { businessId, clerkUserId: userId, status: 'PENDING' },
  })

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending claim for this listing. We'll be in touch soon." },
      { status: 409 }
    )
  }

  const claim = await prisma.claimRequest.create({
    data: { businessId, clerkUserId: userId, name: claimantName, email: claimantEmail, role: claimantRole ?? null, status: 'PENDING' },
  })

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/claims`

  await getResend().emails.send({
    from: 'Twncryr <noreply@twncryr.co.uk>',
    to: process.env.ADMIN_EMAIL!,
    subject: `New claim: ${businessName} — ${business.town.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#085041">New listing claim</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#666;font-size:13px;width:120px">Business</td><td style="padding:8px 0;font-size:13px;font-weight:500">${esc(businessName)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Town</td><td style="padding:8px 0;font-size:13px">${esc(business.town.name)}, ${esc(business.town.county)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Address</td><td style="padding:8px 0;font-size:13px">${esc(business.address)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #eee">Claimant</td><td style="padding:8px 0;font-size:13px;border-top:1px solid #eee">${esc(claimantName)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Email</td><td style="padding:8px 0;font-size:13px"><a href="mailto:${esc(claimantEmail)}">${esc(claimantEmail)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Role</td><td style="padding:8px 0;font-size:13px">${esc(claimantRole)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${esc(claimantPhone)}</td></tr>
        </table>
        <a href="${adminUrl}" style="background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Review claim →</a>
        <p style="font-size:12px;color:#999;margin-top:24px">Sign in at <a href="${adminUrl}">${adminUrl}</a> to approve or reject.</p>
      </div>
    `,
  })

  await getResend().emails.send({
    from: 'Twncryr <ignistech999@gmail.com>',
    to: claimantEmail,
    subject: `We've received your claim — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Thanks, ${esc(claimantName)}!</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">We've received your request to manage <strong>${esc(businessName)}</strong> on Twncryr. We typically approve within a few hours and will email you here when done.</p>
        <p style="font-size:13px;color:#999;margin-top:24px">Questions? Reply to this email or reach us at ignistech999@gmail.com</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, claimId: claim.id })
}
