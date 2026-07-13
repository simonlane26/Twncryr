import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import '@uploadthing/react/styles.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TwnCryr — Your High Street, Online',
  description: "Discover local businesses, last-minute deals, and what's on in your town.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
        <body className="font-[family-name:var(--font-dm-sans)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
