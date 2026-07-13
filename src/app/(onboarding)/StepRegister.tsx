'use client'

import { useState } from 'react'
import { StepHeader } from './OnboardingNav'
import type { OnboardingState } from './types'

const CATEGORY_OPTIONS = [
  { value: 'FOOD_DRINK',    label: 'Food & drink' },
  { value: 'RETAIL',        label: 'Retail' },
  { value: 'HEALTH_BEAUTY', label: 'Health & beauty' },
  { value: 'SERVICES',      label: 'Services' },
  { value: 'ARTS_CULTURE',  label: 'Arts & culture' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'FITNESS',       label: 'Fitness' },
  { value: 'EDUCATION',     label: 'Education' },
  { value: 'OTHER',         label: 'Other' },
]

function Field({
  label, value, onChange, type = 'text', placeholder, hint, required,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; hint?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
        {label}{required && <span className="text-[#C8342B] ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[14px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
      />
      {hint && <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{hint}</p>}
    </div>
  )
}

// ─── Step 1: Business details ───

export function StepRegisterDetails({
  state,
  onNext,
}: {
  state: OnboardingState
  onNext: (data: Partial<OnboardingState>) => void
}) {
  const [name, setName]               = useState(state.businessName)
  const [category, setCategory]       = useState(state.businessCategory ?? '')
  const [address, setAddress]         = useState(state.businessAddress ?? '')
  const [postcode, setPostcode]       = useState(state.businessPostcode ?? '')
  const [phone, setPhone]             = useState(state.businessPhone ?? '')
  const [website, setWebsite]         = useState(state.businessWebsite ?? '')
  const [description, setDescription] = useState(state.businessDescription ?? '')
  const [error, setError]             = useState('')

  function handleNext() {
    if (!name.trim() || !category || !address.trim()) {
      setError('Please fill in your business name, category, and address.')
      return
    }
    setError('')
    onNext({
      businessName: name.trim(),
      businessCategory: category,
      businessAddress: address.trim(),
      businessPostcode: postcode.trim() || null,
      businessPhone: phone.trim() || null,
      businessWebsite: website.trim() || null,
      businessDescription: description.trim() || null,
    })
  }

  return (
    <div>
      <StepHeader
        eyebrow="Step 1 of 4"
        title="Tell us about your business"
        subtitle="Fill in your details — you can update everything from your dashboard after approval."
        step={0}
        totalSteps={4}
      />

      <div className="flex flex-col gap-3 mb-5">
        <Field label="Business name" value={name} onChange={setName} placeholder="e.g. The Crown Inn" required />

        <div>
          <label htmlFor="biz-category" className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
            Category<span className="text-[#C8342B] ml-0.5">*</span>
          </label>
          <select
            id="biz-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full text-[14px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
          >
            <option value="">Select a category…</option>
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <Field label="Street address" value={address} onChange={setAddress} placeholder="12 High Street, Nantwich" required />
        <Field label="Postcode" value={postcode} onChange={setPostcode} placeholder="CW5 5AS" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="01270 000000" />
          <Field label="Website" value={website} onChange={setWebsite} placeholder="www.yourbusiness.co.uk" />
        </div>

        <div>
          <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
            Brief description <span className="text-[var(--color-text-secondary)] font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell locals what makes you special…"
            rows={3}
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-[#C8342B] mb-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleNext}
        className="w-full bg-[#0F6E56] text-[#E1F5EE] border-none py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors"
      >
        Continue →
      </button>
    </div>
  )
}

// ─── Step 3: Contact details + submit ───

export function StepRegisterContact({
  state,
  onSubmitted,
}: {
  state: OnboardingState
  onSubmitted: () => void
}) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  function getTownSlug() {
    if (typeof window === 'undefined') return 'nantwich'
    const host = window.location.hostname
    if (host.includes('localhost')) return 'nantwich'
    const parts = host.split('.')
    return parts.length >= 4 ? parts[0] : 'nantwich'
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName:        state.businessName,
          businessCategory:    state.businessCategory,
          businessAddress:     state.businessAddress,
          businessPostcode:    state.businessPostcode,
          businessPhone:       state.businessPhone,
          businessWebsite:     state.businessWebsite,
          businessDescription: state.businessDescription,
          townSlug:            getTownSlug(),
          claimantName:        name.trim(),
          claimantEmail:       email.trim(),
          claimantRole:        role.trim(),
          claimantPhone:       phone.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }
      onSubmitted()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <StepHeader
        eyebrow="Step 3 of 4"
        title="Your contact details"
        subtitle="Tell us who you are so we can verify and approve your registration."
        step={2}
        totalSteps={4}
      />

      <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <i className="ti ti-building-store text-[18px] text-[#0F6E56]" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{state.businessName}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">{state.businessAddress}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <Field label="Your full name" value={name} onChange={setName} placeholder="Jane Smith" required />
        <Field
          label="Your email address" value={email} onChange={e => { setEmail(e); setError('') }}
          type="email" placeholder="jane@yourbusiness.co.uk"
          hint="We'll send your approval confirmation here"
          required
        />
        <Field label="Your role at the business" value={role} onChange={setRole} placeholder="Owner, Manager, Director…" />
        <Field
          label="Your phone number" value={phone} onChange={setPhone}
          type="tel" placeholder="07700 000000"
          hint="Helps us reach you quickly if we have a question"
        />
      </div>

      {error && (
        <p className="text-[12px] text-[#C8342B] mb-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !name.trim() || !email.trim()}
        className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit registration'}
      </button>

      <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-3 leading-relaxed">
        We'll review your registration and aim to approve within a few hours.
      </p>
    </div>
  )
}

// ─── Step 4: Pending approval ───

export function StepRegisterPending({ state }: { state: OnboardingState }) {
  return (
    <div className="text-center py-2">
      <div className="w-[72px] h-[72px] rounded-full bg-[#E1F5EE] border-2 border-[#5DCAA5] flex items-center justify-center mx-auto mb-5">
        <i className="ti ti-clock text-[32px] text-[#0F6E56]" aria-hidden="true" />
      </div>
      <p className="text-[10px] font-medium tracking-[1.6px] uppercase text-[#0F6E56] mb-2">Registration received</p>
      <h1 className="font-serif text-[26px] font-semibold mb-3">We're reviewing your listing</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-sm mx-auto">
        We've received your registration for <strong>{state.businessName}</strong>. We typically approve within a few hours and will email you as soon as you're live.
      </p>
      <div className="bg-[var(--color-background-secondary)] rounded-xl p-4 mb-6 text-left">
        {[
          'Your listing will appear on Twncryr once approved',
          "You'll get a confirmation email when you're live",
          'Dashboard access unlocks on approval',
          'Locals can start finding and enquiring about you immediately',
        ].map(item => (
          <div key={item} className="flex items-center gap-2.5 py-1.5 text-[13px] text-[var(--color-text-secondary)]">
            <i className="ti ti-circle-check text-[14px] text-[#0F6E56] flex-shrink-0" aria-hidden="true" />
            {item}
          </div>
        ))}
      </div>
      <a
        href="/"
        className="block w-full bg-[#0F6E56] text-[#E1F5EE] py-3 rounded-lg text-[14px] font-medium no-underline hover:bg-[#085041] transition-colors mb-3"
      >
        Back to the high street
      </a>
    </div>
  )
}
