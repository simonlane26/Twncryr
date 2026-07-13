import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const {
    businessName, businessCategory, businessAddress, businessPostcode,
    businessPhone, businessWebsite, businessDescription,
    townSlug,
    claimantName, claimantEmail, claimantRole, claimantPhone,
  } = await req.json()

  if (!businessName || !businessCategory || !claimantName || !claimantEmail || !townSlug) {
    return NextResponse.json(
      { error: 'businessName, businessCategory, claimantName, claimantEmail, and townSlug are required' },
      { status: 400 }
    )
  }

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

  const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/claims/${claim.id}/approve?secret=${process.env.ADMIN_SECRET}`
  const rejectUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/claims/${claim.id}/reject?secret=${process.env.ADMIN_SECRET}`
  const adminUrl   = `${process.env.NEXT_PUBLIC_APP_URL}/admin/claims`

  await resend.emails.send({
    from: 'Twncryr <noreply@twncryr.co.uk>',
    to: process.env.ADMIN_EMAIL!,
    subject: `New registration: ${businessName} — ${town.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#085041">New business registration</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#666;font-size:13px;width:120px">Business</td><td style="padding:8px 0;font-size:13px;font-weight:500">${businessName}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Category</td><td style="padding:8px 0;font-size:13px">${businessCategory}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Town</td><td style="padding:8px 0;font-size:13px">${town.name}, ${town.county}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Address</td><td style="padding:8px 0;font-size:13px">${businessAddress ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Postcode</td><td style="padding:8px 0;font-size:13px">${businessPostcode ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${businessPhone ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Website</td><td style="padding:8px 0;font-size:13px">${businessWebsite ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #eee">Registrant</td><td style="padding:8px 0;font-size:13px;border-top:1px solid #eee">${claimantName}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Email</td><td style="padding:8px 0;font-size:13px"><a href="mailto:${claimantEmail}">${claimantEmail}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Role</td><td style="padding:8px 0;font-size:13px">${claimantRole ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${claimantPhone ?? '—'}</td></tr>
        </table>
        <a href="${approveUrl}" style="background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block;margin-right:12px">✓ Approve</a>
        <a href="${rejectUrl}" style="background:#f5f5f5;color:#333;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;display:inline-block">✗ Reject</a>
        <p style="font-size:12px;color:#999;margin-top:24px">Manage all claims at <a href="${adminUrl}">${adminUrl}</a></p>
      </div>
    `,
  })

  await resend.emails.send({
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
