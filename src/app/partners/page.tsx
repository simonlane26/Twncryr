import type { Metadata } from 'next'
import SupplierRegisterClient from './_client'

export const metadata: Metadata = {
  title: 'Partner with Twncryr — Reach UK high street businesses',
  description: 'Supply goods and services to independent UK high street businesses through Twncryr\'s collective purchasing platform. Register as a supplier partner.',
}

const CATEGORIES = [
  { value: 'ENERGY',           label: 'Energy supplier',         desc: 'Business electricity and gas' },
  { value: 'CARD_PROCESSING',  label: 'Card processing',         desc: 'Payment terminals and transaction fees' },
  { value: 'INSURANCE',        label: 'Business insurance',      desc: 'Contents, liability, business interruption' },
  { value: 'PACKAGING',        label: 'Packaging & supplies',    desc: 'Bags, boxes, branded packaging' },
  { value: 'BROADBAND',        label: 'Business broadband',      desc: 'Leased lines, fibre, connectivity' },
  { value: 'CLEANING_SUPPLIES',label: 'Cleaning & hygiene',      desc: 'Commercial cleaning products' },
  { value: 'ACCOUNTING',       label: 'Accounting & bookkeeping',desc: 'Software, accountants, bookkeepers' },
  { value: 'MARKETING_TOOLS',  label: 'Marketing tools',         desc: 'Email, social, design platforms' },
  { value: 'OTHER',            label: 'Other',                   desc: 'Other products or services' },
]

export default function PartnersPage() {
  return (
    <div className="font-sans min-h-screen bg-[var(--color-background-tertiary)]">

      {/* Nav */}
      <nav className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-6 h-[52px] flex items-center justify-between">
        <span className="font-serif text-[18px]">
          Twn<em className="not-italic text-[#0F6E56]">cryr</em>
          <span className="font-sans text-[12px] font-normal text-[var(--color-text-secondary)] ml-2">
            Partner programme
          </span>
        </span>
        <a
          href="https://twncryr.co.uk"
          className="text-[12px] text-[var(--color-text-secondary)] no-underline hover:text-[#0F6E56] flex items-center gap-1"
        >
          <i className="ti ti-arrow-left text-[13px]" aria-hidden="true" />
          Back to Twncryr
        </a>
      </nav>

      {/* Hero */}
      <div className="bg-[#085041] px-6 py-14 text-center">
        <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#9FE1CB] mb-3">
          Supplier partners
        </p>
        <h1 className="font-serif text-[36px] font-bold text-[#E1F5EE] leading-tight mb-4 max-w-[480px] mx-auto">
          Reach UK high street businesses through collective demand
        </h1>
        <p className="text-[15px] text-[#9FE1CB] leading-relaxed max-w-[440px] mx-auto">
          Twncryr aggregates purchasing demand from independent businesses across UK market towns. When enough businesses in a town want what you offer, we connect you — no cold calling required.
        </p>
      </div>

      {/* How it works for suppliers */}
      <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-6 py-10">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[10px] font-medium tracking-[1.6px] uppercase text-[#0F6E56] text-center mb-6">
            How it works
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', icon: 'ti-clipboard-list', title: 'Register your offer', desc: 'Tell us what you\'re offering, your minimum group size, and your estimated saving for businesses.' },
              { step: '2', icon: 'ti-bell', title: 'Get notified on demand', desc: 'When enough businesses in a town express interest in your category, we contact you automatically with real numbers.' },
              { step: '3', icon: 'ti-handshake', title: 'Submit a proposal', desc: 'Send your best group offer. We share it with interested businesses. You handle the sales — we made the introduction.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-3">
                  <i className={`ti ${s.icon} text-[18px] text-[#085041]`} aria-hidden="true" />
                </div>
                <p className="text-[10px] font-medium text-[#0F6E56] uppercase tracking-wide mb-1">Step {s.step}</p>
                <p className="text-[13px] font-medium text-[var(--color-text-primary)] mb-1.5">{s.title}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border-tertiary)] px-6 py-6">
        <div className="max-w-[480px] mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { n: '47+', l: 'Businesses in Nantwich' },
            { n: 'Free', l: 'To register as a supplier' },
            { n: '0%', l: 'Commission until deal completes' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-[24px] font-medium text-[var(--color-text-primary)]">{s.n}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration form */}
      <div className="px-6 py-10">
        <div className="max-w-[560px] mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-serif text-[22px] font-semibold mb-2">Register as a supplier partner</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Free to join. We'll contact you when demand in your category reaches your minimum group size.
            </p>
          </div>
          <SupplierRegisterClient categories={CATEGORIES} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border-tertiary)] px-6 py-6 text-center">
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Questions? Email{' '}
          <a href="mailto:partners@twncryr.co.uk" className="text-[#0F6E56] hover:underline no-underline">
            partners@twncryr.co.uk
          </a>
        </p>
      </div>
    </div>
  )
}
