import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import CommunityForum from './_client'

async function getCommunityPosts(townId: string) {
  return prisma.communityPost.findMany({
    where: { townId },
    include: {
      business: {
        select: { id: true, name: true, slug: true, logo: true, category: true },
      },
      replies: {
        include: {
          business: {
            select: { id: true, name: true, logo: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  })
}

async function getTownBusinessCount(townId: string) {
  return prisma.business.count({
    where: { townId, active: true, claimed: true },
  })
}

export default async function CommunityPage() {
  const business = await requireBusiness()

  const [posts, memberCount] = await Promise.all([
    getCommunityPosts(business.town.id),
    getTownBusinessCount(business.town.id),
  ])

  // Serialise dates for client
  const serialised = posts.map(p => ({
    id:           p.id,
    body:         p.body,
    pinned:       p.pinned,
    createdAt:    p.createdAt.toISOString(),
    updatedAt:    p.updatedAt.toISOString(),
    business: {
      id:       p.business.id,
      name:     p.business.name,
      slug:     p.business.slug,
      logo:     p.business.logo,
      category: p.business.category as string,
    },
    replies: p.replies.map(r => ({
      id:        r.id,
      body:      r.body,
      createdAt: r.createdAt.toISOString(),
      business: {
        id:   r.business.id,
        name: r.business.name,
        logo: r.business.logo,
      },
    })),
  }))

  return (
    <div className="p-5 max-w-[720px]">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-[22px] text-[var(--color-text-primary)]">
            Business community
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            Private forum for {business.town.name} traders only ·{' '}
            <span className="text-[#0F6E56]">{memberCount} members</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5]">
          <i className="ti ti-lock text-[12px]" aria-hidden="true" />
          Private · businesses only
        </div>
      </div>

      <CommunityForum
        initialPosts={serialised}
        currentBusinessId={business.id}
        currentBusinessName={business.name}
        townSlug={business.town.slug}
        townName={business.town.name}
      />
    </div>
  )
}
