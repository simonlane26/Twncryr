'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SerialisedPost = {
  id: string
  type: string
  title: string
  body: string
  expiresAt: string | null
  startsAt: string | null
  createdAt: string
  views: number
  clicks: number
  active: boolean
}

const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  TABLE:        { bg: '#FAEEDA', color: '#633806', icon: 'ti-clock',        label: 'Last-min table' },
  DEAL:         { bg: '#E1F5EE', color: '#085041', icon: 'ti-tag',          label: 'Deal' },
  EVENT:        { bg: '#E6F1FB', color: '#042C53', icon: 'ti-calendar',     label: 'Event' },
  ANNOUNCEMENT: { bg: '#E1F5EE', color: '#085041', icon: 'ti-speakerphone', label: 'Announcement' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function PostRow({
  post,
  onDelete,
}: {
  post: SerialisedPost
  onDelete: (id: string) => void
}) {
  const style = TYPE_STYLES[post.type] ?? TYPE_STYLES.DEAL
  const expired = post.expiresAt && new Date(post.expiresAt) < new Date()

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[var(--color-border-tertiary)] last:border-none">
      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: style.bg }}
      >
        <i className={`ti ${style.icon} text-[13px]`} style={{ color: style.color }} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">
          {post.title}
        </p>
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
          {timeAgo(post.createdAt)}
          {post.expiresAt && (
            <> · {expired ? 'Expired' : `Expires ${new Date(post.expiresAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}</>
          )}
        </p>
        {/* Stats */}
        <div className="flex gap-3 mt-1.5">
          <span className="text-[10px] text-[var(--color-text-secondary)] flex items-center gap-1">
            <i className="ti ti-eye text-[11px]" aria-hidden="true" />
            {post.views} views
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] flex items-center gap-1">
            <i className="ti ti-cursor-text text-[11px]" aria-hidden="true" />
            {post.clicks} clicks
          </span>
        </div>
      </div>

      {/* Status + delete */}
      <div className="flex flex-col items-end gap-1.5">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={
            expired || !post.active
              ? { background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }
              : { background: '#E1F5EE', color: '#085041' }
          }
        >
          {expired || !post.active ? 'Expired' : 'Live'}
        </span>
        <button
          onClick={() => onDelete(post.id)}
          className="text-[10px] text-[var(--color-text-secondary)] hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"
          title="Delete post"
        >
          <i className="ti ti-trash text-[12px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function ActivePosts({
  activePosts,
  recentPosts,
}: {
  activePosts: SerialisedPost[]
  recentPosts: SerialisedPost[]
}) {
  const router = useRouter()
  const [tab, setTab]         = useState<'active' | 'recent'>('active')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remove this post from Twncryr?')) return
    setDeleting(id)
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  const posts = tab === 'active' ? activePosts : recentPosts

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">

      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
          <i className="ti ti-file-text text-[14px] text-[#0F6E56]" aria-hidden="true" />
          Your posts
        </p>
        <a
          href="/dashboard/posts"
          className="text-[11px] text-[#0F6E56] hover:underline no-underline"
        >
          View all
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border-tertiary)] mb-3">
        {(['active', 'recent'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[11px] border-b-2 cursor-pointer bg-transparent border-none font-sans capitalize transition-colors ${
              tab === t
                ? 'text-[#0F6E56] border-[#0F6E56] font-medium'
                : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
            }`}
          >
            {t === 'active' ? `Live${activePosts.length > 0 ? ` (${activePosts.length})` : ''}` : 'Recent'}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="text-center py-6">
          <i className="ti ti-speakerphone text-[28px] text-[var(--color-border-secondary)] block mb-2" aria-hidden="true" />
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {tab === 'active'
              ? 'No live posts right now. Use the composer to post a deal or table.'
              : 'No posts yet.'
            }
          </p>
        </div>
      ) : (
        posts.map(post => (
          <PostRow
            key={post.id}
            post={post}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  )
}
