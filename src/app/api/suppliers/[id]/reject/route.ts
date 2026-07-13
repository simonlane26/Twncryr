import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { isAdminUser } from '@/lib/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!await isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const supplier = await prisma.supplier.findUnique({ where: { id } })
  if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
  if (supplier.status !== 'PENDING') {
    return NextResponse.json({ error: 'Supplier is not pending' }, { status: 409 })
  }

  await prisma.supplier.update({ where: { id }, data: { status: 'REJECTED' } })

  await resend.emails.send({
    from: 'Twncryr <partners@twncryr.co.uk>',
    to: supplier.email,
    subject: `Update on your supplier application — Twncryr`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Hi ${supplier.contactName.split(' ')[0]},</h2>
        <p style="font-size:14px;color:#444;line-height:1.7">
          Thank you for your interest in joining the Twncryr supplier partner programme.
          Unfortunately we're unable to proceed with your application for <strong>${supplier.companyName}</strong> at this time.
        </p>
        <p style="font-size:13px;color:#666">
          If you'd like to discuss this further, reply to this email or reach us at
          <a href="mailto:partners@twncryr.co.uk" style="color:#085041">partners@twncryr.co.uk</a>
        </p>
      </div>
    `,
  })

  return NextResponse.redirect(new URL('/admin/suppliers', req.url), 303)
}
