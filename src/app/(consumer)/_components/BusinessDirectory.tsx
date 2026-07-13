'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMemo } from 'react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SerialisedBusiness = {
  id: string
  name: string
  slug: string
  category: string
  address: string | null
  phone: string | null
  website: string | null
  logo: string | null
  description: string | null
  featured: boolean
  openingHours: any
  hasTable: boolean
  hasDeal: boolean
  hasEvent: boolean
  activePosts: number
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_DRINK:    'Food & drink',
  RETAIL:        'Retail',
  HEALTH_BEAUTY: 'Health & beauty',
  SERVICES:      'Services',
  ARTS_CULTURE:  'Arts & culture',
  ACCOMMODATION: 'Accommodation',
  FITNESS:       'Fitness',
  EDUCATION:     'Education',
  OTHER:         'Other',
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD_DRINK:    '🍽️',
  RETAIL:        '🛍️',
  HEALTH_BEAUTY: '💆',
  SERVICES:      '🔧',
  ARTS_CULTURE:  '🎨',
  ACCOMMODATION: '🛏️',
  FITNESS:       '💪',
  EDUCATION:     '📚',
  OTHER:         '🏪',
}

const EMOJI_BG: Record<string, string> = {
  FOOD_DRINK:    '#E1F5EE',
  RETAIL:        '#FAEEDA',
  HEALTH_BEAUTY: '#FAECE7',
  SERVICES:      '#E6F1FB',
  ARTS_CULTURE:  '#F3E8FF',
  ACCOMMODATION: '#E1F5EE',
  FITNESS:       '#FAEEDA',
  EDUCATION:     '#E6F1FB',
  OTHER:         'var(--color-background-secondary)',
}

function isOpenNow(openingHours: any): boolean {
  if (!openingHours) return false
  const now = new Date()
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()]
  const hours = openingHours[dayKey]
  if (!hours || hours.closed) return false

  const [openH, openM] = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const openMins = openH * 60 + openM
  const closeMins = closeH * 60 + closeM
  return nowMins >= openMins && nowMins < closeMins
}

// ─────────────────────────────────────────────
// Business card
// ─────────────────────────────────────────────

function BusinessCard({ biz }: { biz: SerialisedBusiness }) {
  const open = isOpenNow(biz.openingHours)

  return (
    <Link
      href={`/businesses/${biz.slug}`}
      className="block bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-3.5 hover:border-[#5DCAA5] transition-colors no-underline"
    >
      <div className="flex items-start gap-3">
        {/* Icon / logo */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0 overflow-hidden"
          style={{ background: EMOJI_BG[biz.category] }}
        >
          {biz.logo
            ? <img src={biz.logo} alt="" className="w-full h-full object-cover" />
            : CATEGORY_EMOJI[biz.category] ?? '🏪'
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[var(--color-text-primary)] truncate font-serif">
            {biz.name}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            {CATEGORY_LABELS[biz.category]} {biz.address ? `· ${biz.address}` : ''}
          </p>

          {/* Status badges */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                open
                  ? 'bg-[#E1F5EE] text-[#085041]'
                  : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: open ? '#0F6E56' : 'var(--color-text-secondary)' }}
              />
              {open ? 'Open now' : 'Closed'}
            </span>

            {biz.hasTable && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806]">
                Table tonight
              </span>
            )}
            {biz.hasDeal && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041]">
                Deal on now
              </span>
            )}
            {biz.hasEvent && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#042C53]">
                Event soon
              </span>
            )}
            {biz.featured && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#5B21B6]">
                Featured
              </span>
            )}
          </div>
        </div>

        <i className="ti ti-chevron-right text-[14px] text-[var(--color-text-secondary)] mt-1 flex-shrink-0" aria-hidden="true" />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────
// BusinessDirectory
// Reads ?q= and ?cat= from the URL (set by HeroSection)
// and filters the passed-in businesses client-side.
// ─────────────────────────────────────────────

export default function BusinessDirectory({
  businesses,
}: {
  businesses: SerialisedBusiness[]
}) {
  const searchParams = useSearchParams()
  const q   = (searchParams.get('q') ?? '').toLowerCase().trim()
  const cat = searchParams.get('cat') ?? 'all'

  const filtered = useMemo(() => {
    return businesses.filter(biz => {
      const matchesCat = cat === 'all' || biz.category === cat
      const matchesQ =
        !q ||
        biz.name.toLowerCase().includes(q) ||
        biz.description?.toLowerCase().includes(q) ||
        biz.address?.toLowerCase().includes(q) ||
        CATEGORY_LABELS[biz.category]?.toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [businesses, q, cat])

  // Sort: open first, then featured, then alphabetical
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aOpen = isOpenNow(a.openingHours) ? 0 : 1
      const bOpen = isOpenNow(b.openingHours) ? 0 : 1
      if (aOpen !== bOpen) return aOpen - bOpen
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      if (b.activePosts !== a.activePosts) return b.activePosts - a.activePosts
      return a.name.localeCompare(b.name)
    })
  }, [filtered])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-medium tracking-[1.3px] uppercase text-[var(--color-text-secondary)]">
          {cat === 'all'
            ? 'Local businesses'
            : CATEGORY_LABELS[cat] ?? 'Businesses'
          }
        </p>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]">
          {sorted.length} {sorted.length === 1 ? 'business' : 'businesses'}
        </span>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl">
          <i className="ti ti-search-off text-[32px] text-[var(--color-border-secondary)] block mb-3" aria-hidden="true" />
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-1">
            No businesses found{q ? ` for "${q}"` : ''}.
          </p>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(biz => (
            <BusinessCard key={biz.id} biz={biz} />
          ))}
        </div>
      )}
    </div>
  )
}
