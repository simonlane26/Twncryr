'use client'

import { useState, useTransition } from 'react'
import { MagnifyingGlass, CircleNotch, Storefront, CaretRight, MagnifyingGlassMinus } from '@phosphor-icons/react'
import { StepHeader } from './OnboardingNav'
import type { OnboardingState } from './types'

type BizResult = Pick<
  OnboardingState,
  'businessId' | 'businessName' | 'businessSlug' | 'businessCategory' | 'businessAddress' | 'businessPhone' | 'businessWebsite'
>

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_DRINK: 'Food & drink', RETAIL: 'Retail', HEALTH_BEAUTY: 'Health & beauty',
  SERVICES: 'Services', ARTS_CULTURE: 'Arts & culture', ACCOMMODATION: 'Accommodation',
  FITNESS: 'Fitness', EDUCATION: 'Education', OTHER: 'Other',
}

export default function StepFindBusiness({
  onSelect,
}: {
  onSelect: (biz: BizResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  function getTownFromHost() {
    if (typeof window === 'undefined') return ''
    const host = window.location.hostname
    if (host.includes('localhost')) return 'nantwich'
    return host.split('.')[0]
  }

  async function handleSearch(val: string) {
    setQuery(val)
    if (val.length < 2) { setResults([]); setSearched(false); return }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/businesses/search?q=${encodeURIComponent(val)}&town=${getTownFromHost()}`)
        const data = await res.json()
        setResults(data.businesses ?? [])
        setSearched(true)
      } catch {
        setResults([])
        setSearched(true)
      }
    })
  }

  function handleSelect(biz: any) {
    onSelect({
      businessId: biz.id,
      businessName: biz.name,
      businessSlug: biz.slug,
      businessCategory: biz.category,
      businessAddress: biz.address,
      businessPhone: biz.phone,
      businessWebsite: biz.website,
    })
  }

  return (
    <div>
      <StepHeader
        eyebrow="Step 1 of 6" title="Find your business"
        subtitle="Search for your listing on TwnCryr to claim and manage it for free."
        step={0} totalSteps={6}
      />

      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text" value={query} onChange={e => handleSearch(e.target.value)}
          placeholder="Type your business name…"
          className="w-full text-[14px] pl-10 pr-4 py-3 border border-[var(--color-border-secondary)] rounded-xl bg-[var(--color-background-primary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
          autoFocus
        />
        {isPending && (
          <CircleNotch size={16} className="animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        )}
      </div>

      {!searched && !isPending && (
        <div className="text-center py-10 text-[var(--color-text-secondary)]">
          <Storefront size={32} className="mx-auto mb-3 text-[var(--color-border-secondary)]" />
          <p className="text-[13px]">Start typing your business name above</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl overflow-hidden mb-4">
          {results.map((biz, i) => (
            <button
              key={biz.id}
              onClick={() => handleSelect(biz)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-background-secondary)] transition-colors ${i < results.length - 1 ? 'border-b border-[var(--color-border-tertiary)]' : ''}`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                <Storefront size={18} className="text-[#085041]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[var(--color-text-primary)] truncate">{biz.name}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  {CATEGORY_LABELS[biz.category]} · {biz.address}
                </p>
              </div>
              <CaretRight size={15} className="text-[var(--color-text-secondary)]" />
            </button>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !isPending && (
        <div className="text-center py-8 text-[13px] text-[var(--color-text-secondary)]">
          <MagnifyingGlassMinus size={28} className="mx-auto mb-3 text-[var(--color-border-secondary)]" />
          <p className="mb-1">No businesses found for &ldquo;{query}&rdquo;</p>
          <p>
            Not listed yet?{' '}
            <button
              className="text-[#0F6E56] hover:underline bg-transparent border-none cursor-pointer text-[13px]"
              onClick={() => onSelect({ businessId: null, businessName: query, businessSlug: null, businessCategory: null, businessAddress: null, businessPhone: null, businessWebsite: null })}
            >
              Add your business manually →
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
