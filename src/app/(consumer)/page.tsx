import { Suspense } from 'react'
import { requireTown } from '@/lib/town'
import { prisma } from '@/lib/prisma'
import { ToastContainer } from '@/components/realtime/LiveFeed'
import MarketDayBanner from './_components/MarketDayBanner'
import HeroSection from './_components/HeroSection'
import BusinessDirectory from './_components/BusinessDirectory'
import EventsSidebar from './_components/EventsSidebar'
import LiveFeed from '@/components/realtime/LiveFeed'
import type { LivePost } from '@/components/realtime/useTownFeed'

async function getBusinesses(townId: string) {
  return prisma.business.findMany({
    where: { townId, active: true },
    include: {
      posts: {
        where: {
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { type: true },
      },
    },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  })
}

async function getEvents(townId: string) {
  return prisma.event.findMany({
    where: { townId, active: true, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    take: 6,
  })
}

async function getInitialPosts(townSlug: string): Promise<LivePost[]> {
  const posts = await prisma.post.findMany({
    where: {
      active: true,
      business: { town: { slug: townSlug }, active: true },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      business: { select: { id: true, name: true, slug: true, logo: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return posts.map(p => ({
    id: p.id, type: p.type, title: p.title, body: p.body,
    expiresAt: p.expiresAt?.toISOString() ?? null,
    startsAt: p.startsAt?.toISOString() ?? null,
    tableCount: p.tableCount, discountText: p.discountText,
    createdAt: p.createdAt.toISOString(), isNew: false,
    business: { id: p.business.id, name: p.business.name, slug: p.business.slug, logo: p.business.logo, category: p.business.category },
  }))
}

function getMarketDay(): string | null {
  const day = new Date().getDay()
  if (day === 2) return 'Tuesday'
  if (day === 6) return 'Saturday'
  return null
}

export default async function TownHomePage() {
  const town = await requireTown()
  const [businesses, events, initialPosts] = await Promise.all([
    getBusinesses(town.id),
    getEvents(town.id),
    getInitialPosts(town.slug),
  ])

  const marketDay = getMarketDay()
  const tablePosts = initialPosts.filter(p => p.type === 'TABLE')
  const dealPosts  = initialPosts.filter(p => p.type === 'DEAL')

  const serialisedBusinesses = businesses.map(b => ({
    id: b.id, name: b.name, slug: b.slug, category: b.category as string,
    address: b.address, phone: b.phone, website: b.website, logo: b.logo,
    description: b.description, featured: b.featured,
    openingHours: b.openingHours as any,
    hasTable: b.posts.some(p => p.type === 'TABLE'),
    hasDeal:  b.posts.some(p => p.type === 'DEAL'),
    hasEvent: b.posts.some(p => p.type === 'EVENT'),
    activePosts: b.posts.length,
  }))

  return (
    <div className="font-sans bg-[var(--color-background-tertiary)] min-h-screen">
      <ToastContainer townSlug={town.slug} />

      <Suspense fallback={<div className="h-[180px]" />}>
        <HeroSection town={{ name: town.name, county: town.county, heroImage: town.heroImage }} />
      </Suspense>

      {marketDay && <MarketDayBanner day={marketDay} townName={town.name} dealCount={dealPosts.length} />}

      <div className="grid gap-4 p-5" style={{ gridTemplateColumns: '1fr 268px' }}>
        <div>
          {tablePosts.length > 0 && (
            <section className="mb-4">
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
                <LiveFeed townSlug={town.slug} initialPosts={tablePosts} filter="TABLE" />
              </div>
            </section>
          )}
          <section className="mb-4">
            <Suspense fallback={<div className="h-[400px]" />}>
              <BusinessDirectory businesses={serialisedBusinesses} />
            </Suspense>
          </section>
          {dealPosts.length > 0 && (
            <section>
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
                <LiveFeed townSlug={town.slug} initialPosts={dealPosts} filter="DEAL" />
              </div>
            </section>
          )}
        </div>

        <aside>
          <EventsSidebar events={events} townName={town.name} />

          <div className="bg-[#085041] rounded-xl p-4 text-center mt-3">
            <p className="font-serif text-[15px] text-[#E1F5EE] mb-1.5">Are you a {town.name} business?</p>
            <p className="text-[11px] text-[#9FE1CB] leading-relaxed mb-3">Claim your free listing, post deals and last-minute tables, and connect with other local traders.</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[{ n: serialisedBusinesses.length.toString(), l: 'Businesses' }, { n: '1.2k', l: 'Visitors/mo' }, { n: 'Free', l: 'To join' }].map(s => (
                <div key={s.l} className="bg-white/10 rounded-lg py-2 px-1 text-center">
                  <span className="block text-[16px] font-medium text-[#E1F5EE]">{s.n}</span>
                  <span className="block text-[9px] text-[#9FE1CB] mt-0.5">{s.l}</span>
                </div>
              ))}
            </div>
            <a href="/onboarding" className="block bg-[#E1F5EE] text-[#085041] py-2 rounded-lg text-[12px] font-medium no-underline hover:bg-white transition-colors">
              Claim your listing →
            </a>
          </div>

          <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mt-3">
            <p className="text-[10px] font-medium tracking-[1.2px] uppercase text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
              <i className="ti ti-lock text-[12px]" aria-hidden="true" /> Business community
            </p>
            {[
              { biz: 'The Cocoa Garden', msg: 'Looking for a part-time Saturday team member — anyone know someone?', time: '2 hrs ago' },
              { biz: 'Cheshire Gifts', msg: 'Splitting cost of festive display materials — 3 spaces left.', time: '4 hrs ago' },
              { biz: 'Petal & Bloom', msg: 'Hospital Street closure Monday — heads up for deliveries.', time: 'Yesterday' },
            ].map((item, i, arr) => (
              <div key={i} className={`pb-2.5 ${i < arr.length - 1 ? 'border-b border-[var(--color-border-tertiary)] mb-2.5' : ''}`}>
                <p className="text-[11px] font-medium text-[var(--color-text-primary)] mb-1">{item.biz}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{item.msg}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{item.time}</p>
              </div>
            ))}
            <a href="/onboarding" className="block text-center text-[11px] text-[#0F6E56] mt-3 hover:underline no-underline">Join to access →</a>
          </div>
        </aside>
      </div>
    </div>
  )
}
