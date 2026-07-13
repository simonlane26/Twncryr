'use client'

import { useState, useRef } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Storefront, Phone, Globe, MapPin, Lock, Envelope, CheckCircle, Check } from '@phosphor-icons/react'
import { StepHeader } from './OnboardingNav'
import type { OnboardingState } from './types'

function PrimaryBtn({ children, onClick, disabled, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full bg-[#0F6E56] disabled:opacity-60 hover:bg-[#085041] text-[#E1F5EE] border-none py-3 rounded-lg text-[14px] font-medium cursor-pointer transition-colors mb-2"
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)] py-3 rounded-lg text-[13px] cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors"
    >
      {children}
    </button>
  )
}

function FieldInput({ label, type = 'text', placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string; value?: string; onChange?: (v: string) => void
}) {
  return (
    <div className="mb-3">
      <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        className="w-full text-[14px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
      />
    </div>
  )
}

// ─── Step 2: Confirm ───

export function StepConfirm({ state, onConfirm, onBack }: {
  state: OnboardingState; onConfirm: () => void; onBack: () => void
}) {
  return (
    <div>
      <StepHeader eyebrow="Step 2 of 6" title="Is this your business?" subtitle="Confirm this is the listing you'd like to claim and manage." step={1} totalSteps={6} />
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
            <Storefront size={22} className="text-[#085041]" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-fraunces)] text-[16px] text-[var(--color-text-primary)]">{state.businessName}</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">{state.businessAddress}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)] flex flex-col gap-2">
          {state.businessPhone && (
            <div className="flex items-center gap-2 text-[13px]">
              <Phone size={14} className="text-[var(--color-text-secondary)]" />
              <span>{state.businessPhone}</span>
            </div>
          )}
          {state.businessWebsite && (
            <div className="flex items-center gap-2 text-[13px]">
              <Globe size={14} className="text-[var(--color-text-secondary)]" />
              <span className="text-[#0F6E56]">{state.businessWebsite}</span>
            </div>
          )}
          {state.businessAddress && (
            <div className="flex items-center gap-2 text-[13px]">
              <MapPin size={14} className="text-[var(--color-text-secondary)]" />
              <span>{state.businessAddress}</span>
            </div>
          )}
        </div>
      </div>
      <PrimaryBtn onClick={onConfirm}>Yes, this is my business</PrimaryBtn>
      <SecondaryBtn onClick={onBack}>Search again</SecondaryBtn>
    </div>
  )
}

// ─── Step 3: Auth ───

export function StepAuth({ onSuccess }: { state: OnboardingState; onSuccess: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clerkSignUp = useSignUp() as any
  const isLoaded: boolean = clerkSignUp.isLoaded
  const signUp = clerkSignUp.signUp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!isLoaded || !email || !password) return
    setLoading(true); setError('')
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      onSuccess()
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <StepHeader eyebrow="Step 3 of 6" title="Create your account" subtitle="Sign in or create an account to manage your listing. Always free." step={2} totalSteps={6} />
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-4">
        <p className="text-[11px] text-[var(--color-text-secondary)] text-center mb-4 flex items-center justify-center gap-1.5">
          <Lock size={13} /> Secured by Clerk
        </p>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--color-border-secondary)] rounded-lg text-[13px] hover:bg-[var(--color-background-secondary)] transition-colors mb-3 bg-[var(--color-background-primary)] text-[var(--color-text-primary)] cursor-pointer"
          onClick={onSuccess}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-2 my-3 text-[12px] text-[var(--color-text-secondary)]">
          <div className="flex-1 h-px bg-[var(--color-border-tertiary)]" /> or email <div className="flex-1 h-px bg-[var(--color-border-tertiary)]" />
        </div>
        <FieldInput label="Email address" type="email" placeholder="you@yourbusiness.co.uk" value={email} onChange={setEmail} />
        <FieldInput label="Password" type="password" placeholder="Create a password" value={password} onChange={setPassword} />
        {error && <p className="text-[12px] text-[var(--color-text-danger)] mb-3">{error}</p>}
        <button onClick={handleCreate} disabled={loading || !email || !password}
          className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors border-none"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-[12px] text-[var(--color-text-secondary)] mt-3">
          Already have an account?{' '}
          <button className="text-[#0F6E56] hover:underline bg-transparent border-none cursor-pointer text-[12px]" onClick={onSuccess}>Sign in</button>
        </p>
      </div>
    </div>
  )
}

// ─── Step 4: Verify ───

export function StepVerify({ state, onVerified }: { state: OnboardingState; onVerified: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signUp = (useSignUp() as any).signUp
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleDigit(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...code]; next[i] = val; setCode(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) verifyCode(next.join(''))
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  async function verifyCode(fullCode: string) {
    if (!signUp) return
    setLoading(true); setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: fullCode })
      if (result.status === 'complete') {
        if (state.businessId) {
          await fetch('/api/onboarding/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId: state.businessId }),
          })
        }
        onVerified()
      }
    } catch {
      setError('Invalid code. Please check and try again.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <StepHeader eyebrow="Step 4 of 6" title="Verify ownership" subtitle="We've sent a 6-digit code to confirm you're authorised to manage this listing." step={3} totalSteps={6} />
      <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-5 text-center">
        <Envelope size={28} className="text-[#0F6E56] mx-auto mb-2" />
        <p className="text-[12px] text-[var(--color-text-secondary)]">Code sent to your email</p>
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-3">Enter the 6-digit code</p>
        <div className="flex gap-2 justify-center mb-3">
          {code.map((digit, i) => (
            <input key={i} ref={el => { inputs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
              value={digit} onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              className="w-11 h-14 border border-[var(--color-border-secondary)] rounded-lg text-[22px] font-medium text-center bg-[var(--color-background-primary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors"
            />
          ))}
        </div>
        {error && <p className="text-[12px] text-[var(--color-text-danger)] mb-2">{error}</p>}
        <button className="text-[12px] text-[#0F6E56] hover:underline bg-transparent border-none cursor-pointer">
          Didn&apos;t receive it? Resend code
        </button>
      </div>
      <PrimaryBtn onClick={() => verifyCode(code.join(''))} disabled={code.join('').length < 6 || loading}>
        {loading ? 'Verifying…' : 'Verify & continue'}
      </PrimaryBtn>
    </div>
  )
}

// ─── Step 5: Profile ───

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function StepProfile({ state, onSaved }: { state: OnboardingState; onSaved: () => void }) {
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState(state.businessPhone ?? '')
  const [website, setWebsite] = useState(state.businessWebsite ?? '')
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    Object.fromEntries(DAYS.map(d => [d.toLowerCase(), { open: '09:00', close: '17:00', closed: d === 'Sun' }]))
  )

  async function handleSave() {
    if (!state.businessId) { onSaved(); return }
    setSaving(true)
    try {
      await fetch(`/api/businesses/${state.businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, phone, website, openingHours: hours }),
      })
    } finally {
      setSaving(false); onSaved()
    }
  }

  return (
    <div>
      <StepHeader eyebrow="Step 5 of 6" title="Complete your profile" subtitle="A complete profile gets 3× more views. Takes about 2 minutes — you can edit any time." step={4} totalSteps={6} />
      <div className="flex flex-col gap-4 mb-5">
        <div>
          <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">Business description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Tell locals what makes you special — your food, your story, what they can expect…"
            rows={3} className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldInput label="Phone number" type="tel" value={phone} onChange={setPhone} />
          <FieldInput label="Website" value={website} onChange={setWebsite} />
        </div>
        <div>
          <label className="block text-[12px] text-[var(--color-text-secondary)] mb-2">Opening hours</label>
          <div className="flex flex-col gap-1.5">
            {DAYS.map(day => {
              const key = day.toLowerCase()
              const h = hours[key]
              return (
                <div key={day} className="flex items-center gap-2 text-[12px]">
                  <span className="w-8 text-[var(--color-text-secondary)]">{day}</span>
                  {h.closed ? (
                    <span className="flex-1 text-[var(--color-text-secondary)] text-[11px]">Closed</span>
                  ) : (
                    <>
                      <input type="text" value={h.open} onChange={e => setHours(prev => ({ ...prev, [key]: { ...h, open: e.target.value } }))}
                        className="flex-1 text-center text-[12px] px-2 py-1.5 border border-[var(--color-border-tertiary)] rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
                      />
                      <span className="text-[var(--color-text-secondary)]">–</span>
                      <input type="text" value={h.close} onChange={e => setHours(prev => ({ ...prev, [key]: { ...h, close: e.target.value } }))}
                        className="flex-1 text-center text-[12px] px-2 py-1.5 border border-[var(--color-border-tertiary)] rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
                      />
                    </>
                  )}
                  <button onClick={() => setHours(prev => ({ ...prev, [key]: { ...h, closed: !h.closed } }))}
                    className="text-[10px] text-[#0F6E56] hover:underline w-10 text-right bg-transparent border-none cursor-pointer"
                  >
                    {h.closed ? 'Open' : 'Close'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <PrimaryBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save & continue'}</PrimaryBtn>
      <button onClick={onSaved} className="w-full text-center text-[12px] text-[var(--color-text-secondary)] hover:text-[#0F6E56] transition-colors mt-2 cursor-pointer bg-transparent border-none">
        Skip for now, I'll do this later
      </button>
    </div>
  )
}

// ─── Step 6: Success ───

export function StepSuccess({ state }: { state: OnboardingState }) {
  const router = useRouter()

  return (
    <div className="text-center py-2">
      <div className="w-[72px] h-[72px] rounded-full bg-[#E1F5EE] border-2 border-[#5DCAA5] flex items-center justify-center mx-auto mb-5">
        <Check size={32} className="text-[#0F6E56]" />
      </div>
      <p className="text-[10px] font-medium tracking-[1.6px] uppercase text-[#0F6E56] mb-2">You&apos;re live</p>
      <h1 className="font-[family-name:var(--font-fraunces)] text-[26px] font-semibold mb-3">Welcome to TwnCryr</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-sm mx-auto">
        {state.businessName} is now live. Locals can find you, and you can start posting deals and last-minute tables right now.
      </p>
      <div className="bg-[var(--color-background-secondary)] rounded-xl p-4 mb-6 text-left">
        {[
          'Listing claimed and verified',
          'Profile visible to locals',
          'Access to business community forum',
          'Post unlimited deals and table alerts',
        ].map(item => (
          <div key={item} className="flex items-center gap-2.5 py-1.5 text-[13px] text-[var(--color-text-primary)]">
            <CheckCircle size={16} className="text-[#0F6E56]" />
            {item}
          </div>
        ))}
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="w-full bg-[#0F6E56] text-[#E1F5EE] py-3 rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors mb-4 border-none"
      >
        Go to my dashboard →
      </button>
      <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
        <strong>Pro tip:</strong> restaurants that post a last-minute table within an hour of it becoming available get <strong>3× more enquiries</strong>.
      </p>
    </div>
  )
}
