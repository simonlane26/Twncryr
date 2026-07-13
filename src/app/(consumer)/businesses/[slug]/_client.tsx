'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Business, Post, Town } from '@prisma/client'
import {
  Clock, Tag, CalendarBlank, Megaphone, Phone, Globe, MapPin,
  ChatText, BookmarkSimple, Star, CaretRight, Image as ImageIcon,
  Storefront,
} from '@phosphor-icons/react'

type BusinessWithPosts = Business & { posts: Post[]; town: Town }
type NearbyBusiness = Pick<Business, 'id' | 'name' | 'slug' | 'category' | 'address' | 'logo'>

type Tab = 'overview' | 'posts' | 'reviews'

const POST_TYPE_STYLES: Record<string, { border: string; btnBg: string; Icon: React.ElementType }> = {
  TABLE:        { border: '#854F0B', btnBg: '#412402', Icon: Clock },
  DEAL:         { border: '#0F6E56', btnBg: '#0F6E56', Icon: Tag },
  EVENT:        { border: '#185FA5', btnBg: '#042C53', Icon: CalendarBlank },
  ANNOUNCEMENT: { border: '#0F6E56', btnBg: '#0F6E56', Icon: Megaphone },
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_DRINK: 'Food & drink', RETAIL: 'Retail', HEALTH_BEAUTY: 'Health & beauty',
  SERVICES: 'Services', ARTS_CULTURE: 'Arts & culture', ACCOMMODATION: 'Accommodation',
  FITNESS: 'Fitness', EDUCATION: 'Education', OTHER: 'Other',
}

type EnquiryType = 'table' | 'event' | 'general'

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-[13px] px-3 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
      />
    </div>
  )
}

function EnquiryModal({
  business, type, postId, onClose,
}: {
  business: BusinessWithPosts; type: EnquiryType; postId?: string; onClose: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [partySize, setPartySize] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const titles: Record<EnquiryType, string> = {
    table: 'Reserve a table', event: 'Book a place', general: 'Send a message',
  }

  async function handleSubmit() {
    setSending(true)
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id, postId: postId ?? null,
          name, email, phone: phone || null, message: message || null,
          partySize: partySize ? parseInt(partySize) : null,
        }),
      })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[var(--color-background-primary)] rounded-xl border border-[var(--color-border-tertiary)] p-6 w-full max-w-sm">
        {sent ? (
          <div className="text-center py-4">
            <p className="font-[family-name:var(--font-fraunces)] text-[18px] mb-2">Enquiry sent!</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {business.name} will be in touch shortly.
            </p>
            <button onClick={onClose} className="w-full bg-[#0F6E56] text-[#E1F5EE] py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-[family-name:var(--font-fraunces)] text-[18px] mb-1">{titles[type]}</h2>
            <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">{business.name}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Your name" value={name} onChange={setName} placeholder="Jane Smith" />
              {type !== 'general' && (
                <Field label="Party size" value={partySize} onChange={setPartySize} type="number" placeholder="2" />
              )}
            </div>
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="jane@example.com" />
            <Field label="Phone (optional)" value={phone} onChange={setPhone} type="tel" placeholder="07700 000000" />
            <div className="mb-3">
              <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">Message (optional)</label>
              <input
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Any dietary requirements or requests?"
                className="w-full text-[13px] px-3 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={sending || !name || !email}
              className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer hover:bg-[#085041] transition-colors mb-2"
            >
              {sending ? 'Sending…' : 'Send enquiry'}
            </button>
            <button onClick={onClose} className="w-full bg-transparent text-[var(--color-text-secondary)] border-none text-[12px] cursor-pointer py-1.5">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function BusinessProfileClient({
  business, town, nearby, isOpenNow, todayHours,
}: {
  business: BusinessWithPosts
  town: Town
  nearby: NearbyBusiness[]
  isOpenNow: boolean
  todayHours: { open: string; close: string; closed?: boolean } | null
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [enquiry, setEnquiry] = useState<{ type: EnquiryType; postId?: string } | null>(null)

  const activePosts = business.posts.filter(p => p.active)
  const hours = business.openingHours as any

  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIndex = (new Date().getDay() + 6) % 7

  return (
    <div className="font-sans bg-[var(--color-background-tertiary)] min-h-screen">

      {/* Photo strip */}
      <div
        className="h-[200px] grid gap-0.5 overflow-hidden"
        style={{ gridTemplateColumns: business.photos.length > 1 ? '2fr 1fr 1fr' : '1fr' }}
      >
        <div className="bg-[#085041] flex items-center justify-center relative">
          {business.photos[0]
            ? <img src={business.photos[0]} alt={business.name} className="w-full h-full object-cover" />
            : <Storefront size={64} className="text-[#5DCAA5]" />
          }
          {business.photos.length > 0 && (
            <button className="absolute bottom-2.5 right-2.5 bg-black/55 text-white text-[11px] px-2.5 py-1 rounded-md border-none cursor-pointer flex items-center gap-1.5">
              <ImageIcon size={11} /> See all photos
            </button>
          )}
        </div>
        {business.photos.slice(1, 3).map((photo, i) => (
          <img key={i} src={photo} alt="" className="w-full h-full object-cover" />
        ))}
      </div>

      {/* Hero meta */}
      <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 py-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-fraunces)] text-[24px] font-semibold mb-1">{business.name}</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
              {CATEGORY_LABELS[business.category]} · {business.address}
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${isOpenNow ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-[#0F6E56]' : 'bg-[var(--color-text-secondary)]'}`} />
                {isOpenNow
                  ? `Open now · Closes ${todayHours?.close}`
                  : todayHours?.closed ? 'Closed today' : `Opens ${todayHours?.open}`
                }
              </span>
              {activePosts.some(p => p.type === 'TABLE') && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAEEDA] text-[#633806]">Table available tonight</span>
              )}
              {activePosts.some(p => p.type === 'DEAL') && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#E1F5EE] text-[#085041]">Deal on now</span>
              )}
            </div>
            <div className="flex gap-3 flex-wrap text-[12px] text-[var(--color-text-secondary)]">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-[#0F6E56] hover:underline">
                  <Phone size={13} />{business.phone}
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0F6E56] hover:underline">
                  <Globe size={13} />{business.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {business.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />{business.address}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[150px]">
            <button
              onClick={() => setEnquiry({ type: 'table' })}
              className="bg-[#0F6E56] text-[#E1F5EE] border-none py-2.5 px-4 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#085041] transition-colors"
            >
              Reserve a table
            </button>
            <button
              onClick={() => setEnquiry({ type: 'general' })}
              className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] py-2.5 px-4 rounded-lg text-[13px] cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors flex items-center justify-center gap-1.5"
            >
              <ChatText size={14} /> Message
            </button>
            <button className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] py-2.5 px-4 rounded-lg text-[13px] cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors flex items-center justify-center gap-1.5">
              <BookmarkSimple size={14} /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid gap-4 p-5" style={{ gridTemplateColumns: '1fr 280px' }}>
        <div>
          <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl overflow-hidden">
            <div className="flex border-b border-[var(--color-border-tertiary)]">
              {(['overview', 'posts', 'reviews'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-[13px] cursor-pointer border-none bg-transparent border-b-2 capitalize transition-colors ${
                    tab === t
                      ? 'text-[#0F6E56] border-[#0F6E56] font-medium'
                      : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {t === 'posts' ? `Live posts${activePosts.length > 0 ? ` (${activePosts.length})` : ''}` : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-4">
              {tab === 'overview' && (
                <div>
                  {business.description
                    ? <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{business.description}</p>
                    : <p className="text-[14px] text-[var(--color-text-secondary)] italic">No description added yet.</p>
                  }
                </div>
              )}

              {tab === 'posts' && (
                <div>
                  {activePosts.length === 0 ? (
                    <p className="text-[13px] text-[var(--color-text-secondary)] py-4 text-center">No live posts right now.</p>
                  ) : (
                    activePosts.map(post => {
                      const style = POST_TYPE_STYLES[post.type] ?? POST_TYPE_STYLES.DEAL
                      return (
                        <div
                          key={post.id}
                          className="border border-[var(--color-border-tertiary)] rounded-r-xl p-3.5 mb-2.5"
                          style={{ borderLeft: `3px solid ${style.border}`, borderRadius: '0 8px 8px 0' }}
                        >
                          <div className="flex items-center gap-1.5 text-[13px] font-medium mb-1.5" style={{ color: style.border }}>
                            <style.Icon size={13} />
                            <span className="text-[var(--color-text-primary)]">{post.title}</span>
                          </div>
                          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-2.5">{post.body}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--color-text-secondary)]">
                              {post.expiresAt
                                ? `Expires ${new Date(post.expiresAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                                : post.startsAt
                                ? `${new Date(post.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                : 'Live now'
                              }
                            </span>
                            <button
                              onClick={() => setEnquiry({ type: post.type === 'TABLE' ? 'table' : post.type === 'EVENT' ? 'event' : 'general', postId: post.id })}
                              className="text-[11px] font-medium text-[#E1F5EE] border-none px-3 py-1.5 rounded-lg cursor-pointer"
                              style={{ background: style.btnBg }}
                            >
                              {post.type === 'TABLE' ? 'Enquire' : post.type === 'EVENT' ? 'Book a place' : 'Find out more'}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {tab === 'reviews' && (
                <div className="py-4 text-center">
                  <Star size={32} className="text-[var(--color-border-secondary)] mx-auto mb-3" />
                  <p className="text-[13px] text-[var(--color-text-secondary)]">Reviews coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-3">
            <p className="text-[10px] font-medium tracking-[1.2px] uppercase text-[var(--color-text-secondary)] mb-3">Opening hours</p>
            <div className="flex flex-col">
              {DAYS.map((day, i) => {
                const h = hours?.[day]
                const isToday = i === todayIndex
                return (
                  <div
                    key={day}
                    className={`flex justify-between py-1.5 text-[13px] border-b border-[var(--color-border-tertiary)] last:border-none ${isToday ? 'text-[#0F6E56] font-medium' : ''}`}
                  >
                    <span className={isToday ? 'text-[#0F6E56]' : 'text-[var(--color-text-secondary)]'}>{DAY_LABELS[i]}</span>
                    <span>{h?.closed ? 'Closed' : h ? `${h.open} – ${h.close}` : '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-3">
            <p className="text-[10px] font-medium tracking-[1.2px] uppercase text-[var(--color-text-secondary)] mb-3">Location</p>
            <div className="bg-[var(--color-background-secondary)] rounded-lg h-[110px] flex flex-col items-center justify-center gap-1.5 text-[12px] text-[var(--color-text-secondary)] mb-3 border border-[var(--color-border-tertiary)] cursor-pointer hover:bg-[var(--color-background-tertiary)] transition-colors">
              <MapPin size={22} className="text-[#0F6E56]" />
              {business.address}
            </div>
          </div>

          {nearby.length > 0 && (
            <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-3">
              <p className="text-[10px] font-medium tracking-[1.2px] uppercase text-[var(--color-text-secondary)] mb-3">Nearby businesses</p>
              {nearby.map((biz, i) => (
                <Link
                  key={biz.id}
                  href={`/businesses/${biz.slug}`}
                  className={`flex items-center gap-2.5 py-2 no-underline ${i < nearby.length - 1 ? 'border-b border-[var(--color-border-tertiary)]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                    {biz.logo ? <img src={biz.logo} alt="" className="w-full h-full object-cover rounded-lg" /> : <Storefront size={16} className="text-[#085041]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate hover:text-[#0F6E56]">{biz.name}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">{CATEGORY_LABELS[biz.category]}</p>
                  </div>
                  <CaretRight size={13} className="text-[var(--color-text-secondary)]" />
                </Link>
              ))}
            </div>
          )}

          <div className="bg-[#085041] rounded-xl p-4 text-center">
            <p className="font-[family-name:var(--font-fraunces)] text-[14px] text-[#E1F5EE] mb-1.5">Own a business in {town.name}?</p>
            <p className="text-[11px] text-[#9FE1CB] leading-relaxed mb-3">Get your free listing and start posting deals today.</p>
            <Link href="/onboarding" className="block w-full bg-[#E1F5EE] text-[#085041] py-2 rounded-lg text-[12px] font-medium text-center no-underline hover:bg-white transition-colors">
              Claim your listing →
            </Link>
          </div>
        </div>
      </div>

      {enquiry && (
        <EnquiryModal
          business={business}
          type={enquiry.type}
          postId={enquiry.postId}
          onClose={() => setEnquiry(null)}
        />
      )}
    </div>
  )
}
