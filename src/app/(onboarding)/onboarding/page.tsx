'use client'

import { useState } from 'react'
import OnboardingNav, { OnboardingProgress } from '../OnboardingNav'
import StepFindBusiness from '../StepFindBusiness'
import { StepConfirm, StepAuth, StepProfile, StepSuccess } from '../StepConfirm'
import { StepVerify } from '../StepVerify'
import { StepRegisterDetails, StepRegisterContact, StepRegisterPending } from '../StepRegister'
import type { OnboardingState } from '../types'

export type { OnboardingState }

type Mode = 'choose' | 'claim' | 'register'

const CLAIM_STEPS    = 6
const REGISTER_STEPS = 4

const INITIAL_STATE: OnboardingState = {
  businessId:          null,
  businessName:        '',
  businessSlug:        null,
  businessCategory:    null,
  businessAddress:     null,
  businessPostcode:    null,
  businessPhone:       null,
  businessWebsite:     null,
  businessEmail:       null,
  businessDescription: null,
}

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE)

  const totalSteps = mode === 'register' ? REGISTER_STEPS : CLAIM_STEPS

  function next() { setStep(s => s + 1) }

  function back() {
    if (step === 0) {
      setMode('choose')
      setState(INITIAL_STATE)
    } else {
      setStep(s => s - 1)
    }
  }

  function chooseMode(m: 'claim' | 'register') {
    setMode(m)
    setStep(0)
    setState(INITIAL_STATE)
  }

  // ── Choose path ──────────────────────────────────
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-[var(--color-background-tertiary)]">
        <OnboardingNav step={-1} totalSteps={1} onBack={() => { window.location.href = '/' }} />
        <div className="flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-md bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-7">
              <p className="text-[10px] font-medium tracking-[1.6px] uppercase text-[#0F6E56] mb-2">Get started free</p>
              <h1 className="font-serif text-[26px] font-semibold mb-2">Join Twncryr</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                Are you already listed? Find and claim your existing listing, or register your business from scratch.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => chooseMode('claim')}
                className="flex items-center gap-4 text-left w-full bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] hover:border-[#5DCAA5] hover:bg-[#E1F5EE] rounded-xl p-4 transition-all group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <i className="ti ti-search text-[20px] text-[#0F6E56]" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)]">Find & claim my listing</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">Search for your existing business and claim it</p>
                </div>
                <i className="ti ti-arrow-right text-[16px] text-[var(--color-text-secondary)] group-hover:text-[#0F6E56] transition-colors" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => chooseMode('register')}
                className="flex items-center gap-4 text-left w-full bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] hover:border-[#5DCAA5] hover:bg-[#E1F5EE] rounded-xl p-4 transition-all group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E6F1FB] group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <i className="ti ti-building-plus text-[20px] text-[#185FA5]" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)]">Register a new business</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">Not listed yet? Add your business to Twncryr</p>
                </div>
                <i className="ti ti-arrow-right text-[16px] text-[var(--color-text-secondary)] group-hover:text-[#0F6E56] transition-colors" aria-hidden="true" />
              </button>
            </div>

            <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-5">
              Always free · Approved within hours · No card required
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Claim / Register flows ────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)]">
      <OnboardingNav step={step} totalSteps={totalSteps} onBack={back} />
      <OnboardingProgress step={step} totalSteps={totalSteps} />

      <div className="flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-6 shadow-sm">

          {/* ── CLAIM FLOW ── */}
          {mode === 'claim' && (
            <>
              {step === 0 && (
                <StepFindBusiness
                  onSelect={biz => { setState(s => ({ ...s, ...biz })); next() }}
                />
              )}
              {step === 1 && (
                <StepConfirm state={state} onConfirm={next} onBack={back} />
              )}
              {step === 2 && (
                <StepAuth state={state} onSuccess={next} />
              )}
              {step === 3 && (
                <StepVerify state={state} onVerified={next} />
              )}
              {step === 4 && (
                <StepProfile state={state} onSaved={next} />
              )}
              {step === 5 && (
                <StepSuccess state={state} />
              )}
            </>
          )}

          {/* ── REGISTER FLOW ── */}
          {mode === 'register' && (
            <>
              {step === 0 && (
                <StepRegisterDetails
                  state={state}
                  onNext={data => { setState(s => ({ ...s, ...data })); next() }}
                />
              )}
              {step === 1 && (
                <StepAuth state={state} onSuccess={next} />
              )}
              {step === 2 && (
                <StepRegisterContact state={state} onSubmitted={next} />
              )}
              {step === 3 && (
                <StepRegisterPending state={state} />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
