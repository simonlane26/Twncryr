import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

  const supplier = await prisma.supplier.findUnique({ where: { id } })
  if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
  if (supplier.status !== 'PENDING') {
    return NextResponse.json({ error: 'Supplier is not pending' }, { status: 409 })
  }

  await prisma.supplier.update({ where: { id }, data: { status: 'APPROVED' } })

  await getResend().emails.send({
    from: 'Twncryr <partners@twncryr.co.uk>',
    to: supplier.email,
    subject: `You're approved — Twncryr Supplier Partner`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Welcome to Twncryr, ${supplier.contactName.split(' ')[0]}!</h2>
        <p style="font-size:14px;color:#444;line-height:1.7">
          Your application for <strong>${supplier.companyName}</strong> has been approved.
          You'll now receive automatic email notifications whenever demand for
          <strong>${supplier.category.toLowerCase().replace('_', ' ')}</strong>
          reaches <strong>${supplier.minGroupSize} businesses</strong> in a town.
        </p>
        <p style="font-size:13px;color:#666;margin-top:16px">
          Questions? Reply to this email or reach us at <a href="mailto:partners@twncryr.co.uk" style="color:#085041">partners@twncryr.co.uk</a>
        </p>
      </div>
    `,
  })

  return NextResponse.redirect(
    new URL(`/admin/suppliers?approved=${encodeURIComponent(supplier.companyName)}`, req.url),
    303
  )
}
