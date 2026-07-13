import Link from 'next/link'
import { requireTown } from '@/lib/town'

export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const town = await requireTown()

  return (
    <>
      <nav className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 h-[52px] flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="font-serif text-[18px] no-underline text-[var(--color-text-primary)]">
          Twn<em className="not-italic text-[#0F6E56]">cryr</em>
          <span className="font-sans text-[12px] text-[var(--color-text-secondary)] font-normal ml-2">
            {town.name}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/?cat=FOOD_DRINK" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline">
            Food & drink
          </Link>
          <Link href="/events" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline">
            Events
          </Link>
          <Link href="/businesses" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline">
            Directory
          </Link>
          <Link
            href="/onboarding"
            className="bg-[#0F6E56] text-[#E1F5EE] text-[12px] font-medium px-3.5 py-1.5 rounded-lg no-underline hover:bg-[#085041] transition-colors"
          >
            I'm a business
          </Link>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-[var(--color-background-primary)] border-t border-[var(--color-border-tertiary)] px-5 py-8 mt-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-serif text-[16px] mb-1">
              Twn<em className="not-italic text-[#0F6E56]">cryr</em>
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Hear what's happening in {town.name}
            </p>
          </div>
          <div className="flex gap-6 text-[12px] text-[var(--color-text-secondary)]">
            <Link href="/onboarding" className="hover:text-[#0F6E56] no-underline">For businesses</Link>
            <Link href="/about" className="hover:text-[#0F6E56] no-underline">About</Link>
            <Link href="/privacy" className="hover:text-[#0F6E56] no-underline">Privacy</Link>
            <Link href="/terms" className="hover:text-[#0F6E56] no-underline">Terms</Link>
          </div>
        </div>
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-6">
          © {new Date().getFullYear()} Twncryr · Supporting {town.name} high street
        </p>
      </footer>
    </>
  )
}
