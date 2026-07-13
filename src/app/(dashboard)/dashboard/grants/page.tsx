import { requireBusiness } from '@/lib/clerk'
import GrantsClient from './_client'

export default async function GrantsPage() {
  const business = await requireBusiness()

  return (
    <div className="p-5 max-w-[720px]">
      <div className="mb-5">
        <h1 className="font-serif text-[22px] text-[var(--color-text-primary)] flex items-center gap-2">
          <i className="ti ti-coins text-[20px] text-[#0F6E56]" aria-hidden="true" />
          Grants & rate relief checker
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          Find every scheme your business is eligible for — rate relief, local grants, and national funding.
        </p>
      </div>

      <GrantsClient
        businessName={business.name}
        townName={business.town.name}
        county={business.town.county}
      />
    </div>
  )
}
