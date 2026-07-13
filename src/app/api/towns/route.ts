import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const towns = await prisma.town.findMany({
    where: { active: true },
    select: { id: true, slug: true, name: true, county: true, region: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ towns })
}
