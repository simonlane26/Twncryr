'use client'

import { useState } from 'react'
import {
  Clock, Tag, CalendarBlank, Megaphone, X, Storefront, CircleNotch,
} from '@phosphor-icons/react'
import { useTownFeed, useToastNotifications, type LivePost } from './useTownFeed'
import type { NewPostPayload } from '@/lib/pusher-server'

const POST_STYLES = {
  TABLE:        { border: '#854F0B', btnBg: '#412402', tagBg: '#FAEEDA', tagColor: '#633806', Icon: Clock,        label: 'Last-min table', cta: 'Enquire' },
  DEAL:         { border: '#0F6E56', btnBg: '#0F6E56', tagBg: '#E1F5EE', tagColor: '#085041', Icon: Tag,          label: 'Deal',           cta: 'View deal' },
  EVENT:        { border: '#185FA5', btnBg: '#042C53', tagBg: '#E6F1FB', tagColor: '#042C53', Icon: CalendarBlank, label: 'Event',         cta: 'Book a place' },
  ANNOUNCEMENT: { border: '#0F6E56', btnBg: '#0F6E56', tagBg: '#E1F5EE', tagColor: '#085041', Icon: Megaphone,   label: 'Announcement',   cta: 'Read more' },
} as const

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ToastItem({
  post,
  removing,
  onDismiss,
}: {
  post: NewPostPayload
  removing: boolean
  onDismiss: () => void
}) {
  const style = POST_STYLES[post.type as keyof typeof POST_STYLES] ?? POST_STYLES.DEAL

  return (
    <div
      className="relative bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-r-xl p-3 min-w-[240px] max-w-[280px] shadow-lg transition-all duration-300"
      style={{
        borderLeft: `3px solid ${style.border}`,
        opacity: removing ? 0 : 1,
        transform: removing ? 'translateX(16px)' : 'translateX(0)',
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[var(--color-text-primary)]"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-primary)] mb-1 pr-5">
        <style.Icon size={13} style={{ color: style.border }} />
        {post.business.name}
      </div>
      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
        Just posted: {post.title}
      </p>
    </div>
  )
}

export function ToastContainer({ townSlug }: { townSlug: string }) {
  const { toasts, dismissToast } = useToastNotifications({ townSlug })

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            post={t.post}
            removing={t.removing}
            onDismiss={() => dismissToast(t.id)}
          />
        </div>
      ))}
    </div>
  )
}

const CONNECTION_STYLES = {
  connected:    { dotCls: 'bg-[#0F6E56] animate-pulse', label: 'Live',               color: 'text-[#085041]', bg: 'bg-[#E1F5EE] border-[#5DCAA5]' },
  connecting:   { dotCls: 'bg-amber-400 animate-pulse', label: 'Connecting…',        color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  disconnected: { dotCls: 'bg-[var(--color-text-secondary)]', label: 'Offline',      color: 'text-[var(--color-text-secondary)]', bg: 'bg-[var(--color-background-secondary)] border-[var(--color-border-tertiary)]' },
  failed:       { dotCls: 'bg-red-400',                  label: 'Connection failed', color: 'text-red-700',   bg: 'bg-red-50 border-red-200' },
}

export function ConnectionBadge({ state }: { state: keyof typeof CONNECTION_STYLES }) {
  const s = CONNECTION_STYLES[state]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dotCls}`} />
      {s.label}
    </span>
  )
}

function PostCard({
  post,
  onEnquire,
}: {
  post: LivePost
  onEnquire: (post: LivePost) => void
}) {
  const style = POST_STYLES[post.type as keyof typeof POST_STYLES] ?? POST_STYLES.DEAL

  return (
    <div
      className="border border-[var(--color-border-tertiary)] rounded-r-xl p-3.5 mb-2.5 transition-all duration-500"
      style={{
        borderLeft: `3px solid ${style.border}`,
        background: post.isNew ? '#F0FBF7' : 'var(--color-background-primary)',
        borderColor: post.isNew ? '#5DCAA5' : 'var(--color-border-tertiary)',
        animation: post.isNew ? 'slideIn 0.4s ease-out' : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-md"
          style={{ background: style.tagBg, color: style.tagColor }}
        >
          {style.label}
        </span>
        {post.isNew && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#0F6E56] text-[#E1F5EE]">
            NEW
          </span>
        )}
        <span className="text-[11px] text-[var(--color-text-secondary)] ml-auto">
          {timeAgo(post.createdAt)}
        </span>
      </div>

      <p className="text-[13px] font-medium text-[var(--color-text-primary)] mb-1.5">{post.title}</p>
      <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-2.5">{post.body}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
          <div className="w-5 h-5 rounded bg-[#E1F5EE] flex items-center justify-center">
            <Storefront size={11} className="text-[#085041]" />
          </div>
          {post.business.name}
        </div>
        <button
          onClick={() => onEnquire(post)}
          className="text-[11px] font-medium text-[#E1F5EE] border-none px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: style.btnBg }}
        >
          {style.cta}
        </button>
      </div>

      {post.expiresAt && (
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-2 flex items-center gap-1">
          <Clock size={11} /> Expires{' '}
          {new Date(post.expiresAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

export default function LiveFeed({
  townSlug,
  initialPosts,
  filter,
}: {
  townSlug: string
  initialPosts: LivePost[]
  filter?: 'TABLE' | 'DEAL' | 'EVENT' | null
}) {
  const { posts, connectionState, newPostCount, clearNewCount } = useTownFeed({
    townSlug,
    initialPosts,
  })
  const [, setEnquiryPost] = useState<LivePost | null>(null)

  const filtered = filter ? posts.filter(p => p.type === filter) : posts

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <p className="text-[10px] font-medium tracking-[1.3px] uppercase text-[var(--color-text-secondary)]">
            {filter === 'TABLE' ? 'Last-minute tables tonight' : 'Live posts'}
          </p>
          {filtered.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#E1F5EE] text-[#085041]">
              {filtered.length} live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {newPostCount > 0 && (
            <button
              onClick={clearNewCount}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#0F6E56] text-[#E1F5EE] border-none cursor-pointer"
            >
              {newPostCount} new
            </button>
          )}
          <ConnectionBadge state={connectionState} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={28} className="text-[var(--color-border-secondary)] mx-auto mb-2" />
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {filter === 'TABLE' ? 'No tables available right now — check back later.' : 'No live posts yet.'}
          </p>
        </div>
      ) : (
        filtered.map(post => (
          <PostCard key={post.id} post={post} onEnquire={setEnquiryPost} />
        ))
      )}
    </>
  )
}
