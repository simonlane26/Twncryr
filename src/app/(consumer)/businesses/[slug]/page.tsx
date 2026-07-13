import { notFound } from 'next/navigation'
import { requireTown } from '@/lib/town'
import { prisma } from '@/lib/prisma'
import BusinessProfileClient from './_client'

function isOpenNow(openingHours: any): { open: boolean; todayHours: { open: string; close: string; closed?: boolean } | null } {
  if (!openingHours) return { open: false, todayHours: null }

  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayKey = DAYS[new Date().getDay()]
  const h = openingHours[dayKey]

  if (!h || h.closed) return { open: false, todayHours: h ?? null }

  const now = new Date()
  const [openH, openM] = h.open.split(':').map(Number)
  const [closeH, closeM] = h.close.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const openMins = openH * 60 + openM
  const closeMins = closeH * 60 + closeM

  return { open: nowMins >= openMins && nowMins < closeMins, todayHours: h }
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const town = await requireTown()

  const business = await prisma.business.findUnique({
    where: { townId_slug: { townId: town.id, slug } },
    include: {
      town: true,
      posts: {
        where: {
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!business || !business.active) notFound()

  const nearby = await prisma.business.findMany({
    where: {
      townId: town.id,
      active: true,
      id: { not: business.id },
      category: business.category,
    },
    select: { id: true, name: true, slug: true, category: true, address: true, logo: true },
    take: 4,
  })

  const { open, todayHours } = isOpenNow(business.openingHours)

  return (
    <BusinessProfileClient
      business={business}
      town={town}
      nearby={nearby}
      isOpenNow={open}
      todayHours={todayHours}
    />
  )
}
