import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ url: z.string().url() })

export async function DELETE(
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
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const updated = await prisma.business.update({
    where: { id },
    data: { photos: business.photos.filter(p => p !== parsed.data.url) },
  })

  return NextResponse.json({ photos: updated.photos })
}
