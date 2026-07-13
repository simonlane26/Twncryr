import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import EnquiryInbox from './_client'

async function getEnquiries(businessId: string) {
  return prisma.enquiry.findMany({
    where: { businessId },
    include: {
      post: { select: { id: true, type: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function EnquiriesPage() {
  const business = await requireBusiness()
  const enquiries = await getEnquiries(business.id)

  const unreadCount = enquiries.filter(e => !e.read).length

  const serialised = enquiries.map(e => ({
    id:        e.id,
    name:      e.name,
    email:     e.email,
    phone:     e.phone,
    message:   e.message,
    partySize: e.partySize,
    status:    e.status,
    read:      e.read,
    createdAt: e.createdAt.toISOString(),
    post:      e.post ? {
      id:    e.post.id,
      type:  e.post.type,
      title: e.post.title,
    } : null,
  }))

  return (
    <div className="p-5 max-w-[720px]">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-[22px] text-[var(--color-text-primary)]">
            Enquiries
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            Messages from locals about your posts and listing
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-[#FAEEDA] text-[#633806]">
            {unreadCount} unread
          </span>
        )}
      </div>

      <EnquiryInbox
        enquiries={serialised}
        businessEmail={business.email ?? ''}
      />
    </div>
  )
}
