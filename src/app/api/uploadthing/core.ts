import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const f = createUploadthing()

// ─────────────────────────────────────────────
// Auth helper — gets the business for the
// currently authenticated Clerk org
// ─────────────────────────────────────────────

async function getAuthenticatedBusiness() {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Unauthorised')

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
  })

  if (!business) throw new Error('Business not found')
  return business
}

// ─────────────────────────────────────────────
// File router
// ─────────────────────────────────────────────

export const ourFileRouter = {

  // Business venue photos — up to 8 images, 4MB each
  businessPhotos: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 8,
    },
  })
    .middleware(async () => {
      const business = await getAuthenticatedBusiness()
      return { businessId: business.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Append the new photo URL to the business's photos array
      await prisma.business.update({
        where: { id: metadata.businessId },
        data: {
          photos: {
            push: file.url,
          },
        },
      })

      return { url: file.url }
    }),

  // Business logo — single image, 2MB
  businessLogo: f({
    image: {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const business = await getAuthenticatedBusiness()
      return { businessId: business.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.business.update({
        where: { id: metadata.businessId },
        data: { logo: file.url },
      })

      return { url: file.url }
    }),

} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
