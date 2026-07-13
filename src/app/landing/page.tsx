import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHero, HowItWorks, FeatureGrid, SocialProof, TownMap, BusinessCTA } from './_components'

export const metadata: Metadata = {
  title: "Twncryr — Hear what's happening in town",
  description: 'Twncryr connects local people with the independent businesses that make their town worth living in. Live deals, last-minute tables, events, and a private community for traders.',
}

const ACTIVE_TOWNS = [
  { name: 'Nantwich', county: 'Cheshire', slug: 'nantwich', businessCount: 47, live: true },
]
const COMING_TOWNS = ['Sandbach', 'Knutsford', 'Tarporley', 'Congleton', 'Macclesfield', 'Crewe']

export default function LandingPage() {
  return (
    <div className="font-sans bg-[var(--color-background-tertiary)]">
      <nav className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-6 h-[56px] flex items-center justify-between sticky top-0 z-40">
        <span className="font-serif text-[20px] font-semibold">
          Twn<em className="not-italic text-[#0F6E56]">cryr</em>
        </span>
        <div className="flex items-center gap-5">
          <a href="#how" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline">How it works</a>
          <a href="#towns" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline">Towns</a>
          <Link href="/onboarding" className="bg-[#0F6E56] text-[#E1F5EE] text-[13px] font-medium px-4 py-2 rounded-lg no-underline hover:bg-[#085041] transition-colors">
            Claim your listing
          </Link>
        </div>
      </nav>

      <LandingHero towns={ACTIVE_TOWNS} />

      <div className="bg-[#085041] py-3 px-6 flex items-center justify-center gap-8 flex-wrap">
        {['Last-minute tables available tonight in Nantwich', '3 live deals on right now', 'Food Festival this weekend'].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px] font-medium text-[#E1F5EE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9FE1CB] animate-pulse flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>

      <section id="how" className="py-14 px-6 bg-[var(--color-background-tertiary)]">
        <div className="max-w-[680px] mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">How it works</p>
            <h2 className="font-serif text-[28px] font-semibold mb-3">Built for both sides of the high street</h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="bg-[var(--color-background-primary)] border-y border-[var(--color-border-tertiary)] py-14 px-6">
        <div className="max-w-[680px] mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">Features</p>
            <h2 className="font-serif text-[28px] font-semibold">Everything your high street needs</h2>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <SocialProof />

      <section id="towns" className="py-14 px-6 bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)]">
        <div className="max-w-[480px] mx-auto text-center">
          <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">Where we are</p>
          <h2 className="font-serif text-[28px] font-semibold mb-3">Starting in Nantwich</h2>
          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-6">
            We're building town by town — getting it right before we grow.
          </p>
          <TownMap towns={ACTIVE_TOWNS} comingTowns={COMING_TOWNS} />
        </div>
      </section>

      <BusinessCTA />

      <footer className="bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)] px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="font-serif text-[16px]">Twn<em className="not-italic text-[#0F6E56]">cryr</em></span>
          <div className="flex gap-5 text-[12px] text-[var(--color-text-secondary)]">
            <Link href="/onboarding" className="hover:text-[#0F6E56] no-underline">For businesses</Link>
            <a href="mailto:ignistech999@gmail.com" className="hover:text-[#0F6E56] no-underline">Contact</a>
            <Link href="/privacy" className="hover:text-[#0F6E56] no-underline">Privacy policy</Link>
            <Link href="/terms" className="hover:text-[#0F6E56] no-underline">Terms of service</Link>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Supporting UK high streets · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
