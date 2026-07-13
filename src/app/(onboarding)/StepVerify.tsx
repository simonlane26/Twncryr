'use client'

import { useState } from 'react'
import { StepHeader } from './OnboardingNav'
import type { OnboardingState } from './types'

export function StepVerify({
  state,
  onVerified,
}: {
  state: OnboardingState
  onVerified: () => void
}) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('')
  const [phone, setPhone]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: state.businessId,
          businessName: state.businessName,
          claimantName: name.trim(),
          claimantEmail: email.trim(),
          claimantRole: role.trim(),
          claimantPhone: phone.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // â”€â”€ Submitted state â€” waiting for approval â”€â”€
  if (submitted) {
    return (
      <div>
        <StepHeader
          eyebrow="Step 4 of 6"
          title="Request submitted"
          subtitle="We'll review your claim and get back to you shortly."
          step={3}
          totalSteps={6}
        />

        <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl p-5 mb-5 text-center">
          <i className="ti ti-clock text-[32px] text-[#0F6E56] block mb-3" aria-hidden="true" />
          <h2 className="font-serif text-[18px] text-[var(--color-text-primary)] mb-2">
            We're on it
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            Your claim for <strong>{state.businessName}</strong> is under review.
            We typically approve claims within a few hours â€” we'll email{' '}
            <strong>{email}</strong> as soon as you're approved.
          </p>
        </div>

        <div className="bg-[var(--color-background-secondary)] rounded-xl p-4 mb-5">
          {[
            'Your listing is already visible on Twncryr',
            'You\'ll get an email the moment we approve your claim',
            'Dashboard access unlocks on approval',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5 py-1.5 text-[13px] text-[var(--color-text-secondary)]">
              <i className="ti ti-circle-check text-[14px] text-[#0F6E56] flex-shrink-0" aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={onVerified}
          className="w-full bg-[#0F6E56] text-[#E1F5EE] border-none py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors"
        >
          Continue â†’
        </button>
      </div>
    )
  }

  // â”€â”€ Form state â”€â”€
  return (
    <div>
      <StepHeader
        eyebrow="Step 4 of 6"
        title="Confirm your details"
        subtitle="Tell us a bit about yourself so we can verify you're authorised to manage this listing. We typically approve within a few hours."
        step={3}
        totalSteps={6}
      />

      {/* Business being claimed */}
      <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <i className="ti ti-building-store text-[18px] text-[#0F6E56]" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
            {state.businessName}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            {state.businessAddress}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <Field
          label="Your full name *"
          value={name}
          onChange={setName}
          placeholder="Jane Smith"
        />
        <Field
          label="Your email address *"
          value={email}
          onChange={e => { setEmail(e); setError('') }}
          type="email"
          placeholder="jane@yourbusiness.co.uk"
          hint="We'll send your approval confirmation here"
        />
        <Field
          label="Your role at the business"
          value={role}
          onChange={setRole}
          placeholder="Owner, Manager, Directorâ€¦"
        />
        <Field
          label="Your phone number (optional)"
          value={phone}
          onChange={setPhone}
          type="tel"
          placeholder="07700 000000"
          hint="Helps us reach you quickly if we have a question"
        />
      </div>

      {error && (
        <p className="text-[12px] text-[var(--color-text-danger)] mb-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !name.trim() || !email.trim()}
        className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors"
      >
        {submitting ? 'Submittingâ€¦' : 'Submit claim request'}
      </button>

      <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-3 leading-relaxed">
        We'll never share your personal details. By submitting you confirm you're
        authorised to manage this listing.
      </p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[14px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
      />
      {hint && (
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{hint}</p>
      )}
    </div>
  )
}

