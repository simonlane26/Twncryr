import { requireBusiness } from '@/lib/clerk'
import ProfileEditClient from './_client'

export default async function DashboardProfilePage() {
  const business = await requireBusiness()

  return (
    <div className="p-5 max-w-[800px]">
      <div className="mb-6">
        <h1 className="font-serif text-[22px] text-[var(--color-text-primary)]">
          My listing
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          This is what locals see when they find you on Twncryr.{' '}
          <a
            href={`/businesses/${business.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#0F6E56] hover:underline"
          >
            Preview public listing ↗
          </a>
        </p>
      </div>

      <ProfileEditClient
        business={{
          id:           business.id,
          name:         business.name,
          slug:         business.slug,
          category:     business.category as string,
          tagline:      business.tagline,
          description:  business.description,
          address:      business.address,
          postcode:     business.postcode,
          phone:        business.phone,
          email:        business.email,
          website:      business.website,
          logo:         business.logo,
          photos:       business.photos,
          openingHours: business.openingHours as any,
        }}
      />
    </div>
  )
}
