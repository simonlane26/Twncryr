'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────
// Steps
// ─────────────────────────────────────────────

const STEPS = [
  {
    id:       'welcome',
    title:    "You're live on Twncryr",
    subtitle: "Here's everything you can do — and where to start.",
    icon:     'ti-confetti',
    color:    '#0F6E56',
    bg:       '#E1F5EE',
  },
  {
    id:       'profile',
    title:    'Complete your profile',
    subtitle: 'Businesses with full profiles get 3× more views. Takes 2 minutes.',
    icon:     'ti-building-store',
    color:    '#185FA5',
    bg:       '#E6F1FB',
  },
  {
    id:       'first-post',
    title:    'Make your first post',
    subtitle: 'Post a deal, a last-minute table, or an event — it goes live instantly.',
    icon:     'ti-speakerphone',
    color:    '#854F0B',
    bg:       '#FAEEDA',
  },
  {
    id:       'community',
    title:    'Join the community',
    subtitle: 'Say hello to other Nantwich traders in the private business forum.',
    icon:     'ti-messages',
    color:    '#5B21B6',
    bg:       '#F3E8FF',
  },
  {
    id:       'grants',
    title:    "Check what you're owed",
    subtitle: "Run the grants checker — most businesses find relief they didn't know about.",
    icon:     'ti-coin-pound',
    color:    '#0F6E56',
    bg:       '#E1F5EE',
  },
]

// ─────────────────────────────────────────────
// Individual step screens
// ─────────────────────────────────────────────

function WelcomeStep({ businessName, townName }: { businessName: string; townName: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#E1F5EE] border-2 border-[#5DCAA5] flex items-center justify-center mx-auto mb-4">
        <i className="ti ti-circle-check text-[32px] text-[#0F6E56]" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-[24px] font-semibold mb-3">
        Welcome to Twncryr, {businessName.split(' ')[0]}!
      </h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-[400px] mx-auto">
        Your listing is live on High Street {townName}. Locals can find you, and you can start posting deals and connecting with other traders right now.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-[380px] mx-auto mb-6">
        {[
          { n: '47', l: 'Businesses in your town', icon: 'ti-building-store' },
          { n: '1.2k', l: 'Monthly local visitors', icon: 'ti-users' },
          { n: '∞', l: 'Posts, deals, and tables', icon: 'ti-speakerphone' },
          { n: 'Free', l: 'Always, forever', icon: 'ti-heart' },
        ].map(s => (
          <div key={s.l} className="bg-[var(--color-background-secondary)] rounded-xl p-3 text-center">
            <i className={`ti ${s.icon} text-[18px] text-[#0F6E56] block mb-1`} aria-hidden="true" />
            <p className="text-[18px] font-medium text-[var(--color-text-primary)]">{s.n}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileStep() {
  return (
    <div>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
        A complete profile helps locals trust and choose you. Here's what to add:
      </p>
      <div className="flex flex-col gap-3">
        {[
          { icon: 'ti-photo', title: 'Add venue photos', desc: 'Show locals what your place looks like. Even 2-3 photos make a huge difference.', href: '/dashboard/profile', cta: 'Add photos' },
          { icon: 'ti-file-text', title: 'Write a description', desc: 'Tell locals what makes you special — your story, your offer, what they can expect.', href: '/dashboard/profile', cta: 'Add description' },
          { icon: 'ti-clock', title: 'Set opening hours', desc: "Locals can see if you're open right now. Helps them decide whether to visit.", href: '/dashboard/profile', cta: 'Set hours' },
        ].map(item => (
          <div key={item.title} className="flex items-center gap-3 bg-[var(--color-background-secondary)] rounded-xl p-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
              <i className={`ti ${item.icon} text-[16px] text-[#042C53]`} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{item.title}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
            </div>
            <a
              href={item.href}
              className="text-[11px] font-medium text-[#0F6E56] bg-[#E1F5EE] border border-[#5DCAA5] px-2.5 py-1.5 rounded-lg no-underline hover:bg-[#0F6E56] hover:text-[#E1F5EE] hover:border-[#0F6E56] transition-colors flex-shrink-0"
            >
              {item.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

function FirstPostStep() {
  return (
    <div>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
        Your first post reaches all Nantwich locals immediately. What do you want to share?
      </p>
      <div className="flex flex-col gap-3">
        {[
          { icon: 'ti-clock', color: '#854F0B', bg: '#FAEEDA', title: 'Last-minute table', desc: 'Got a cancellation tonight? Post it now and fill the seat.', href: '/dashboard' },
          { icon: 'ti-tag', color: '#085041', bg: '#E1F5EE', title: 'A deal or offer', desc: 'Market day special? New menu launch? Get it in front of locals.', href: '/dashboard' },
          { icon: 'ti-calendar', color: '#042C53', bg: '#E6F1FB', title: 'An upcoming event', desc: 'Wine tasting, author signing, late night shopping — announce it here.', href: '/dashboard' },
        ].map(item => (
          <a
            key={item.title}
            href={item.href}
            className="flex items-center gap-3 border border-[var(--color-border-tertiary)] rounded-xl p-3.5 no-underline hover:border-[#5DCAA5] hover:bg-[#E1F5EE] group transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: item.bg }}
            >
              <i className={`ti ${item.icon} text-[16px]`} style={{ color: item.color }} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{item.title}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{item.desc}</p>
            </div>
            <i className="ti ti-arrow-right text-[14px] text-[var(--color-text-secondary)] group-hover:text-[#0F6E56] transition-colors" aria-hidden="true" />
          </a>
        ))}
      </div>
      <div className="mt-4 bg-[var(--color-background-secondary)] rounded-xl px-4 py-3">
        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
          <i className="ti ti-bulb text-[13px] text-[#0F6E56] mr-1.5" aria-hidden="true" />
          Businesses that post a last-minute table within 1 hour of availability get <strong>3× more enquiries</strong>.
        </p>
      </div>
    </div>
  )
}

function CommunityStep({ townName }: { townName: string }) {
  return (
    <div>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
        The {townName} business community is already active. Here's what traders talk about:
      </p>
      <div className="flex flex-col gap-2.5 mb-5">
        {[
          { biz: 'The Cocoa Garden', msg: 'Looking for a part-time Saturday team member — anyone know someone great?', time: '2 hrs ago' },
          { biz: 'Cheshire Gifts', msg: 'Splitting cost of festive display materials — 3 spaces left.', time: '4 hrs ago' },
          { biz: 'Petal & Bloom', msg: 'Hospital Street closure Monday — heads up for deliveries.', time: 'Yesterday' },
        ].map((post, i) => (
          <div key={i} className="bg-[var(--color-background-secondary)] rounded-xl px-4 py-3">
            <p className="text-[11px] font-medium text-[var(--color-text-primary)] mb-1">{post.biz}</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{post.msg}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5">{post.time}</p>
          </div>
        ))}
      </div>
      <a
        href="/dashboard/community"
        className="flex items-center justify-center gap-2 w-full bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5] py-2.5 rounded-xl text-[13px] font-medium no-underline hover:bg-[#0F6E56] hover:text-[#E1F5EE] hover:border-[#0F6E56] transition-colors"
      >
        <i className="ti ti-messages text-[14px]" aria-hidden="true" />
        Open the community forum
      </a>
    </div>
  )
}

function GrantsStep() {
  return (
    <div>
      <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
        Most UK independent businesses miss out on rates relief and grants they're entitled to. Our AI checker takes 60 seconds.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Small Business Rate Relief', amount: 'Up to 100% off', color: '#085041', bg: '#E1F5EE' },
          { label: 'Retail & Hospitality Relief', amount: 'Up to 75% off', color: '#633806', bg: '#FAEEDA' },
          { label: 'UK Shared Prosperity Fund', amount: 'Grants available', color: '#042C53', bg: '#E6F1FB' },
          { label: 'Cheshire council schemes', amount: 'Discretionary', color: '#5B21B6', bg: '#F3E8FF' },
        ].map(item => (
          <div key={item.label} className="rounded-xl px-4 py-3 border border-[var(--color-border-tertiary)]" style={{ background: item.bg }}>
            <p className="text-[11px] font-medium mb-1" style={{ color: item.color }}>{item.amount}</p>
            <p className="text-[11px]" style={{ color: item.color }}>{item.label}</p>
          </div>
        ))}
      </div>
      <a
        href="/dashboard/grants"
        className="flex items-center justify-center gap-2 w-full bg-[#0F6E56] text-[#E1F5EE] border-none py-2.5 rounded-xl text-[13px] font-medium no-underline hover:bg-[#085041] transition-colors"
      >
        <i className="ti ti-coin-pound text-[14px]" aria-hidden="true" />
        Check what I'm entitled to
      </a>
      <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-2">
        Free · Takes 60 seconds · No obligation
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────

export default function WelcomeWizard({
  businessName,
  townName,
  onComplete,
}: {
  businessName: string
  townName: string
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  const stepContent: Record<string, React.ReactNode> = {
    welcome:      <WelcomeStep businessName={businessName} townName={townName} />,
    profile:      <ProfileStep />,
    'first-post': <FirstPostStep />,
    community:    <CommunityStep townName={townName} />,
    grants:       <GrantsStep />,
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-background-primary)] rounded-2xl border border-[var(--color-border-tertiary)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Progress dots */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-tertiary)]">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? '24px' : '8px',
                  background: i <= step ? '#0F6E56' : 'var(--color-border-tertiary)',
                }}
              />
            ))}
          </div>
          <button
            onClick={onComplete}
            className="text-[11px] text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[var(--color-text-primary)] font-sans"
          >
            Skip tour
          </button>
        </div>

        {/* Step content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: currentStep.bg }}
            >
              <i
                className={`ti ${currentStep.icon} text-[20px]`}
                style={{ color: currentStep.color }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="font-serif text-[18px] text-[var(--color-text-primary)]">{currentStep.title}</h2>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{currentStep.subtitle}</p>
            </div>
          </div>

          {stepContent[currentStep.id]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border-tertiary)]">
          <button
            onClick={() => setStep(s => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="text-[13px] text-[var(--color-text-secondary)] disabled:opacity-0 bg-transparent border-none cursor-pointer hover:text-[var(--color-text-primary)] font-sans flex items-center gap-1.5"
          >
            <i className="ti ti-arrow-left text-[14px]" aria-hidden="true" />
            Back
          </button>

          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {step + 1} of {STEPS.length}
          </span>

          <button
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
            className="bg-[#0F6E56] text-[#E1F5EE] border-none px-5 py-2 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center gap-1.5"
          >
            {isLast ? 'Go to dashboard' : 'Next'}
            <i className="ti ti-arrow-right text-[14px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
