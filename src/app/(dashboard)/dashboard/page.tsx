import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import MetricsRow from './_components/MetricsRow'
import PostComposer from './_components/PostComposer'
import ActivePosts from './_components/ActivePosts'
import CommunityPreview from './_components/CommunityPreview'
import ListingCard from './_components/ListingCard'

// ─────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────

async function getMetrics(businessId: string) {
  const [views, enquiries, clicks, rank] = await Promise.all([
    // Total post views this week
    prisma.post.aggregate({
      where: {
        businessId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { views: true },
    }),

    // Total enquiries this week
    prisma.enquiry.count({
      where: {
        businessId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Total deal clicks this week
    prisma.post.aggregate({
      where: {
        businessId,
        type: 'DEAL',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _sum: { clicks: true },
    }),

    // Listing rank within category in this town
    prisma.business.count({
      where: {
        townId: (await prisma.business.findUnique({
          where: { id: businessId },
          select: { townId: true },
        }))!.townId,
        active: true,
      },
    }),
  ])

  return {
    views:     views._sum.views ?? 0,
    enquiries,
    clicks:    clicks._sum.clicks ?? 0,
    rank,
  }
}

async function getActivePosts(businessId: string) {
  return prisma.post.findMany({
    where: {
      businessId,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

async function getRecentPosts(businessId: string) {
  return prisma.post.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
}

async function getCommunityPosts(townId: string) {
  return prisma.communityPost.findMany({
    where: { townId },
    include: {
      business: { select: { name: true } },
      replies: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

// ─────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getDayContext() {
  const day = new Date().getDay()
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const isMarketDay = day === 2 || day === 6
  return { date, isMarketDay, dayName: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day] }
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function DashboardPage() {
  const business = await requireBusiness()

  const [metrics, activePosts, recentPosts, communityPosts, bizTokens] = await Promise.all([
    getMetrics(business.id),
    getActivePosts(business.id),
    getRecentPosts(business.id),
    getCommunityPosts(business.town.id),
    prisma.business.findUnique({
      where: { id: business.id },
      select: { googleRefreshToken: true },
    }),
  ])

  const googleConnected = !!bizTokens?.googleRefreshToken

  const greeting = getGreeting()
  const { date, isMarketDay, dayName } = getDayContext()

  // Serialise dates for client components
  const serialisedActivePosts = activePosts.map(p => ({
    ...p,
    expiresAt:  p.expiresAt?.toISOString() ?? null,
    startsAt:   p.startsAt?.toISOString() ?? null,
    createdAt:  p.createdAt.toISOString(),
    updatedAt:  p.updatedAt.toISOString(),
  }))

  const serialisedRecentPosts = recentPosts.map(p => ({
    ...p,
    expiresAt:  p.expiresAt?.toISOString() ?? null,
    startsAt:   p.startsAt?.toISOString() ?? null,
    createdAt:  p.createdAt.toISOString(),
    updatedAt:  p.updatedAt.toISOString(),
  }))

  const serialisedCommunity = communityPosts.map(p => ({
    id:          p.id,
    body:        p.body,
    pinned:      p.pinned,
    createdAt:   p.createdAt.toISOString(),
    businessName: p.business.name,
    replyCount:  p.replies.length,
  }))

  return (
    <div className="p-5 max-w-[960px]">

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-[22px] text-[var(--color-text-primary)]">
            {greeting}, {business.name.split(' ')[0]} 👋
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            {date}
            {isMarketDay && (
              <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806]">
                Market day
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Market day prompt */}
      {isMarketDay && (
        <div className="bg-[#FAEEDA] border border-[#FAC775] rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
          <i className="ti ti-star text-[16px] text-[#854F0B] mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-[13px] text-[#412402] leading-relaxed">
            <strong>It's market day.</strong> Footfall is higher than usual — a great time to post a last-minute table or a lunchtime deal.
          </p>
        </div>
      )}

      {/* Metrics */}
      <MetricsRow metrics={metrics} />

      {/* Main grid */}
      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Post composer */}
        <PostComposer
          businessId={business.id}
          townSlug={business.town.slug}
          googleConnected={googleConnected}
        />

        {/* Active + recent posts */}
        <ActivePosts
          activePosts={serialisedActivePosts}
          recentPosts={serialisedRecentPosts}
        />

      </div>

      {/* Lower grid */}
      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Community preview */}
        <CommunityPreview posts={serialisedCommunity} townName={business.town.name} />

        {/* Listing card */}
        <ListingCard business={{
          id:          business.id,
          name:        business.name,
          category:    business.category as string,
          address:     business.address,
          phone:       business.phone,
          website:     business.website,
          description: business.description,
          photos:      business.photos,
          openingHours: business.openingHours as any,
        }} />

      </div>
    </div>
  )
}
