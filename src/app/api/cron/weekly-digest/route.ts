import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend } from '@/lib/resend'

function verifyCronSecret(req: NextRequest): boolean {
  const provided = req.headers.get('Authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET) return false
  const a = Buffer.from(provided), b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const businesses = await prisma.business.findMany({
    where: { active: true, claimed: true, email: { not: null } },
    include: {
      town: { select: { name: true } },
      _count: {
        select: {
          posts:     { where: { createdAt: { gte: oneWeekAgo } } },
          enquiries: { where: { createdAt: { gte: oneWeekAgo } } },
        },
      },
    },
  })

  let sent = 0

  for (const biz of businesses) {
    if (!biz.email) continue

    await getResend().emails.send({
      from:    'Twncryr <noreply@twncryr.co.uk>',
      to:      biz.email,
      subject: `Your week on Twncryr — ${biz.town.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#085041">Your week on Twncryr</h2>
          <p style="font-size:14px;color:#444">${biz.name} · ${biz.town.name}</p>
          <div style="background:#E1F5EE;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0;font-size:13px;color:#085041">
              <strong>${biz._count.posts}</strong> post${biz._count.posts !== 1 ? 's' : ''} published &nbsp;·&nbsp;
              <strong>${biz._count.enquiries}</strong> enquir${biz._count.enquiries !== 1 ? 'ies' : 'y'} received this week
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
            style="display:inline-block;background:#0F6E56;color:#E1F5EE;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">
            Go to your dashboard →
          </a>
          <p style="font-size:11px;color:#999;margin-top:24px">
            You're receiving this because you have a listing on Twncryr.
          </p>
        </div>
      `,
    })

    sent++
  }

  return NextResponse.json({ sent })
}
