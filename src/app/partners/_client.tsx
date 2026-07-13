'use client'

import { useState } from 'react'

type Category = { value: string; label: string; desc: string }

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-[var(--color-text-primary)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
    />
  )
}

export default function SupplierRegisterClient({
  categories,
}: {
  categories: Category[]
}) {
  const [companyName,  setCompanyName]  = useState('')
  const [contactName,  setContactName]  = useState('')
  const [email,        setEmail]        = useState('')
  const [phone,        setPhone]        = useState('')
  const [website,      setWebsite]      = useState('')
  const [category,     setCategory]     = useState('')
  const [description,  setDescription]  = useState('')
  const [offerSummary, setOfferSummary] = useState('')
  const [minGroupSize, setMinGroupSize] = useState('8')
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [error,        setError]        = useState('')

  async function handleSubmit() {
    if (!companyName || !contactName || !email || !category || !description || !offerSummary) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/suppliers/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          companyName, contactName, email, phone, website,
          category, description, offerSummary,
          minGroupSize: parseInt(minGroupSize) || 8,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Registration failed')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#E1F5EE] border-2 border-[#5DCAA5] flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-circle-check text-[28px] text-[#0F6E56]" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-[20px] mb-3">Application received</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-4 max-w-[340px] mx-auto">
          Thanks for registering, {contactName.split(' ')[0]}. We'll review your application and be in touch within 2 working days.
        </p>
        <div className="bg-[var(--color-background-secondary)] rounded-xl px-4 py-3 text-left">
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
            <i className="ti ti-bell text-[13px] text-[#0F6E56] mr-1.5" aria-hidden="true" />
            Once approved, you'll be automatically notified when demand in your category reaches your minimum group size of <strong>{minGroupSize} businesses</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-6">

      <div className="grid grid-cols-2 gap-3 mb-1">
        <Field label="Company name *">
          <Input value={companyName} onChange={setCompanyName} placeholder="Acme Energy Ltd" />
        </Field>
        <Field label="Your name *">
          <Input value={contactName} onChange={setContactName} placeholder="Jane Smith" />
        </Field>
        <Field label="Email address *">
          <Input value={email} onChange={setEmail} type="email" placeholder="jane@acme.co.uk" />
        </Field>
        <Field label="Phone number">
          <Input value={phone} onChange={setPhone} type="tel" placeholder="07700 000000" />
        </Field>
      </div>

      <Field label="Website">
        <Input value={website} onChange={setWebsite} placeholder="https://acme.co.uk" />
      </Field>

      <Field label="Category *" hint="Which type of product or service are you offering?">
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`text-left px-3 py-2.5 border rounded-lg cursor-pointer font-sans transition-all ${
                category === cat.value
                  ? 'border-[#5DCAA5] bg-[#E1F5EE]'
                  : 'border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] hover:border-[#5DCAA5]'
              }`}
            >
              <p className={`text-[12px] font-medium ${category === cat.value ? 'text-[#085041]' : 'text-[var(--color-text-primary)]'}`}>
                {cat.label}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="What are you offering? *"
        hint="Describe your product or service for UK independent high street businesses"
      >
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. We're a commercial energy broker specialising in small business switching. We negotiate directly with all major UK suppliers and handle the switching process end to end..."
          rows={3}
          className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none font-sans leading-relaxed"
        />
      </Field>

      <Field
        label="Your group offer summary *"
        hint="This is what businesses see. Be specific about the saving."
      >
        <Input
          value={offerSummary}
          onChange={setOfferSummary}
          placeholder='e.g. "Average saving of £600/year vs standard tariff for groups of 8+ businesses"'
        />
      </Field>

      <Field
        label="Minimum group size"
        hint="We'll notify you when this many businesses in a town are interested"
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="3"
            max="30"
            value={minGroupSize}
            onChange={e => setMinGroupSize(e.target.value)}
            className="flex-1"
          />
          <span className="text-[14px] font-medium text-[var(--color-text-primary)] w-16 text-right">
            {minGroupSize} businesses
          </span>
        </div>
      </Field>

      {error && (
        <p className="text-[12px] text-red-600 mb-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-xl text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center justify-center gap-2"
      >
        {submitting ? (
          <><i className="ti ti-loader-2 animate-spin text-[15px]" aria-hidden="true" />Submitting…</>
        ) : (
          <><i className="ti ti-send text-[15px]" aria-hidden="true" />Submit application</>
        )}
      </button>

      <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-3">
        Free to register · No commission until a deal completes · Cancel any time
      </p>
    </div>
  )
}
