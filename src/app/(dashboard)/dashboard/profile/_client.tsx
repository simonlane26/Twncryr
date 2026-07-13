'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PhotoUploader, { LogoUploader } from '@/components/upload/PhotoUploader'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type BusinessProfile = {
  id: string
  name: string
  slug: string
  category: string
  tagline: string | null
  description: string | null
  address: string | null
  postcode: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo: string | null
  photos: string[]
  openingHours: Record<string, { open: string; close: string; closed: boolean }> | null
}

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const DEFAULT_HOURS = { open: '09:00', close: '17:00', closed: false }

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-4">
      <div className="mb-4">
        <h2 className="text-[14px] font-medium text-[var(--color-text-primary)]">{title}</h2>
        {subtitle && (
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// Field components
// ─────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{hint}</p>
      )}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
    />
  )
}

// ─────────────────────────────────────────────
// Save button with state
// ─────────────────────────────────────────────

function SaveButton({
  onClick,
  saving,
  saved,
}: {
  onClick: () => void
  saving: boolean
  saved: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center gap-2"
    >
      {saving ? (
        <><i className="ti ti-loader-2 animate-spin text-[14px]" aria-hidden="true" /> Saving…</>
      ) : saved ? (
        <><i className="ti ti-circle-check text-[14px]" aria-hidden="true" /> Saved</>
      ) : (
        'Save changes'
      )}
    </button>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function ProfileEditClient({
  business,
}: {
  business: BusinessProfile
}) {
  const router = useRouter()

  // ── Form state ──
  const [name,        setName]        = useState(business.name)
  const [tagline,     setTagline]     = useState(business.tagline ?? '')
  const [description, setDescription] = useState(business.description ?? '')
  const [address,     setAddress]     = useState(business.address ?? '')
  const [postcode,    setPostcode]    = useState(business.postcode ?? '')
  const [phone,       setPhone]       = useState(business.phone ?? '')
  const [email,       setEmail]       = useState(business.email ?? '')
  const [website,     setWebsite]     = useState(business.website ?? '')
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    business.openingHours ?? Object.fromEntries(DAYS.map(d => [d.key, { ...DEFAULT_HOURS }]))
  )

  // ── Save states — one per section ──
  const [savingDetails, setSavingDetails]   = useState(false)
  const [savedDetails,  setSavedDetails]    = useState(false)
  const [savingHours,   setSavingHours]     = useState(false)
  const [savedHours,    setSavedHours]      = useState(false)
  const [error,         setError]           = useState('')

  // ─────────────────────────────────────────
  // Save handlers
  // ─────────────────────────────────────────

  async function saveDetails() {
    setSavingDetails(true)
    setError('')
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          address: address.trim() || null,
          postcode: postcode.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          website: website.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSavedDetails(true)
      setTimeout(() => setSavedDetails(false), 3000)
      router.refresh()
    } catch {
      setError('Failed to save details. Please try again.')
    } finally {
      setSavingDetails(false)
    }
  }

  async function saveHours() {
    setSavingHours(true)
    setError('')
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingHours: hours }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSavedHours(true)
      setTimeout(() => setSavedHours(false), 3000)
      router.refresh()
    } catch {
      setError('Failed to save hours. Please try again.')
    } finally {
      setSavingHours(false)
    }
  }

  function updateHours(
    day: string,
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day] ?? DEFAULT_HOURS, [field]: value },
    }))
  }

  // ─────────────────────────────────────────
  // Completeness calculation
  // ─────────────────────────────────────────

  const filled = [name, description, phone, website, address, business.photos.length > 0].filter(Boolean).length
  const pct    = Math.round((filled / 6) * 100)

  return (
    <div>
      {/* Completeness banner */}
      {pct < 100 && (
        <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[12px] mb-1.5">
              <span className="text-[var(--color-text-secondary)]">Profile completeness</span>
              <span
                className="font-medium"
                style={{ color: pct >= 80 ? '#0F6E56' : pct >= 50 ? '#854F0B' : '#A32D2D' }}
              >
                {pct}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--color-border-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct >= 80 ? '#0F6E56' : pct >= 50 ? '#854F0B' : '#A32D2D',
                }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] max-w-[200px] leading-relaxed">
            Complete listings get 3× more views from locals.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-[13px] text-red-700">
          <i className="ti ti-alert-circle text-[15px]" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* ── Section 1: Photos ── */}
      <Section
        title="Photos"
        subtitle="Show locals what your place looks like. The first photo appears in search results."
      >
        <div className="mb-4">
          <p className="text-[12px] font-medium text-[var(--color-text-primary)] mb-2">Logo</p>
          <LogoUploader currentLogo={business.logo} businessName={business.name} />
        </div>
        <div className="border-t border-[var(--color-border-tertiary)] pt-4">
          <p className="text-[12px] font-medium text-[var(--color-text-primary)] mb-2">Venue photos</p>
          <PhotoUploader initialPhotos={business.photos} businessId={business.id} />
        </div>
      </Section>

      {/* ── Section 2: Business details ── */}
      <Section
        title="Business details"
        subtitle="Basic information shown on your public listing."
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business name">
            <Input value={name} onChange={setName} placeholder="The Millstone Kitchen" />
          </Field>
          <Field label="Tagline" hint="One short line shown under your name in search results">
            <Input value={tagline} onChange={setTagline} placeholder="Modern British cuisine in the heart of Nantwich" />
          </Field>
        </div>

        <Field label="Description" hint="Tell locals what makes you special. Aim for 2-3 sentences.">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Modern British cuisine using the best of Cheshire's local produce, served in a relaxed setting…"
            rows={4}
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none font-sans leading-relaxed"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-[11px] ${description.length > 900 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'}`}>
              {description.length}/1000
            </span>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Street address">
            <Input value={address} onChange={setAddress} placeholder="Hospital Street, Nantwich" />
          </Field>
          <Field label="Postcode">
            <Input value={postcode} onChange={setPostcode} placeholder="CW5 5RP" />
          </Field>
          <Field label="Phone number">
            <Input value={phone} onChange={setPhone} type="tel" placeholder="01270 610083" />
          </Field>
          <Field label="Email address" hint="Not shown publicly — used for enquiry notifications">
            <Input value={email} onChange={setEmail} type="email" placeholder="hello@yourbusiness.co.uk" />
          </Field>
          <Field label="Website" hint="Include https://">
            <Input value={website} onChange={setWebsite} placeholder="https://millstonekitchen.co.uk" />
          </Field>
        </div>

        <SaveButton onClick={saveDetails} saving={savingDetails} saved={savedDetails} />
      </Section>

      {/* ── Section 3: Opening hours ── */}
      <Section
        title="Opening hours"
        subtitle="Shown on your listing and used to display your open/closed status in real time."
      >
        <div className="flex flex-col gap-1">
          {DAYS.map(({ key, label }) => {
            const h = hours[key] ?? { ...DEFAULT_HOURS }
            return (
              <div
                key={key}
                className="flex items-center gap-3 py-2 border-b border-[var(--color-border-tertiary)] last:border-none"
              >
                {/* Day label */}
                <span className="text-[13px] text-[var(--color-text-secondary)] w-24 flex-shrink-0">
                  {label}
                </span>

                {h.closed ? (
                  <span className="flex-1 text-[13px] text-[var(--color-text-secondary)] italic">
                    Closed
                  </span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.open}
                      onChange={e => updateHours(key, 'open', e.target.value)}
                      className="text-[13px] px-2.5 py-1.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans w-28"
                    />
                    <span className="text-[12px] text-[var(--color-text-secondary)]">to</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={e => updateHours(key, 'close', e.target.value)}
                      className="text-[13px] px-2.5 py-1.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans w-28"
                    />
                  </div>
                )}

                {/* Toggle closed */}
                <button
                  onClick={() => updateHours(key, 'closed', !h.closed)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer font-sans transition-colors flex-shrink-0 ${
                    h.closed
                      ? 'bg-[var(--color-background-secondary)] border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5] hover:text-[#085041]'
                      : 'bg-[var(--color-background-secondary)] border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {h.closed ? 'Set open' : 'Set closed'}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <SaveButton onClick={saveHours} saving={savingHours} saved={savedHours} />
        </div>
      </Section>
    </div>
  )
}
