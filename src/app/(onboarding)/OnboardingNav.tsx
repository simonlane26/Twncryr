'use client'

import Image from 'next/image'
import { ArrowLeft } from '@phosphor-icons/react'

export default function OnboardingNav({
  step,
  onBack,
}: {
  step: number
  totalSteps: number
  onBack: () => void
}) {
  return (
    <nav className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 h-[52px] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Image src="/Logo.png" alt="TwnCryr" width={24} height={24} className="rounded" />
        <span className="font-[family-name:var(--font-fraunces)] text-[17px]">
          Twn<em className="not-italic text-[#0F6E56]">cryr</em>
        </span>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={15} />
        {step === 0 ? 'Back to site' : 'Back'}
      </button>
    </nav>
  )
}

export function OnboardingProgress({
  step,
  totalSteps,
}: {
  step: number
  totalSteps: number
}) {
  const pct = Math.round(((step + 1) / totalSteps) * 100)
  return (
    <div className="h-[3px] bg-[var(--color-border-tertiary)]">
      <div
        className="h-full bg-[#0F6E56] transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function StepHeader({
  eyebrow,
  title,
  subtitle,
  step,
  totalSteps,
}: {
  eyebrow: string
  title: string
  subtitle: string
  step: number
  totalSteps: number
}) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5 mb-5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] w-6 rounded-full transition-all duration-300"
            style={{
              background:
                i < step ? '#9FE1CB' : i === step ? '#0F6E56' : 'var(--color-border-tertiary)',
            }}
          />
        ))}
      </div>
      <p className="text-[10px] font-medium tracking-[1.6px] uppercase text-[#0F6E56] mb-2">{eyebrow}</p>
      <h1 className="font-[family-name:var(--font-fraunces)] text-[26px] font-semibold leading-tight mb-2">{title}</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{subtitle}</p>
    </div>
  )
}
