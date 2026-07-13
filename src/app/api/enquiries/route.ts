import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimitIP } from '@/lib/ratelimit'

const enquirySchema = z.object({
  businessId: z.string().cuid(),
  postId: z.string().cuid().nullable().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional().nullable(),
  message: z.string().max(500).optional().nullable(),
  partySize: z.number().int().positive().optional().nullable(),
})

export async function POST(req: NextRequest) {
  if (!rateLimitIP(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const business = await prisma.business.findUnique({
    where: { id: parsed.data.businessId, active: true },
  })

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const enquiry = await prisma.enquiry.create({
    data: {
      businessId: parsed.data.businessId,
      postId: parsed.data.postId ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      message: parsed.data.message ?? null,
      partySize: parsed.data.partySize ?? null,
    },
  })

  return NextResponse.json({ enquiry }, { status: 201 })
}
