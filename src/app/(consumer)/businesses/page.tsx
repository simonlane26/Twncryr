import Link from 'next/link'
import { requireTown } from '@/lib/town'
import { prisma } from '@/lib/prisma'
import { BusinessCategory } from '@prisma/client'
import { z } from 'zod'
import {
  ForkKnife, ShoppingBag, Heart, Briefcase, Palette, Bed, Barbell,
  GraduationCap, Storefront, MagnifyingGlass,
} from '@phosphor-icons/react/dist/ssr'

const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType }> = {
  FOOD_DRINK:    { label: 'Food & drink',    Icon: ForkKnife },
  RETAIL:        { label: 'Retail',          Icon: ShoppingBag },
  HEALTH_BEAUTY: { label: 'Health & beauty', Icon: Heart },
  SERVICES:      { label: 'Services',        Icon: Briefcase },
  ARTS_CULTURE:  { label: 'Arts & culture',  Icon: Palette },
  ACCOMMODATION: { label: 'Accommodation',   Icon: Bed },
  FITNESS:       { label: 'Fitness',         Icon: Barbell },
  EDUCATION:     { label: 'Education',       Icon: GraduationCap },
  OTHER:         { label: 'Other',           Icon: Storefront },
}

export default async function BusinessDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category: categoryParam, q } = await searchParams
  const town = await requireTown()

  const categoryResult = categoryParam
    ? z.nativeEnum(BusinessCategory).safeParse(categoryParam)
    : null
  const category = categoryResult?.data

  const businesses = await prisma.business.findMany({
    where: {
      townId: town.id,
      active: true,
      ...(category ? { category } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { tagline: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
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

  return (
    <main className="bg-[var(--color-background-tertiary)] min-h-screen">
      <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 py-6">
        <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">{town.name}</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-[24px] font-semibold mb-4">Business directory</h1>

        {/* Search */}
        <form className="flex gap-2 max-w-[480px] mb-4">
          <div className="relative flex-1">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Search businesses…"
              className="w-full text-[13px] pl-9 pr-4 py-2.5 border border-[var(--color-border-secondary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
            />
          </div>
          <button type="submit" className="bg-[#0F6E56] text-[#E1F5EE] border-none px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#085041] transition-colors">
            Search
          </button>
        </form>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/businesses"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium no-underline transition-colors ${
              !category ? 'bg-[#0F6E56] text-[#E1F5EE]' : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
            }`}
          >
            All
          </Link>
          {Object.entries(CATEGORY_META).map(([key, { label, Icon }]) => (
            <Link
              key={key}
              href={`/businesses?category=${key}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium no-underline transition-colors ${
                category === key ? 'bg-[#0F6E56] text-[#E1F5EE]' : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
              }`}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} in {town.name}
        </p>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {businesses.map(biz => {
            const meta = CATEGORY_META[biz.category] ?? CATEGORY_META.OTHER
            const hasTable = biz.posts.some(p => p.type === 'TABLE')
            const hasDeal = biz.posts.some(p => p.type === 'DEAL')

            return (
              <Link
                key={biz.id}
                href={`/businesses/${biz.slug}`}
                className="block bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 no-underline hover:border-[#5DCAA5] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                    {biz.logo
                      ? <img src={biz.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <meta.Icon size={22} className="text-[#085041]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)] group-hover:text-[#0F6E56] transition-colors truncate">
                      {biz.name}
                    </p>
                    {biz.tagline && (
                      <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 truncate">{biz.tagline}</p>
                    )}
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{meta.label}</p>
                  </div>
                </div>
                {(hasTable || hasDeal) && (
                  <div className="flex gap-1.5 mt-3">
                    {hasTable && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAEEDA] text-[#633806]">
                        Table available
                      </span>
                    )}
                    {hasDeal && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#E1F5EE] text-[#085041]">
                        Deal on now
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {businesses.length === 0 && (
          <div className="text-center py-16">
            <Storefront size={40} className="text-[var(--color-border-secondary)] mx-auto mb-3" />
            <p className="text-[14px] text-[var(--color-text-secondary)]">No businesses found.</p>
          </div>
        )}
      </div>
    </main>
  )
}
