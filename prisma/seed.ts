import { PrismaClient, BusinessCategory, PostType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding TwnCryr...')

  const nantwich = await prisma.town.upsert({
    where: { slug: 'nantwich' },
    update: {},
    create: {
      slug: 'nantwich',
      name: 'Nantwich',
      county: 'Cheshire',
      region: 'North West',
      description:
        'A historic market town in Cheshire, famous for its Tudor architecture, independent businesses, and the annual Food & Drink Festival.',
      active: true,
      launchedAt: new Date(),
    },
  })

  console.log('✅ Town: Nantwich')

  const businesses = [
    {
      name: 'The Millstone Kitchen',
      slug: 'the-millstone-kitchen',
      category: BusinessCategory.FOOD_DRINK,
      tagline: 'Modern British cuisine in the heart of Nantwich',
      address: 'Hospital Street, Nantwich',
      postcode: 'CW5 5RP',
      phone: '01270 610083',
      website: 'https://millstonekitchen.co.uk',
      openingHours: {
        mon: { open: '12:00', close: '22:00', closed: false },
        tue: { open: '12:00', close: '22:00', closed: false },
        wed: { open: '12:00', close: '22:00', closed: false },
        thu: { open: '12:00', close: '22:00', closed: false },
        fri: { open: '12:00', close: '23:00', closed: false },
        sat: { open: '11:00', close: '23:00', closed: false },
        sun: { open: '11:00', close: '21:00', closed: false },
      },
    },
    {
      name: 'Cheshire Book Nook',
      slug: 'cheshire-book-nook',
      category: BusinessCategory.RETAIL,
      tagline: 'Independent bookshop with character',
      address: 'Pillory Street, Nantwich',
      postcode: 'CW5 5BG',
      phone: '01270 623001',
    },
    {
      name: 'Petal & Bloom',
      slug: 'petal-and-bloom',
      category: BusinessCategory.RETAIL,
      tagline: 'Fresh flowers, gifts and seasonal arrangements',
      address: 'High Street, Nantwich',
      postcode: 'CW5 5AT',
    },
    {
      name: 'The Cocoa Garden',
      slug: 'the-cocoa-garden',
      category: BusinessCategory.FOOD_DRINK,
      tagline: 'Artisan café and chocolatier',
      address: 'Hospital Street, Nantwich',
      postcode: 'CW5 5RP',
    },
    {
      name: 'Basset & Hound',
      slug: 'basset-and-hound',
      category: BusinessCategory.FOOD_DRINK,
      tagline: 'Dog-friendly gastropub',
      address: 'Barker Street, Nantwich',
      postcode: 'CW5 5EJ',
    },
  ]

  const createdBusinesses: any[] = []

  for (const biz of businesses) {
    const created = await prisma.business.upsert({
      where: { townId_slug: { townId: nantwich.id, slug: biz.slug } },
      update: {},
      create: {
        townId: nantwich.id,
        claimed: false,
        verified: false,
        active: true,
        ...biz,
      },
    })
    createdBusinesses.push(created)
    console.log(`✅ Business: ${biz.name}`)
  }

  const millstone = createdBusinesses[0]

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        businessId: millstone.id,
        type: PostType.TABLE,
        title: '2 tables free tonight — 7pm & 8:30pm',
        body: 'Two tables freed up due to cancellations. Set menu available. Perfect for a spontaneous evening out.',
        tableCount: 2,
        tableSizes: ['2', '4'],
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
      {
        businessId: millstone.id,
        type: PostType.DEAL,
        title: '20% off set lunch — every market day Tuesday',
        body: 'Join us on market Tuesdays for our set lunch menu with 20% off. Two courses from £18.',
        discountText: '20% off',
      },
    ],
  })

  console.log('✅ Seeded posts')

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        townId: nantwich.id,
        title: 'Nantwich Food & Drink Festival',
        description:
          'The annual celebration of food and drink in Nantwich town centre. Over 100 stalls, live music, and chef demos.',
        location: 'Nantwich Town Centre',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-07'),
        allDay: true,
        featured: true,
      },
      {
        townId: nantwich.id,
        title: 'Tuesday Farmers Market',
        description: 'Weekly farmers market with local produce, artisan foods and crafts.',
        location: 'Market Square, Nantwich',
        startDate: new Date('2025-06-10T09:00:00'),
        endDate: new Date('2025-06-10T14:00:00'),
        allDay: false,
      },
    ],
  })

  console.log('✅ Seeded events')
  console.log('\n🎉 Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
