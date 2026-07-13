'use client'

import { useState } from 'react'

type Enquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  partySize: number | null
  status: string
  read: boolean
  createdAt: string
  post: { id: string; type: string; title: string } | null
}

type Filter = 'all' | 'unread' | 'replied' | 'closed'

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  NEW:     { bg: '#FAEEDA', color: '#633806', label: 'New' },
  READ:    { bg: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', label: 'Read' },
  REPLIED: { bg: '#E1F5EE', color: '#085041', label: 'Replied' },
  CLOSED:  { bg: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', label: 'Closed' },
}

const POST_TYPE_LABELS: Record<string, string> = {
  TABLE: 'Last-min table', DEAL: 'Deal', EVENT: 'Event', ANNOUNCEMENT: 'Announcement',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function EnquiryCard({
  enquiry,
  businessEmail,
  onStatusChange,
}: {
  enquiry: Enquiry
  businessEmail: string
  onStatusChange: (id: string, status: string, read: boolean) => void
}) {
  const [expanded, setExpanded] = useState(!enquiry.read)
  const style = STATUS_STYLES[enquiry.status] ?? STATUS_STYLES.NEW

  async function markStatus(status: string) {
    await fetch(`/api/enquiries/${enquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, read: true }),
    })
    onStatusChange(enquiry.id, status, true)
  }

  async function markRead() {
    if (enquiry.read) return
    await fetch(`/api/enquiries/${enquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true, status: enquiry.status === 'NEW' ? 'READ' : enquiry.status }),
    })
    onStatusChange(enquiry.id, enquiry.status === 'NEW' ? 'READ' : enquiry.status, true)
  }

  const replySubject = enquiry.post
    ? `Re: Your enquiry about ${enquiry.post.title}`
    : `Re: Your enquiry via Twncryr`

  return (
    <div
      className={`bg-[var(--color-background-primary)] border rounded-xl mb-2.5 overflow-hidden transition-all ${
        !enquiry.read ? 'border-[#FAC775]' : 'border-[var(--color-border-tertiary)]'
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => { setExpanded(!expanded); markRead() }}
      >
        {/* Unread dot */}
        <div className="mt-1.5 flex-shrink-0">
          {!enquiry.read
            ? <div className="w-2 h-2 rounded-full bg-[#0F6E56]" />
            : <div className="w-2 h-2 rounded-full bg-transparent" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {enquiry.name}
            </span>
            {enquiry.partySize && (
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                · Party of {enquiry.partySize}
              </span>
            )}
            <span className="text-[11px] text-[var(--color-text-secondary)] ml-auto">
              {timeAgo(enquiry.createdAt)}
            </span>
          </div>

          {enquiry.post && (
            <p className="text-[11px] text-[var(--color-text-secondary)] mb-1">
              Re: <span className="text-[#0F6E56]">{POST_TYPE_LABELS[enquiry.post.type]}</span>
              {' '}— {enquiry.post.title}
            </p>
          )}

          {!expanded && enquiry.message && (
            <p className="text-[12px] text-[var(--color-text-secondary)] truncate">
              {enquiry.message}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>

        <i
          className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} text-[13px] text-[var(--color-text-secondary)] flex-shrink-0`}
          aria-hidden="true"
        />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border-tertiary)] pt-3 ml-5">

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Email</p>
              <a href={`mailto:${enquiry.email}`} className="text-[13px] text-[#0F6E56] hover:underline">
                {enquiry.email}
              </a>
            </div>
            {enquiry.phone && (
              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Phone</p>
                <a href={`tel:${enquiry.phone}`} className="text-[13px] text-[var(--color-text-primary)]">
                  {enquiry.phone}
                </a>
              </div>
            )}
            {enquiry.partySize && (
              <div>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Party size</p>
                <p className="text-[13px] text-[var(--color-text-primary)]">{enquiry.partySize} people</p>
              </div>
            )}
          </div>

          {enquiry.message && (
            <div className="bg-[var(--color-background-secondary)] rounded-lg px-3 py-2.5 mb-3">
              <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">Message</p>
              <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed">{enquiry.message}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <a
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(replySubject)}`}
              onClick={() => markStatus('REPLIED')}
              className="flex items-center gap-1.5 text-[12px] font-medium bg-[#0F6E56] text-[#E1F5EE] px-3.5 py-2 rounded-lg no-underline hover:bg-[#085041] transition-colors"
            >
              <i className="ti ti-mail text-[13px]" aria-hidden="true" />
              Reply by email
            </a>
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone}`}
                className="flex items-center gap-1.5 text-[12px] font-medium bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] px-3.5 py-2 rounded-lg no-underline hover:bg-[var(--color-background-tertiary)] transition-colors"
              >
                <i className="ti ti-phone text-[13px]" aria-hidden="true" />
                Call
              </a>
            )}
            {enquiry.status !== 'CLOSED' && (
              <button
                onClick={() => markStatus('CLOSED')}
                className="text-[12px] text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-tertiary)] px-3.5 py-2 rounded-lg cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors font-sans ml-auto"
              >
                Mark closed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EnquiryInbox({
  enquiries: initial,
  businessEmail,
}: {
  enquiries: Enquiry[]
  businessEmail: string
}) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initial)
  const [filter, setFilter]       = useState<Filter>('all')

  function handleStatusChange(id: string, status: string, read: boolean) {
    setEnquiries(prev =>
      prev.map(e => e.id === id ? { ...e, status, read } : e)
    )
  }

  const filtered = enquiries.filter(e => {
    if (filter === 'unread')  return !e.read
    if (filter === 'replied') return e.status === 'REPLIED'
    if (filter === 'closed')  return e.status === 'CLOSED'
    return true
  })

  const counts = {
    all:     enquiries.length,
    unread:  enquiries.filter(e => !e.read).length,
    replied: enquiries.filter(e => e.status === 'REPLIED').length,
    closed:  enquiries.filter(e => e.status === 'CLOSED').length,
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl">
        <i className="ti ti-inbox text-[36px] text-[var(--color-border-secondary)] block mb-3" aria-hidden="true" />
        <p className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1">No enquiries yet</p>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Post a last-minute table or deal to start getting messages from locals.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {([
          { value: 'all',     label: `All (${counts.all})` },
          { value: 'unread',  label: `Unread (${counts.unread})` },
          { value: 'replied', label: `Replied (${counts.replied})` },
          { value: 'closed',  label: `Closed (${counts.closed})` },
        ] as { value: Filter; label: string }[]).map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-[12px] px-3 py-1.5 rounded-full border cursor-pointer transition-colors font-sans ${
              filter === f.value
                ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                : 'bg-transparent border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center py-8 text-[13px] text-[var(--color-text-secondary)]">
          No {filter} enquiries.
        </p>
      ) : (
        filtered.map(e => (
          <EnquiryCard
            key={e.id}
            enquiry={e}
            businessEmail={businessEmail}
            onStatusChange={handleStatusChange}
          />
        ))
      )}
    </div>
  )
}
