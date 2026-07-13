import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'CLOSED']).optional(),
  read:   z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params

  const business = await prisma.business.findUnique({ where: { clerkOrgId: orgId } })
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const enquiry = await prisma.enquiry.findFirst({
    where: { id, businessId: business.id },
  })
  if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const updated = await prisma.enquiry.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ enquiry: updated })
}
