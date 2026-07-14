'use client'

import { useState } from 'react'
import Link from 'next/link'

function townUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.twncryr.com')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
  return `https://${slug}.${base}`
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────

export function LandingHero({ towns }: { towns: { name: string; slug: string }[] }) {
  return (
    <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-6 py-16">
      <div className="text-center" style={{ maxWidth: 560, margin: '0 auto' }}>
        <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#0F6E56] mb-4">
          Hear what's happening in town
        </p>
        <h1 className="font-serif text-[44px] font-bold leading-[1.15] mb-4">
          Your high street,<br />alive again
        </h1>
        <p className="text-[16px] text-[var(--color-text-secondary)] leading-relaxed mb-8">
          Twncryr connects local people with the independent businesses that make their town worth living in.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mb-5">
          {towns.map(town => (
            <a
              key={town.slug}
              href={townUrl(town.slug)}
              className="flex items-center gap-2 bg-[#0F6E56] text-[#E1F5EE] text-[14px] font-medium px-6 py-3 rounded-xl no-underline hover:bg-[#085041] transition-colors"
            >
              <i className="ti ti-map-pin text-[15px]" aria-hidden="true" />
              Find businesses in {town.name}
            </a>
          ))}
          <Link
            href="/onboarding"
            className="flex items-center gap-2 bg-[var(--color-background-primary)] text-[var(--color-text-primary)] text-[14px] px-6 py-3 rounded-xl no-underline border border-[var(--color-border-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors"
          >
            I run a local business →
          </Link>
        </div>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Currently live in{' '}
          {towns.map(t => <strong key={t.slug} className="text-[#0F6E56]">{t.name}, Cheshire</strong>)}
          {' '}· More towns coming soon
        </p>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// How it works — tabbed for two audiences
// ─────────────────────────────────────────────

const LOCAL_STEPS = [
  { num: 1, icon: 'ti-search', color: '#0F6E56', bg: '#E1F5EE', title: 'Find your businesses', desc: 'Browse every independent business in town. Filter by food, shops, services, and more.' },
  { num: 2, icon: 'ti-clock', color: '#854F0B', bg: '#FAEEDA', title: 'Catch live deals', desc: 'Last-minute tables and same-day offers appear in real time. Never miss a cancellation again.' },
  { num: 3, icon: 'ti-heart', color: '#A32D2D', bg: '#FAECE7', title: 'Support your high street', desc: 'Every enquiry, every visit, every purchase keeps independent businesses alive.' },
]

const BUSINESS_STEPS = [
  { num: 1, icon: 'ti-building-store', color: '#0F6E56', bg: '#E1F5EE', title: 'Claim your listing', desc: 'Find your business in our directory and claim it free. We verify and approve within hours.' },
  { num: 2, icon: 'ti-speakerphone', color: '#854F0B', bg: '#FAEEDA', title: 'Post in real time', desc: 'A last-minute table, a lunchtime deal, an evening event. Post in seconds and reach locals instantly.' },
  { num: 3, icon: 'ti-users-group', color: '#185FA5', bg: '#E6F1FB', title: 'Connect with traders', desc: 'A private community for local businesses. Share staff, pool purchasing power, and support each other.' },
]

export function HowItWorks() {
  const [audience, setAudience] = useState<'local' | 'business'>('local')
  const steps = audience === 'local' ? LOCAL_STEPS : BUSINESS_STEPS

  return (
    <div>
      <div className="flex gap-2 justify-center mb-8">
        {[
          { value: 'local' as const, label: "I'm a local", icon: 'ti-home' },
          { value: 'business' as const, label: 'I run a business', icon: 'ti-building-store' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setAudience(tab.value)}
            className={`flex items-center gap-2 text-[13px] font-medium px-5 py-2 rounded-full border cursor-pointer transition-all font-sans ${
              audience === tab.value
                ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041]'
                : 'bg-[var(--color-background-primary)] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5]'
            }`}
          >
            <i className={`ti ${tab.icon} text-[14px]`} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {steps.map(step => (
          <div
            key={step.num}
            className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5"
          >
            <p className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
              Step {step.num}
            </p>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: step.bg }}
            >
              <i className={`ti ${step.icon} text-[18px]`} style={{ color: step.color }} aria-hidden="true" />
            </div>
            <p className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">{step.title}</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Feature grid
// ─────────────────────────────────────────────

const FEATURES = [
  { icon: 'ti-bolt', bg: '#E1F5EE', color: '#085041', title: 'Live feed', desc: "Real-time posts from every business. Last-minute tables appear the moment they're posted." },
  { icon: 'ti-sparkles', bg: '#FAEEDA', color: '#633806', title: 'AI marketing co-pilot', desc: 'Generate Instagram captions, Google posts, and newsletters in seconds — tailored to your business.' },
  { icon: 'ti-users-group', bg: '#E6F1FB', color: '#042C53', title: 'Business community', desc: 'A private forum for traders. Share staff, split supply costs, and navigate challenges together.' },
  { icon: 'ti-coin-pound', bg: '#FAECE7', color: '#4A1B0C', title: 'Grants checker', desc: "AI-powered analysis of business rates relief and grants. Most businesses leave money unclaimed." },
  { icon: 'ti-chart-bar', bg: '#F3E8FF', color: '#5B21B6', title: 'Real insights', desc: "Views, enquiries, deal clicks. Data small businesses have never had access to before." },
  { icon: 'ti-calendar', bg: '#E1F5EE', color: '#085041', title: 'Events & markets', desc: 'Town events, market days, festivals — all in one place for locals and businesses.' },
]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-3 gap-0 border border-[var(--color-border-tertiary)] rounded-xl overflow-hidden">
      {FEATURES.map((f, i) => (
        <div
          key={f.title}
          className={`p-5 ${i % 3 !== 2 ? 'border-r' : ''} ${i < 3 ? 'border-b' : ''} border-[var(--color-border-tertiary)]`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: f.bg }}
          >
            <i className={`ti ${f.icon} text-[18px]`} style={{ color: f.color }} aria-hidden="true" />
          </div>
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] mb-1.5">{f.title}</p>
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Social proof
// ─────────────────────────────────────────────

const QUOTES = [
  { text: '"We posted a last-minute cancellation and had three enquiries within 20 minutes. We\'d have lost that table completely before."', author: 'Restaurant owner, Hospital Street' },
  { text: '"The grants checker found £3,600 of relief I didn\'t know I was entitled to. That\'s three months of stock."', author: 'Independent retailer, Pillory Street' },
]

export function SocialProof() {
  return (
    <section className="bg-[#085041] py-14 px-6">
      <div className="max-w-[600px] mx-auto">
        <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#9FE1CB] text-center mb-8">
          What Nantwich businesses say
        </p>
        <div className="grid grid-cols-2 gap-4">
          {QUOTES.map((q, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-5">
              <p className="text-[13px] text-[#E1F5EE] leading-relaxed mb-3">{q.text}</p>
              <p className="text-[11px] text-[#9FE1CB]">{q.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Town map
// ─────────────────────────────────────────────

export function TownMap({
  towns,
  comingTowns,
}: {
  towns: { name: string; county: string; slug: string; businessCount: number; live: boolean }[]
  comingTowns: string[]
}) {
  return (
    <div>
      {towns.map(town => (
        <a
          key={town.slug}
          href={townUrl(town.slug)}
          className="flex items-center gap-3 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-4 py-3 max-w-[260px] mx-auto mb-4 no-underline hover:bg-[#0F6E56] group transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#085041] group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
            <i className="ti ti-map-pin text-[18px] text-[#E1F5EE]" aria-hidden="true" />
          </div>
          <div>
            <p className="font-serif text-[16px] text-[#085041] group-hover:text-[#E1F5EE] transition-colors">{town.name}, {town.county}</p>
            <p className="text-[11px] text-[#0F6E56] group-hover:text-[#9FE1CB] transition-colors">Live · {town.businessCount} businesses</p>
          </div>
        </a>
      ))}

      <p className="text-[12px] text-[var(--color-text-secondary)] mb-3">Coming soon</p>
      <div className="flex gap-2 justify-center flex-wrap mb-6">
        {comingTowns.map(town => (
          <span
            key={town}
            className="text-[11px] px-3.5 py-1.5 rounded-full border border-dashed border-[var(--color-border-secondary)] text-[var(--color-text-secondary)]"
          >
            {town}
          </span>
        ))}
      </div>

      <a
        href="mailto:ignistech999@gmail.com?subject=Bring Twncryr to my town"
        className="text-[13px] text-[#0F6E56] hover:underline no-underline"
      >
        Want Twncryr in your town? Get in touch →
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────
// Business CTA section
// ─────────────────────────────────────────────

const BIZ_FEATURES = [
  'Free listing — always',
  'Post deals and tables in real time',
  'Access the private business community',
  'AI marketing tools and grants checker',
  'Analytics and enquiry inbox',
]

export function BusinessCTA() {
  return (
    <section className="py-14 px-6 bg-[var(--color-background-tertiary)]">
      <div className="max-w-[480px] mx-auto bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-8 text-center">
        <h2 className="font-serif text-[26px] font-semibold mb-3">Ready to join Twncryr?</h2>
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
          Claim your free listing and start reaching locals today. Takes less than 5 minutes.
        </p>
        <div className="flex flex-col gap-2 mb-6 text-left">
          {BIZ_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-2.5 text-[13px] text-[var(--color-text-secondary)]">
              <i className="ti ti-circle-check text-[15px] text-[#0F6E56]" aria-hidden="true" />
              {f}
            </div>
          ))}
        </div>
        <Link
          href="/onboarding"
          className="block w-full bg-[#0F6E56] text-[#E1F5EE] text-[14px] font-medium py-3 rounded-xl no-underline hover:bg-[#085041] transition-colors mb-3"
        >
          Claim your free listing →
        </Link>
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          No card required · Approved within hours · Cancel any time
        </p>
      </div>
    </section>
  )
}
