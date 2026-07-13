import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Twncryr',
  description: 'The terms and conditions governing use of the Twncryr platform.',
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

export default function TermsPage() {
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
          <h1 className="font-serif text-[32px] font-bold mb-2">Terms of Service</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Last updated: June 2026</p>
        </div>

        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-8">

          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-8">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Twncryr platform, website, and services (collectively, &ldquo;the Service&rdquo;). By accessing or using Twncryr, you agree to be bound by these Terms. Please read them carefully.
          </p>

          <Section title="1. Who we are">
            <p>Twncryr is a UK-based platform that connects local people with independent high street businesses. References to &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;Twncryr&rdquo; mean the operators of this service.</p>
            <p>If you have questions about these Terms, contact us at <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a>.</p>
          </Section>

          <Section title="2. Who these Terms apply to">
            <p>These Terms apply to all users of Twncryr, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[var(--color-text-primary)]">Consumers</strong> — local residents browsing the directory, viewing deals and events, or submitting enquiries</li>
              <li><strong className="text-[var(--color-text-primary)]">Business owners</strong> — individuals who claim or register a listing and manage it through the dashboard</li>
            </ul>
          </Section>

          <Section title="3. Creating an account">
            <p>To claim or register a business listing you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information when registering</li>
              <li>Keep your login credentials secure and not share them with others</li>
              <li>Notify us immediately if you suspect unauthorised access to your account</li>
              <li>Be at least 18 years of age, or have the consent of a parent or guardian</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that breach these Terms.</p>
          </Section>

          <Section title="4. Business listings">
            <p>By claiming or registering a business listing on Twncryr, you confirm that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are authorised to represent the business (as owner, director, or appointed manager)</li>
              <li>All information provided about the business is accurate and not misleading</li>
              <li>You will keep your listing information up to date</li>
              <li>Your business complies with all applicable UK laws and regulations</li>
            </ul>
            <p>We review all listing claims before granting dashboard access. We reserve the right to reject or remove any listing at our discretion, including where we have reason to believe it is fraudulent, misleading, or in breach of these Terms.</p>
          </Section>

          <Section title="5. Posts, deals, and content">
            <p>When you post deals, events, last-minute tables, or other content on Twncryr, you agree that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All content is accurate, legal, and not misleading to consumers</li>
              <li>Deals and offers posted are genuine and will be honoured</li>
              <li>You will not post content that is defamatory, discriminatory, offensive, or in breach of any third-party rights</li>
              <li>You grant Twncryr a non-exclusive, royalty-free licence to display your content on the platform</li>
            </ul>
            <p>We may remove any content that breaches these Terms without notice.</p>
          </Section>

          <Section title="6. Consumer enquiries">
            <p>When a consumer submits an enquiry through Twncryr:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The enquiry is passed directly to the relevant business — Twncryr is not a party to any transaction or agreement that results</li>
              <li>Businesses are responsible for responding to enquiries in a timely and professional manner</li>
              <li>Twncryr accepts no liability for the outcome of any consumer-business interaction facilitated through the platform</li>
            </ul>
          </Section>

          <Section title="7. Community forum">
            <p>The business community forum is a private space for verified business owners in the same town. By participating you agree:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Not to post content that is abusive, threatening, or harassing to other members</li>
              <li>Not to use the forum for spam, advertising outside your own business, or off-topic commercial solicitation</li>
              <li>That forum content is visible to other verified business owners in your town</li>
            </ul>
            <p>We reserve the right to remove posts and revoke forum access for users who violate these rules.</p>
          </Section>

          <Section title="8. Acceptable use">
            <p>You must not use Twncryr to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Impersonate another business, person, or organisation</li>
              <li>Attempt to gain unauthorised access to any part of the platform or another user&apos;s account</li>
              <li>Scrape, harvest, or systematically extract data from the platform without our written consent</li>
              <li>Engage in any activity that disrupts, damages, or places an unreasonable load on our infrastructure</li>
              <li>Violate any applicable UK law or regulation</li>
            </ul>
          </Section>

          <Section title="9. Intellectual property">
            <p>The Twncryr name, logo, platform design, and software are our intellectual property and may not be copied, reproduced, or used without our written permission.</p>
            <p>You retain ownership of the content you post. By posting content, you grant us the right to display it on the platform for as long as your listing is active.</p>
          </Section>

          <Section title="10. Availability and changes">
            <p>We aim to keep Twncryr available at all times but do not guarantee uninterrupted service. We may:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Take the platform offline for maintenance, updates, or security purposes</li>
              <li>Change, add, or remove features at any time</li>
              <li>Update these Terms — we will notify registered business accounts of material changes by email</li>
            </ul>
            <p>Continued use of the Service after a change to these Terms constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="11. Limitation of liability">
            <p>To the fullest extent permitted by UK law:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Twncryr is provided &ldquo;as is&rdquo; without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential loss arising from your use of the platform</li>
              <li>We are not responsible for the accuracy of business-submitted content, or for the outcome of any transaction between a consumer and a business</li>
              <li>Our total liability to you in any 12-month period shall not exceed the fees you have paid us in that period (if any)</li>
            </ul>
            <p>Nothing in these Terms limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.</p>
          </Section>

          <Section title="12. Termination">
            <p>You may close your account and remove your listing at any time by contacting us at <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a>.</p>
            <p>We may suspend or terminate your access without notice if you breach these Terms, or with reasonable notice if we decide to discontinue the Service.</p>
          </Section>

          <Section title="13. Governing law">
            <p>These Terms are governed by the laws of England and Wales. Any disputes arising from your use of Twncryr shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="14. Contact">
            <p>For any questions about these Terms: <a href="mailto:ignistech999@gmail.com" className="text-[#0F6E56] hover:underline">ignistech999@gmail.com</a></p>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)] px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 max-w-[680px] mx-auto">
          <span className="font-serif text-[16px]">Twn<em className="not-italic text-[#0F6E56]">cryr</em></span>
          <div className="flex gap-5 text-[12px] text-[var(--color-text-secondary)]">
            <Link href="/privacy" className="hover:text-[#0F6E56] no-underline">Privacy policy</Link>
            <Link href="/terms" className="hover:text-[#0F6E56] no-underline">Terms of service</Link>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Supporting UK high streets · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
