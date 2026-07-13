import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Twncryr',
  description: 'How Twncryr collects, uses, and protects your personal data.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-serif text-[20px] font-semibold text-[var(--color-text-primary)] mb-3">{title}</h2>
      <div className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="font-sans bg-[var(--color-background-tertiary)] min-h-screen">
      {/* Nav */}
      <nav className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-6 h-[56px] flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="font-serif text-[20px] font-semibold no-underline text-[var(--color-text-primary)]">
          Twn<em className="not-italic text-[#0F6E56]">cryr</em>
        </Link>
        <Link href="/onboarding" className="bg-[#0F6E56] text-[#E1F5EE] text-[13px] font-medium px-4 py-2 rounded-lg no-underline hover:bg-[#085041] transition-colors">
          Claim your listing
        </Link>
      </nav>

      {/* Content */}
      <div className="max-w-[680px] mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">Legal</p>
          <h1 className="font-serif text-[32px] font-bold mb-2">Privacy Policy</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Last updated: June 2026</p>
        </div>

        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-8">

          <Section title="Who we are">
            <p>Twncryr is a UK-based platform that connects local people with independent high street businesses in their town. We are the data controller for personal data collected through this website and our services.</p>
            <p>You can contact us at: <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a></p>
          </Section>

          <Section title="What data we collect">
            <p><strong className="text-[var(--color-text-primary)]">Consumers (local residents)</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No account is required to browse the directory or view posts</li>
              <li>If you submit an enquiry to a business: your name, email address, phone number (optional), and message</li>
            </ul>
            <p><strong className="text-[var(--color-text-primary)]">Business owners</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information: name, email address, and organisation details via Clerk (our authentication provider)</li>
              <li>Business listing information: business name, address, description, opening hours, photos</li>
              <li>Posts you create: deals, last-minute tables, events, announcements</li>
              <li>Community forum posts and replies</li>
              <li>Payment information processed by Stripe (we do not store card details ourselves)</li>
            </ul>
            <p><strong className="text-[var(--color-text-primary)]">All users</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Standard server logs including IP address and browser type</li>
              <li>Analytics data on how pages and features are used</li>
            </ul>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate and provide the Twncryr service</li>
              <li>To pass consumer enquiries to the relevant business</li>
              <li>To send transactional emails (enquiry confirmations, account notifications) via Resend</li>
              <li>To enable real-time features (live deal feeds) via Pusher</li>
              <li>To process subscription payments via Stripe</li>
              <li>To improve the platform based on usage patterns</li>
            </ul>
            <p>We do not sell your personal data. We do not use your data for advertising.</p>
          </Section>

          <Section title="Legal basis (UK GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[var(--color-text-primary)]">Contract:</strong> processing necessary to operate your business account and provide the service you have signed up to</li>
              <li><strong className="text-[var(--color-text-primary)]">Legitimate interests:</strong> fraud prevention, service security, and platform improvement</li>
              <li><strong className="text-[var(--color-text-primary)]">Legal obligation:</strong> where we are required to retain records for tax or legal compliance</li>
              <li><strong className="text-[var(--color-text-primary)]">Consent:</strong> for any marketing communications (you can withdraw at any time)</li>
            </ul>
          </Section>

          <Section title="Third-party services">
            <p>We use the following sub-processors who may handle your personal data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[var(--color-text-primary)]">Clerk</strong> — authentication and identity management</li>
              <li><strong className="text-[var(--color-text-primary)]">Stripe</strong> — payment processing</li>
              <li><strong className="text-[var(--color-text-primary)]">Resend</strong> — transactional email delivery</li>
              <li><strong className="text-[var(--color-text-primary)]">Pusher</strong> — real-time messaging infrastructure</li>
              <li><strong className="text-[var(--color-text-primary)]">UploadThing</strong> — file and image storage</li>
              <li><strong className="text-[var(--color-text-primary)]">Railway</strong> — database hosting (PostgreSQL, hosted in the EU)</li>
            </ul>
            <p>All third-party processors are contractually required to protect your data and may only use it to provide services to us.</p>
          </Section>

          <Section title="Data retention">
            <ul className="list-disc pl-5 space-y-1">
              <li>Business account data is retained for as long as you have an active account, and for up to 2 years after account closure for legal compliance</li>
              <li>Consumer enquiries are retained for 12 months and then deleted</li>
              <li>Server logs are retained for 90 days</li>
            </ul>
          </Section>

          <Section title="Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[var(--color-text-primary)]">Access</strong> the personal data we hold about you</li>
              <li><strong className="text-[var(--color-text-primary)]">Rectify</strong> inaccurate data</li>
              <li><strong className="text-[var(--color-text-primary)]">Erase</strong> your data (right to be forgotten), subject to legal retention obligations</li>
              <li><strong className="text-[var(--color-text-primary)]">Restrict</strong> processing in certain circumstances</li>
              <li><strong className="text-[var(--color-text-primary)]">Portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong className="text-[var(--color-text-primary)]">Object</strong> to processing based on legitimate interests</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="Complaints">
            <p>If you have a complaint about how we handle your personal data, please contact us directly first:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: <a href="mailto:privacy.ignistech@gmail.com" className="text-[#0F6E56] hover:underline">privacy.ignistech@gmail.com</a></li>
              <li>Subject line: <strong className="text-[var(--color-text-primary)]">Privacy Complaint</strong></li>
            </ul>
            <p>We will acknowledge your complaint within <strong className="text-[var(--color-text-primary)]">5 business days</strong> and investigate it promptly. We aim to resolve all complaints within <strong className="text-[var(--color-text-primary)]">30 days</strong>. If a matter is complex it may take longer, in which case we will keep you informed of progress.</p>
            <p>If you are not satisfied with our response, or if we fail to respond within 30 days, you have the right to escalate your complaint to the <a href="https://ico.org.uk/make-a-complaint" className="text-[#0F6E56] hover:underline" target="_blank" rel="noopener noreferrer">Information Commissioner's Office (ICO)</a> at <strong className="text-[var(--color-text-primary)]">ico.org.uk</strong> or by calling <strong className="text-[var(--color-text-primary)]">0303 123 1113</strong>.</p>
          </Section>

          <Section title="Cookies">
            <p>We use essential cookies only — those required for authentication and session management. We do not use tracking or advertising cookies.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>We may update this policy from time to time. If we make material changes we will notify business account holders by email. The date at the top of this page shows when it was last updated.</p>
          </Section>

          <Section title="Contact">
            <p>For any privacy-related questions: <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a></p>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)] px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 max-w-[680px] mx-auto">
          <span className="font-serif text-[16px]">Twn<em className="not-italic text-[#0F6E56]">cryr</em></span>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Supporting UK high streets · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
