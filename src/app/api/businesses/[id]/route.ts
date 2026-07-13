import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  tagline: z.string().max(120).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  postcode: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  website: z.union([z.string().url(), z.literal('')]).optional(),
  openingHours: z.record(z.string(), z.unknown()).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params

  const business = await prisma.business.findUnique({ where: { id } })
  if (!business || business.clerkOrgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { openingHours, ...rest } = parsed.data

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...rest,
      ...(openingHours !== undefined ? { openingHours: openingHours as object } : {}),
    },
    select: {
      id: true, name: true, slug: true, tagline: true, description: true,
      category: true, subCategory: true, address: true, postcode: true,
      phone: true, email: true, website: true, logo: true, photos: true,
      openingHours: true, claimed: true, verified: true, active: true,
      createdAt: true, updatedAt: true,
    },
  })

  return NextResponse.json({ business: updated })
}
