import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const townSlug = searchParams.get('town')

  if (!q || !townSlug) return NextResponse.json({ businesses: [] })

  const businesses = await prisma.business.findMany({
    where: {
      town: { slug: townSlug },
      active: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true, name: true, slug: true, category: true,
      address: true, phone: true, website: true,
    },
    take: 10,
  })

  return NextResponse.json({ businesses })
}
