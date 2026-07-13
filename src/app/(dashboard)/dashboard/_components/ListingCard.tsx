// Server component — profile data passed from page.tsx

type BusinessSummary = {
  id: string
  name: string
  category: string
  address: string | null
  phone: string | null
  website: string | null
  description: string | null
  photos: string[]
  openingHours: any
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_DRINK: 'Food & drink', RETAIL: 'Retail', HEALTH_BEAUTY: 'Health & beauty',
  SERVICES: 'Services', ARTS_CULTURE: 'Arts & culture', ACCOMMODATION: 'Accommodation',
  FITNESS: 'Fitness', EDUCATION: 'Education', OTHER: 'Other',
}

// Calculate completeness score
function completeness(b: BusinessSummary): { score: number; missing: string[] } {
  const checks = [
    { label: 'Description',    done: !!b.description && b.description.length > 20 },
    { label: 'Phone number',   done: !!b.phone },
    { label: 'Website',        done: !!b.website },
    { label: 'Opening hours',  done: !!b.openingHours && Object.keys(b.openingHours).length > 0 },
    { label: 'Address',        done: !!b.address },
    { label: 'Photos',         done: b.photos.length >= 2 },
  ]
  const done    = checks.filter(c => c.done).length
  const missing = checks.filter(c => !c.done).map(c => c.label)
  return { score: Math.round((done / checks.length) * 100), missing }
}

export default function ListingCard({ business }: { business: BusinessSummary }) {
  const { score, missing } = completeness(business)

  const fields = [
    { label: 'Address',  value: business.address,  href: '/dashboard/profile' },
    { label: 'Phone',    value: business.phone,    href: '/dashboard/profile' },
    { label: 'Website',  value: business.website,  href: '/dashboard/profile', green: true },
    { label: 'Photos',   value: business.photos.length > 0 ? `${business.photos.length} uploaded` : null, href: '/dashboard/profile' },
  ]

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
          <i className="ti ti-building-store text-[14px] text-[#0F6E56]" aria-hidden="true" />
          Your listing
        </p>
        <a
          href="/dashboard/profile"
          className="text-[11px] text-[#0F6E56] hover:underline no-underline"
        >
          Edit profile
        </a>
      </div>

      {/* Business summary */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
          <i className="ti ti-building-store text-[18px] text-[#085041]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-serif text-[14px] text-[var(--color-text-primary)]">{business.name}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            {CATEGORY_LABELS[business.category] ?? business.category}
            {business.address ? ` · ${business.address}` : ''}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="border-t border-[var(--color-border-tertiary)] pt-3 mb-3">
        {fields.map(f => (
          <div
            key={f.label}
            className="flex items-center justify-between text-[12px] py-1.5 border-b border-[var(--color-border-tertiary)] last:border-none"
          >
            <span className="text-[var(--color-text-secondary)]">{f.label}</span>
            <div className="flex items-center gap-2">
              {f.value ? (
                <span
                  className="truncate max-w-[120px]"
                  style={{ color: f.green ? '#0F6E56' : 'var(--color-text-primary)' }}
                >
                  {f.value}
                </span>
              ) : (
                <span className="text-[var(--color-text-secondary)] italic">Not set</span>
              )}
              <a
                href={f.href}
                className="text-[10px] text-[#0F6E56] hover:underline no-underline flex-shrink-0"
              >
                {f.value ? 'Edit' : 'Add'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Completeness bar */}
      <div className="bg-[var(--color-background-secondary)] rounded-lg p-3">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-[var(--color-text-secondary)]">Profile completeness</span>
          <span
            className="font-medium"
            style={{ color: score >= 80 ? '#0F6E56' : score >= 50 ? '#854F0B' : '#A32D2D' }}
          >
            {score}%
          </span>
        </div>
        <div className="h-1.5 bg-[var(--color-border-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              background: score >= 80 ? '#0F6E56' : score >= 50 ? '#854F0B' : '#A32D2D',
            }}
          />
        </div>
        {missing.length > 0 && (
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
            Add {missing.slice(0, 2).join(' and ')} to rank higher in search
            {missing.length > 2 ? ` (+${missing.length - 2} more)` : ''}.
          </p>
        )}
      </div>

      {/* Public profile link */}
      <a
        href={`/businesses/${business.id}`}
        className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] hover:text-[#0F6E56] mt-3 no-underline transition-colors"
      >
        <i className="ti ti-external-link text-[12px]" aria-hidden="true" />
        Preview public listing
      </a>
    </div>
  )
}
