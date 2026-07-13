'use client'

import { useState } from 'react'

type Category = {
  value: string
  label: string
  icon: string
  description: string
  threshold: number
  saving: string
}

const CATEGORIES: Category[] = [
  {
    value: 'ENERGY',
    label: 'Energy',
    icon: 'ti-bolt',
    description: 'Collective electricity & gas tariff negotiated as a group',
    threshold: 10,
    saving: '~£2,400/yr',
  },
  {
    value: 'CARD_PROCESSING',
    label: 'Card processing',
    icon: 'ti-credit-card',
    description: 'Lower merchant service charges through combined volume',
    threshold: 8,
    saving: '~£800/yr',
  },
  {
    value: 'INSURANCE',
    label: 'Insurance',
    icon: 'ti-shield-check',
    description: 'Combined public liability and business insurance',
    threshold: 12,
    saving: '~£600/yr',
  },
  {
    value: 'PACKAGING',
    label: 'Packaging',
    icon: 'ti-box',
    description: 'Branded & plain packaging, bags, and food containers',
    threshold: 8,
    saving: '~£400/yr',
  },
  {
    value: 'BROADBAND',
    label: 'Broadband',
    icon: 'ti-wifi',
    description: 'Business fibre broadband at wholesale prices',
    threshold: 6,
    saving: '~£300/yr',
  },
  {
    value: 'CLEANING_SUPPLIES',
    label: 'Cleaning supplies',
    icon: 'ti-droplet',
    description: 'Wholesale cleaning products delivered monthly',
    threshold: 6,
    saving: '~£200/yr',
  },
  {
    value: 'ACCOUNTING',
    label: 'Accounting',
    icon: 'ti-calculator',
    description: 'Shared accountancy services and payroll processing',
    threshold: 8,
    saving: '~£1,200/yr',
  },
  {
    value: 'MARKETING_TOOLS',
    label: 'Marketing tools',
    icon: 'ti-speakerphone',
    description: 'Social scheduling, email marketing, and design tools',
    threshold: 5,
    saving: '~£500/yr',
  },
]

export default function CollectiveClient({
  townName,
  counts: initialCounts,
  myCategories: initialMine,
}: {
  townName: string
  counts: Record<string, number>
  myCategories: string[]
}) {
  const [counts, setCounts]   = useState<Record<string, number>>(initialCounts)
  const [mine, setMine]       = useState<Set<string>>(new Set(initialMine))
  const [loading, setLoading] = useState<Set<string>>(new Set())

  async function registerInterest(category: string) {
    if (mine.has(category) || loading.has(category)) return

    // Optimistic update
    setLoading(prev => new Set(prev).add(category))
    setMine(prev => new Set(prev).add(category))
    setCounts(prev => ({ ...prev, [category]: (prev[category] ?? 0) + 1 }))

    try {
      const res = await fetch('/api/collective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      if (res.ok) {
        const { count } = await res.json()
        setCounts(prev => ({ ...prev, [category]: count }))
      } else {
        // Rollback on failure
        setMine(prev => { const s = new Set(prev); s.delete(category); return s })
        setCounts(prev => ({ ...prev, [category]: Math.max(0, (prev[category] ?? 1) - 1) }))
      }
    } catch {
      setMine(prev => { const s = new Set(prev); s.delete(category); return s })
      setCounts(prev => ({ ...prev, [category]: Math.max(0, (prev[category] ?? 1) - 1) }))
    } finally {
      setLoading(prev => { const s = new Set(prev); s.delete(category); return s })
    }
  }

  const totalInterested = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div>
      {/* Info strip */}
      <div className="flex items-start gap-3 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl px-4 py-3 mb-5">
        <i className="ti ti-info-circle text-[16px] text-[#0F6E56] mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="text-[13px] text-[var(--color-text-primary)] font-medium mb-0.5">
            How it works
          </p>
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
            When enough {townName} businesses register interest in a category, we approach
            suppliers to negotiate a group deal. Completely non-binding — you're just
            registering appetite. We'll email you when a deal is ready.
          </p>
        </div>
      </div>

      {totalInterested > 0 && (
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">
          <span className="font-medium text-[var(--color-text-primary)]">{totalInterested}</span> interest{totalInterested === 1 ? '' : 's'} registered across all categories in {townName}
        </p>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(cat => {
          const count     = counts[cat.value] ?? 0
          const isIn      = mine.has(cat.value)
          const isLoading = loading.has(cat.value)
          const isReady   = count >= cat.threshold
          const pct       = Math.min(100, Math.round((count / cat.threshold) * 100))

          return (
            <div
              key={cat.value}
              className={`bg-[var(--color-background-primary)] rounded-xl p-4 border transition-all ${
                isReady
                  ? 'border-[#5DCAA5]'
                  : isIn
                  ? 'border-[#A8DFC9]'
                  : 'border-[var(--color-border-tertiary)]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isReady ? 'bg-[#0F6E56]' : 'bg-[#E1F5EE]'
                  }`}>
                    <i
                      className={`ti ${cat.icon} text-[16px] ${isReady ? 'text-white' : 'text-[#085041]'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    {cat.label}
                  </span>
                </div>

                {isReady ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0F6E56] text-white flex-shrink-0">
                    Ready!
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#0F6E56] flex-shrink-0">
                    {cat.saving}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                {cat.description}
              </p>

              {/* Progress bar */}
              <div className="mb-1">
                <div className="h-1.5 rounded-full bg-[var(--color-background-tertiary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isReady ? 'bg-[#0F6E56]' : 'bg-[#5DCAA5]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] mb-3">
                {count} of {cat.threshold} businesses
              </p>

              {/* CTA */}
              {isIn ? (
                <div className="flex items-center gap-1.5 text-[12px] text-[#0F6E56] font-medium">
                  <i className="ti ti-check text-[13px]" aria-hidden="true" />
                  {isReady ? "You're in — we'll be in touch" : "You're interested"}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => registerInterest(cat.value)}
                  disabled={isLoading}
                  className="w-full text-[12px] font-medium bg-[var(--color-background-secondary)] border border-[var(--color-border-secondary)] text-[var(--color-text-primary)] py-2 rounded-lg cursor-pointer hover:border-[#5DCAA5] hover:text-[#085041] hover:bg-[#E1F5EE] transition-all disabled:opacity-50 font-sans flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <i className="ti ti-loader-2 animate-spin text-[13px]" aria-hidden="true" />
                  ) : (
                    <i className="ti ti-hand-click text-[13px]" aria-hidden="true" />
                  )}
                  {isLoading ? 'Registering…' : "I'm interested"}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-5 leading-relaxed">
        Only your interest level is shared with us — never your identity or financials.
        You can withdraw interest at any time by emailing ignistech999@gmail.com.
      </p>
    </div>
  )
}
