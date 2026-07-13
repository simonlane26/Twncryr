import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import CollectiveClient from './_client'

export default async function CollectivePage() {
  const business = await requireBusiness()

  const [groupedCounts, myInterests] = await Promise.all([
    prisma.collectiveInterest.groupBy({
      by: ['category'],
      where: { townId: business.townId },
      _count: { category: true },
    }),
    prisma.collectiveInterest.findMany({
      where: { businessId: business.id },
      select: { category: true },
    }),
  ])

  const counts = Object.fromEntries(
    groupedCounts.map(c => [c.category, c._count.category])
  ) as Record<string, number>

  return (
    <div className="p-5 max-w-[760px]">
      <div className="mb-5">
        <h1 className="font-serif text-[22px] text-[var(--color-text-primary)] flex items-center gap-2">
          <i className="ti ti-package text-[20px] text-[#0F6E56]" aria-hidden="true" />
          Collective purchasing
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          Register interest in group deals with other {business.town.name} businesses.
          Non-binding — we negotiate once there's enough appetite.
        </p>
      </div>

      <CollectiveClient
        townName={business.town.name}
        counts={counts}
        myCategories={myInterests.map(i => i.category as string)}
      />
    </div>
  )
}
