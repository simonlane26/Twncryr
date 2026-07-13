'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type PostType = 'TABLE' | 'DEAL' | 'EVENT'

type TypeConfig = {
  label: string
  icon: string
  placeholder: string
  color: string
}

const TYPE_CONFIG: Record<PostType, TypeConfig> = {
  TABLE: {
    label:       'Last-min table',
    icon:        'ti-clock',
    placeholder: 'e.g. Two tables free tonight — 7pm and 8:30pm. Set menu available. Walk in or book below.',
    color:       '#854F0B',
  },
  DEAL: {
    label:       'Deal / offer',
    icon:        'ti-tag',
    placeholder: 'e.g. 20% off all afternoon teas today only — market day special. Walk-ins welcome until 4pm.',
    color:       '#0F6E56',
  },
  EVENT: {
    label:       'Event',
    icon:        'ti-calendar',
    placeholder: 'e.g. Wine tasting evening — Saturday 14th June, 7pm. Six wines, canapés, £45pp. Limited to 24 guests.',
    color:       '#185FA5',
  },
}

const EXPIRY_OPTIONS = [
  { label: 'Expires in 1 hour',   value: 1 },
  { label: 'Expires in 3 hours',  value: 3 },
  { label: 'Expires tonight',     value: 12 },
  { label: 'Expires today',       value: 24 },
  { label: 'Expires tomorrow',    value: 48 },
  { label: 'No expiry',           value: 0 },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function hoursFromNow(hours: number): string {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000)
  return d.toISOString()
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function PostComposer({
  businessId,
  townSlug,
  googleConnected = false,
}: {
  businessId: string
  townSlug: string
  googleConnected?: boolean
}) {
  const router = useRouter()
  const [type, setType]         = useState<PostType>('TABLE')
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [expiry, setExpiry]     = useState(12)
  const [discount, setDiscount] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [tableCount, setTableCount] = useState('2')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished]   = useState(false)
  const [error, setError]           = useState('')
  const [shareToGoogle, setShareToGoogle] = useState(false)
  const [googleSharing, setGoogleSharing] = useState(false)
  const [googleResult, setGoogleResult]   = useState<'ok' | 'error' | null>(null)

  const config = TYPE_CONFIG[type]

  function handleTypeChange(t: PostType) {
    setType(t)
    setTitle('')
    setBody('')
    setError('')
  }

  async function handlePublish() {
    if (!body.trim()) {
      setError('Please add a description before publishing.')
      return
    }

    const autoTitle = title.trim() || body.split(/[.!?—]/)[0].trim().slice(0, 80)

    setPublishing(true)
    setError('')
    setGoogleResult(null)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: autoTitle,
          body: body.trim(),
          expiresAt:    expiry > 0 ? hoursFromNow(expiry) : null,
          startsAt:     type === 'EVENT' && eventDate ? new Date(eventDate).toISOString() : null,
          tableCount:   type === 'TABLE' ? parseInt(tableCount) || null : null,
          discountText: type === 'DEAL' && discount ? discount : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to publish')
      }

      setPublished(true)
      setTimeout(() => setPublished(false), 4000)

      if (shareToGoogle) {
        setGoogleSharing(true)
        try {
          const gRes = await fetch('/api/google/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: autoTitle, body: body.trim(), type }),
          })
          setGoogleResult(gRes.ok ? 'ok' : 'error')
        } catch {
          setGoogleResult('error')
        } finally {
          setGoogleSharing(false)
        }
      }

      setTitle('')
      setBody('')
      setDiscount('')
      setEventDate('')
      router.refresh()

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
          <i className="ti ti-speakerphone text-[14px] text-[#0F6E56]" aria-hidden="true" />
          Post something
        </p>
        {published && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#085041] flex items-center gap-1.5">
            <i className="ti ti-circle-check text-[13px]" aria-hidden="true" />
            Published live
          </span>
        )}
      </div>

      {/* Post type selector */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {(Object.keys(TYPE_CONFIG) as PostType[]).map(t => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`flex flex-col items-center gap-1 py-2 px-2 border rounded-lg text-[11px] cursor-pointer font-sans transition-all ${
              type === t
                ? 'border-[#5DCAA5] bg-[#E1F5EE] text-[#085041] font-medium'
                : 'border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5] hover:text-[#085041]'
            }`}
          >
            <i className={`ti ${TYPE_CONFIG[t].icon} text-[16px]`} aria-hidden="true" />
            {TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Title — optional, auto-generated if blank */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title (optional — we'll generate one from your description)"
        className="w-full text-[12px] px-3 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors mb-2 font-sans"
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={e => { setBody(e.target.value); setError('') }}
        placeholder={config.placeholder}
        rows={3}
        className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none mb-2 font-sans leading-relaxed"
      />

      {/* Type-specific fields */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Expiry — all types */}
        <div>
          <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">Expires</label>
          <select
            value={expiry}
            onChange={e => setExpiry(parseInt(e.target.value))}
            className="w-full text-[12px] px-2.5 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans"
          >
            {EXPIRY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Table-specific: number of tables */}
        {type === 'TABLE' && (
          <div>
            <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">Tables available</label>
            <select
              value={tableCount}
              onChange={e => setTableCount(e.target.value)}
              className="w-full text-[12px] px-2.5 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans"
            >
              {['1', '2', '3', '4', '5+'].map(n => (
                <option key={n} value={n}>{n} table{n !== '1' ? 's' : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Deal-specific: discount text */}
        {type === 'DEAL' && (
          <div>
            <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">Discount</label>
            <input
              type="text"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              placeholder='e.g. "20% off"'
              className="w-full text-[12px] px-2.5 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans"
            />
          </div>
        )}

        {/* Event-specific: date */}
        {type === 'EVENT' && (
          <div>
            <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1">Event date</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full text-[12px] px-2.5 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans"
            />
          </div>
        )}
      </div>

      {/* Character count */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] ${body.length > 450 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'}`}>
          {body.length}/500
        </span>
        {body.length > 0 && (
          <button
            onClick={() => { setBody(''); setTitle('') }}
            className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[12px] text-[var(--color-text-danger)] mb-2 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Google Business Profile share toggle */}
      <div className="mb-3">
        {googleConnected ? (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shareToGoogle}
              onChange={e => setShareToGoogle(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0F6E56] cursor-pointer"
            />
            <span className="text-[12px] text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Also share to Google Business Profile
            </span>
          </label>
        ) : (
          <a
            href="/api/google/connect"
            className="text-[12px] text-[var(--color-text-secondary)] hover:text-[#0F6E56] no-underline flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Google Business Profile to share posts automatically →
          </a>
        )}

        {/* Google share result feedback */}
        {googleSharing && (
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 flex items-center gap-1">
            <i className="ti ti-loader-2 animate-spin text-[12px]" aria-hidden="true" />
            Sharing to Google…
          </p>
        )}
        {googleResult === 'ok' && (
          <p className="text-[11px] text-[#085041] mt-1.5 flex items-center gap-1">
            <i className="ti ti-circle-check text-[12px]" aria-hidden="true" />
            Shared to Google Business Profile
          </p>
        )}
        {googleResult === 'error' && (
          <p className="text-[11px] text-[var(--color-text-danger)] mt-1.5 flex items-center gap-1">
            <i className="ti ti-alert-circle text-[12px]" aria-hidden="true" />
            Google share failed — post still published to Twncryr
          </p>
        )}
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        disabled={publishing || !body.trim()}
        className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center justify-center gap-2"
      >
        {publishing ? (
          <>
            <i className="ti ti-loader-2 animate-spin text-[14px]" aria-hidden="true" />
            Publishing…
          </>
        ) : (
          <>
            <i className="ti ti-send text-[14px]" aria-hidden="true" />
            Publish to Twncryr
          </>
        )}
      </button>
    </div>
  )
}
