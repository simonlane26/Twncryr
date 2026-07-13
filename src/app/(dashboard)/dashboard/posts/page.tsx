'use client'

import { useState } from 'react'
import { Plus, Clock, Tag, CalendarBlank, Megaphone, Trash } from '@phosphor-icons/react'

type PostType = 'DEAL' | 'TABLE' | 'EVENT' | 'ANNOUNCEMENT'

const POST_TYPE_META: Record<PostType, { label: string; Icon: React.ElementType; color: string }> = {
  TABLE:        { label: 'Last-minute table', Icon: Clock,        color: '#854F0B' },
  DEAL:         { label: 'Deal',              Icon: Tag,          color: '#0F6E56' },
  EVENT:        { label: 'Event',             Icon: CalendarBlank, color: '#185FA5' },
  ANNOUNCEMENT: { label: 'Announcement',      Icon: Megaphone,    color: '#0F6E56' },
}

const TYPE_OPTIONS: PostType[] = ['TABLE', 'DEAL', 'EVENT', 'ANNOUNCEMENT']

const GoogleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function PostsPage() {
  const [showNew, setShowNew] = useState(false)
  const [type, setType] = useState<PostType>('DEAL')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [discountText, setDiscountText] = useState('')
  const [tableCount, setTableCount] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [shareToGoogle, setShareToGoogle] = useState(false)
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'sharing' | 'ok' | 'error' | 'not-connected'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setGoogleStatus('idle')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, title, body,
          discountText: discountText || null,
          tableCount: tableCount ? parseInt(tableCount) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(prev => [data.post, ...prev])

        if (shareToGoogle) {
          setGoogleStatus('sharing')
          try {
            const gRes = await fetch('/api/google/share', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, body, type }),
            })
            if (gRes.ok) {
              setGoogleStatus('ok')
            } else {
              const gData = await gRes.json()
              setGoogleStatus(
                gData.error === 'Google Business Profile not connected'
                  ? 'not-connected'
                  : 'error'
              )
            }
          } catch {
            setGoogleStatus('error')
          }
        }

        setShowNew(false)
        setTitle(''); setBody(''); setDiscountText(''); setTableCount(''); setExpiresAt('')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-fraunces)] text-[22px] font-semibold">Posts</h1>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-[#0F6E56] text-[#E1F5EE] px-4 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer hover:bg-[#085041] transition-colors"
        >
          <Plus size={15} /> New post
        </button>
      </div>

      {/* New post form */}
      {showNew && (
        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-5">
          <h2 className="font-[family-name:var(--font-fraunces)] text-[18px] mb-4">New post</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Type selector */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS.map(t => {
                const { label, Icon } = POST_TYPE_META[t]
                return (
                  <button
                    key={t} type="button" onClick={() => setType(t)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer ${
                      type === t ? 'bg-[#0F6E56] text-[#E1F5EE] border-[#0F6E56]' : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)] hover:border-[#5DCAA5]'
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                )
              })}
            </div>

            <div>
              <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. 2 tables free tonight, 7pm" maxLength={120}
                className="w-full text-[14px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1">Details</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={3} maxLength={500}
                placeholder="Tell people what they need to know…"
                className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {type === 'DEAL' && (
                <div>
                  <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1">Discount text</label>
                  <input value={discountText} onChange={e => setDiscountText(e.target.value)} placeholder="e.g. 20% off" maxLength={50}
                    className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
                  />
                </div>
              )}
              {type === 'TABLE' && (
                <div>
                  <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1">Number of tables</label>
                  <input type="number" min="1" value={tableCount} onChange={e => setTableCount(e.target.value)}
                    className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
                  />
                </div>
              )}
              <div>
                <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1">Expires at (optional)</label>
                <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                  className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5]"
                />
              </div>
            </div>

            {/* Google share toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shareToGoogle}
                onChange={e => setShareToGoogle(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#0F6E56] cursor-pointer"
              />
              <span className="text-[12px] text-(--color-text-secondary) flex items-center gap-1.5">
                <GoogleIcon />
                Also share to Google Business Profile
              </span>
            </label>

            {googleStatus === 'not-connected' && (
              <p className="text-[12px] text-(--color-text-secondary)">
                Google not connected —{' '}
                <a href="/api/google/connect" className="text-[#0F6E56] hover:underline">connect now →</a>
              </p>
            )}
            {googleStatus === 'ok' && (
              <p className="text-[12px] text-[#085041]">Shared to Google Business Profile</p>
            )}
            {googleStatus === 'error' && (
              <p className="text-[12px] text-(--color-text-danger)">Google share failed — post still published to Twncryr</p>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving || !title || !body}
                className="bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] px-5 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer hover:bg-[#085041] transition-colors"
              >
                {saving ? 'Publishing…' : 'Publish post'}
              </button>
              <button type="button" onClick={() => setShowNew(false)}
                className="bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)] px-5 py-2.5 rounded-lg text-[13px] cursor-pointer hover:bg-[var(--color-background-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-8 text-center">
          <Tag size={32} className="text-[var(--color-border-secondary)] mx-auto mb-3" />
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-1">No live posts yet</p>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Post a deal, table alert or event to appear on the public feed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post: any) => {
            const meta = POST_TYPE_META[post.type as PostType] ?? POST_TYPE_META.DEAL
            return (
              <div key={post.id} className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 flex items-start gap-3"
                style={{ borderLeft: `3px solid ${meta.color}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <meta.Icon size={13} style={{ color: meta.color }} />
                    <span className="text-[11px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{post.title}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 truncate">{post.body}</p>
                </div>
                <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-danger)] bg-transparent border-none cursor-pointer p-1 transition-colors">
                  <Trash size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
