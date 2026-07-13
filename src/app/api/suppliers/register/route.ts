import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  companyName:  z.string().min(1).max(100),
  contactName:  z.string().min(1).max(100),
  email:        z.string().email(),
  phone:        z.string().optional(),
  website:      z.string().optional(),
  category:     z.string(),
  description:  z.string().min(10).max(1000),
  offerSummary: z.string().min(5).max(200),
  minGroupSize: z.number().int().min(3).max(50),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Check not already registered
  const existing = await prisma.supplier.findUnique({
    where: { email: parsed.data.email },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'An application already exists for this email address.' },
      { status: 409 }
    )
  }

  const supplier = await prisma.supplier.create({
    data: parsed.data as any,
  })

  const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/suppliers/${supplier.id}/approve?secret=${process.env.ADMIN_SECRET}`
  const adminUrl   = `${process.env.NEXT_PUBLIC_APP_URL}/admin/suppliers?secret=${process.env.ADMIN_SECRET}`

  // Email you (admin) to review
  await resend.emails.send({
    from:    'Twncryr <noreply@twncryr.co.uk>',
    to:      process.env.ADMIN_EMAIL!,
    subject: `New supplier application — ${parsed.data.companyName} (${parsed.data.category})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#085041">New supplier application</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:7px 0;color:#666;font-size:13px;width:130px">Company</td><td style="padding:7px 0;font-size:13px;font-weight:500">${parsed.data.companyName}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Contact</td><td style="padding:7px 0;font-size:13px">${parsed.data.contactName}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Email</td><td style="padding:7px 0;font-size:13px"><a href="mailto:${parsed.data.email}">${parsed.data.email}</a></td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Phone</td><td style="padding:7px 0;font-size:13px">${parsed.data.phone ?? '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Website</td><td style="padding:7px 0;font-size:13px">${parsed.data.website ?? '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px;border-top:1px solid #eee">Category</td><td style="padding:7px 0;font-size:13px;border-top:1px solid #eee">${parsed.data.category}</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Min group size</td><td style="padding:7px 0;font-size:13px">${parsed.data.minGroupSize} businesses</td></tr>
          <tr><td style="padding:7px 0;color:#666;font-size:13px">Offer summary</td><td style="padding:7px 0;font-size:13px">${parsed.data.offerSummary}</td></tr>
        </table>
        <p style="font-size:13px;color:#444;background:#f5f5f5;padding:12px;border-radius:8px;line-height:1.6">${parsed.data.description}</p>
        <div style="margin-top:20px;display:flex;gap:10px">
          <a href="${approveUrl}" style="background:#085041;color:#E1F5EE;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;display:inline-block">✓ Approve supplier</a>
          <a href="${adminUrl}" style="background:#f5f5f5;color:#333;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;display:inline-block">View all suppliers</a>
        </div>
      </div>
    `,
  })

  // Email the supplier confirming receipt
  await resend.emails.send({
    from:    'Twncryr <partners@twncryr.co.uk>',
    to:      parsed.data.email,
    subject: `Application received — Twncryr Partner Programme`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Thanks for applying, ${parsed.data.contactName.split(' ')[0]}</h2>
        <p style="font-size:14px;color:#444;line-height:1.7">We've received your application to join the Twncryr supplier partner programme. We'll review it and get back to you within 2 working days.</p>
        <div style="background:#E1F5EE;border-radius:8px;padding:14px;margin:16px 0">
          <p style="font-size:13px;color:#085041;margin:0;line-height:1.6">
            <strong>What happens next:</strong> Once approved, you'll receive an automatic email whenever demand for <strong>${parsed.data.category.toLowerCase().replace('_', ' ')}</strong> reaches <strong>${parsed.data.minGroupSize} businesses</strong> in a town. You'll then be invited to submit a proposal for that group.
          </p>
        </div>
        <p style="font-size:13px;color:#666">Questions? Reply to this email or reach us at <a href="mailto:partners@twncryr.co.uk" style="color:#085041">partners@twncryr.co.uk</a></p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, supplierId: supplier.id }, { status: 201 })
}
