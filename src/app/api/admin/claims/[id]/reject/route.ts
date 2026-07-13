import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const claim = await prisma.claimRequest.findUnique({
    where: { id },
    include: { business: { include: { town: true } } },
  })

  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  if (claim.status !== 'PENDING') {
    return NextResponse.json({ error: 'Claim is not pending' }, { status: 409 })
  }

  await prisma.claimRequest.update({
    where: { id },
    data: { status: 'REJECTED' },
  })

  await resend.emails.send({
    from: 'Twncryr <ignistech999@gmail.com>',
    to: claim.email,
    subject: `Update on your claim — ${claim.business.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#085041">Hi ${claim.name},</h2>
        <p style="font-size:14px;color:#444;line-height:1.6">
          We weren't able to approve your claim for <strong>${claim.business.name}</strong> on this occasion.
          If you believe this is an error, please reply to this email or contact us at ignistech999@gmail.com.
        </p>
        <p style="font-size:12px;color:#999;margin-top:24px">The Twncryr team</p>
      </div>
    `,
  })

  return NextResponse.redirect(
    new URL(`/admin/claims?secret=${secret}`, req.url)
  )
}
