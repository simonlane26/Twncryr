import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim your listing — TwnCryr',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)]">
      {children}
    </div>
  )
}
