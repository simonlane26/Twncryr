import { headers } from 'next/headers'
import { cache } from 'react'
import { prisma } from './prisma'
import { Town } from '@prisma/client'

export const getTown = cache(async (): Promise<Town | null> => {
  const headersList = await headers()
  const townSlug = headersList.get('x-town')

  if (!townSlug) return null

  const town = await prisma.town.findUnique({
    where: { slug: townSlug, active: true },
  })

  return town
})

export async function requireTown(): Promise<Town> {
  const town = await getTown()
  if (!town) {
    throw new Error(`No active town found for this subdomain`)
  }
  return town
}

export const getBusinessForCurrentUser = cache(async (clerkOrgId: string) => {
  return prisma.business.findUnique({
    where: { clerkOrgId },
    include: {
      town: true,
      members: true,
    },
  })
})
