import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend } from '@/lib/resend'
import { z } from 'zod'
import { BusinessCategory } from '@prisma/client'
import { esc } from '@/lib/email'

const registerSchema = z.object({
  businessName:        z.string().min(1).max(120),
  businessCategory:    z.nativeEnum(BusinessCategory),
  businessAddress:     z.string().max(200).optional().nullable(),
  businessPostcode:    z.string().max(10).optional().nullable(),
  businessPhone:       z.string().max(20).optional().nullable(),
  businessWebsite:     z.union([z.string().url(), z.literal('')]).optional().nullable(),
  businessDescription: z.string().max(1000).optional().nullable(),
  townSlug:            z.string().min(1).max(60),
  claimantName:        z.string().min(1).max(100),
  claimantEmail:       z.string().email(),
  claimantRole:        z.string().max(60).optional().nullable(),
  claimantPhone:       z.string().max(20).optional().nullable(),
})

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const parsed = registerSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const {
    businessName, businessCategory, businessAddress, businessPostcode,
    businessPhone, businessWebsite, businessDescription,
    townSlug,
    claimantName, claimantEmail, claimantRole, claimantPhone,
  } = parsed.data

  const town = await prisma.town.findUnique({ where: { slug: townSlug } })
  if (!town) return NextResponse.json({ error: 'Town not found' }, { status: 404 })

  // Generate a unique slug for the business within this town
  const baseSlug = slugify(businessName)
  let slug = baseSlug
  let counter = 1
  while (await prisma.business.findUnique({ where: { townId_slug: { townId: town.id, slug } } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const { business, claim } = await prisma.$transaction(async tx => {
    const business = await tx.business.create({
      data: {
        townId:      town.id,
        name:        businessName,
        slug,
        category:    businessCategory,
        address:     businessAddress ?? null,
        postcode:    businessPostcode ?? null,
        phone:       businessPhone ?? null,
        website:     businessWebsite ?? null,
        description: businessDescription ?? null,
        claimed:     false,
        verified:    false,
        active:      false,
      },
    })
    const claim = await tx.claimRequest.create({
      data: {
        businessId:  business.id,
        clerkUserId: userId,
        name:        claimantName,
        email:       claimantEmail,
        role:        claimantRole || null,
        status:      'PENDING',
      },
    })
    return { business, claim }
  })

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/claims`

  await getResend().emails.send({
    from: 'Twncryr <noreply@twncryr.co.uk>',
    to: process.env.ADMIN_EMAIL!,
    subject: `New registration: ${businessName} — ${town.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#085041">New business registration</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#666;font-size:13px;width:120px">Business</td><td style="padding:8px 0;font-size:13px;font-weight:500">${esc(businessName)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Category</td><td style="padding:8px 0;font-size:13px">${esc(businessCategory)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Town</td><td style="padding:8px 0;font-size:13px">${esc(town.name)}, ${esc(town.county)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Address</td><td style="padding:8px 0;font-size:13px">${esc(businessAddress)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Postcode</td><td style="padding:8px 0;font-size:13px">${esc(businessPostcode)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${esc(businessPhone)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Website</td><td style="padding:8px 0;font-size:13px">${esc(businessWebsite)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #eee">Registrant</td><td style="padding:8px 0;font-size:13px;border-top:1px solid #eee">${esc(claimantName)}</td></tr>
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
    subject: `We've received your registration — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Thanks, ${claimantName}!</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">
          We've received your registration for <strong>${businessName}</strong> on Twncryr.
          We typically review and approve within a few hours — we'll email you here as soon as you're live.
        </p>
        <p style="font-size:13px;color:#999;margin-top:24px">
          Questions? Reply to this email or reach us at ignistech999@gmail.com
        </p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, businessId: business.id, claimId: claim.id })
}
