'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const CATEGORIES = [
  { value: 'all',           label: 'All' },
  { value: 'FOOD_DRINK',    label: 'Food & drink' },
  { value: 'RETAIL',        label: 'Shops' },
  { value: 'HEALTH_BEAUTY', label: 'Health & beauty' },
  { value: 'SERVICES',      label: 'Services' },
  { value: 'FITNESS',       label: 'Fitness' },
  { value: 'ARTS_CULTURE',  label: 'Arts & culture' },
]

export default function HeroSection({
  town,
}: {
  town: { name: string; county: string; heroImage: string | null }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') ?? 'all')
  const [, startTransition] = useTransition()

  function updateParams(newQ: string, newCat: string) {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newCat && newCat !== 'all') params.set('cat', newCat)
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams(query, activeCategory)
  }

  function handleCategory(cat: string) {
    setActiveCategory(cat)
    updateParams(query, cat)
  }

  return (
    <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 pt-7 pb-5">
      <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">
        {town.name}, {town.county}
      </p>
      <h1 className="font-serif text-[28px] font-semibold leading-tight mb-2">
        Your town, all in one place
      </h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5 max-w-lg">
        Discover local businesses, catch last-minute tables and find out what's on in {town.name}.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-[500px] mb-4">
        <div className="relative flex-1">
          <i
            className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[var(--color-text-secondary)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search restaurants, shops, services…"
            className="w-full text-[13px] pl-9 pr-4 py-2.5 border border-[var(--color-border-secondary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); updateParams('', activeCategory) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer"
              aria-label="Clear search"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#0F6E56] text-[#E1F5EE] border-none px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#085041] transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategory(cat.value)}
            className={`text-[12px] px-3.5 py-1.5 rounded-full border cursor-pointer transition-all font-sans ${
              activeCategory === cat.value
                ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                : 'bg-[var(--color-background-primary)] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5] hover:text-[#085041]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
