import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import MarketingClient from './_client'

export default async function MarketingPage() {
  const business = await requireBusiness()

  const bizTokens = await prisma.business.findUnique({
    where: { id: business.id },
    select: { googleRefreshToken: true },
  })

  return (
    <div className="p-5 max-w-[760px]">
      <div className="mb-5">
        <h1 className="font-serif text-[22px] text-[var(--color-text-primary)] flex items-center gap-2">
          <i className="ti ti-sparkles text-[20px] text-[#0F6E56]" aria-hidden="true" />
          Marketing co-pilot
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          AI-generated content for your social media, Google listing, and email campaigns
        </p>
      </div>

      <MarketingClient
        googleConnected={!!bizTokens?.googleRefreshToken}
        business={{
          name:        business.name,
          category:    business.category as string,
          description: business.description,
          address:     business.address,
          townName:    business.town.name,
          townCounty:  business.town.county,
        }}
      />
    </div>
  )
}
