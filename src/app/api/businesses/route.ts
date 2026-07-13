import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const townSlug = searchParams.get('town')
  const category = searchParams.get('category')

  if (!townSlug) return NextResponse.json({ error: 'town is required' }, { status: 400 })

  const businesses = await prisma.business.findMany({
    where: {
      town: { slug: townSlug },
      active: true,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      id: true, name: true, slug: true, tagline: true, category: true,
      address: true, phone: true, logo: true, verified: true, featured: true,
    },
  })

  return NextResponse.json({ businesses })
}
