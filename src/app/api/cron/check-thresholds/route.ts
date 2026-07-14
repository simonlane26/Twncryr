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

  const suppliers = await prisma.supplier.findMany({
    where: { status: 'APPROVED' },
  })

  if (!suppliers.length) return NextResponse.json({ notified: 0 })

  // Count interest per town per category
  const interests = await prisma.collectiveInterest.groupBy({
    by: ['townId', 'category'],
    _count: { _all: true },
  })

  const towns = await prisma.town.findMany({
    where: { active: true },
    select: { id: true, name: true },
  })
  const townMap = Object.fromEntries(towns.map(t => [t.id, t.name]))

  let notified = 0

  for (const supplier of suppliers) {
    for (const interest of interests) {
      if (interest.category !== supplier.category) continue
      if (interest._count._all < supplier.minGroupSize) continue

      // Skip if already notified for this town + supplier + category combo
      const alreadySent = await prisma.thresholdNotification.findUnique({
        where: {
          townId_supplierId_category: {
            townId:     interest.townId,
            supplierId: supplier.id,
            category:   interest.category,
          },
        },
      })
      if (alreadySent) continue

      const townName = townMap[interest.townId] ?? interest.townId
      const count    = interest._count._all
      const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/suppliers`

      await getResend().emails.send({
        from:    'Twncryr <partners@twncryr.co.uk>',
        to:      supplier.email,
        subject: `${count} businesses in ${townName} want ${supplier.category.toLowerCase().replace(/_/g, ' ')} — submit a proposal`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#085041">Demand threshold reached in ${townName}</h2>
            <p style="font-size:14px;color:#444;line-height:1.7">
              <strong>${count} businesses</strong> in ${townName} have expressed interest in
              <strong>${supplier.category.toLowerCase().replace(/_/g, ' ')}</strong> — your minimum group size is
              <strong>${supplier.minGroupSize}</strong>.
            </p>
            <div style="background:#E1F5EE;border-radius:8px;padding:14px;margin:16px 0">
              <p style="font-size:13px;color:#085041;margin:0;line-height:1.6">
                <strong>Next step:</strong> Log in and submit a group proposal for ${townName}.
                Businesses will be able to accept or decline directly from their dashboard.
              </p>
            </div>
            <a href="${adminUrl}"
              style="display:inline-block;background:#085041;color:#E1F5EE;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">
              Submit a proposal →
            </a>
            <p style="font-size:11px;color:#999;margin-top:24px">
              You're receiving this because you're an approved supplier partner on Twncryr.
              Reply to this email to contact us.
            </p>
          </div>
        `,
      })

      await prisma.thresholdNotification.create({
        data: {
          townId:     interest.townId,
          supplierId: supplier.id,
          category:   interest.category,
        },
      })

      notified++
    }
  }

  return NextResponse.json({ notified })
}
