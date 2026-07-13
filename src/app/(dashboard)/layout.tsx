import Image from 'next/image'
import Link from 'next/link'
import { getCurrentBusiness } from '@/lib/clerk'
import {
  House, Tag, ChartBar, Users, Gear, SignOut, Bell, Tray,
  Sparkle, Package, Coins,
} from '@phosphor-icons/react/dist/ssr'
import { prisma } from '@/lib/prisma'

const NAV_ITEMS = [
  { href: '/dashboard',            Icon: House,    label: 'Overview'   },
  { href: '/dashboard/posts',      Icon: Tag,      label: 'Posts'      },
  { href: '/dashboard/enquiries',  Icon: Tray,     label: 'Enquiries'  },
  { href: '/dashboard/community',  Icon: Users,    label: 'Community'  },
  { href: '/dashboard/marketing',  Icon: Sparkle,  label: 'Marketing'  },
  { href: '/dashboard/collective', Icon: Package,  label: 'Collective' },
  { href: '/dashboard/grants',     Icon: Coins,    label: 'Grants'     },
  { href: '/dashboard/analytics',  Icon: ChartBar, label: 'Analytics'  },
  { href: '/dashboard/profile',    Icon: Gear,     label: 'Profile'    },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const business = await getCurrentBusiness()

  const unreadEnquiries = business
    ? await prisma.enquiry.count({ where: { businessId: business.id, read: false } })
    : 0

  return (
    <div className="flex min-h-screen bg-[var(--color-background-tertiary)]">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[var(--color-background-primary)] border-r border-[var(--color-border-tertiary)] flex flex-col">
        {/* Logo */}
        <div className="px-4 h-[52px] flex items-center gap-2.5 border-b border-[var(--color-border-tertiary)]">
          <Image src="/Logo.png" alt="TwnCryr" width={24} height={24} className="rounded" />
          <span className="font-[family-name:var(--font-fraunces)] text-[16px] font-semibold">
            Twn<em className="not-italic text-[#0F6E56]">cryr</em>
          </span>
        </div>

        {/* Business name */}
        {business && (
          <div className="px-4 py-3 border-b border-[var(--color-border-tertiary)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 text-[12px] font-semibold text-[#085041]">
                {business.logo
                  ? <img src={business.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                  : business.name.charAt(0)
                }
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{business.name}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">{business.town.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)] no-underline transition-colors"
            >
              <Icon size={16} />
              {label}
              {label === 'Enquiries' && unreadEnquiries > 0 && (
                <span className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806]">
                  {unreadEnquiries}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3 border-t border-[var(--color-border-tertiary)] pt-3 flex flex-col gap-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] no-underline transition-colors"
          >
            <SignOut size={16} />
            View site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[52px] bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] flex items-center justify-end px-6 gap-3">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors border-none bg-transparent cursor-pointer">
            <Bell size={16} />
          </button>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
