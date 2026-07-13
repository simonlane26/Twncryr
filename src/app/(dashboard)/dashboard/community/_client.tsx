'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Reply = {
  id: string
  body: string
  createdAt: string
  business: { id: string; name: string; logo: string | null }
}

type Post = {
  id: string
  body: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  business: { id: string; name: string; slug: string; logo: string | null; category: string }
  replies: Reply[]
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  if (hrs < 168) return `${Math.floor(hrs / 24)}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const AVATAR_COLORS = [
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#042C53' },
  { bg: '#FAECE7', color: '#4A1B0C' },
  { bg: '#F3E8FF', color: '#5B21B6' },
]

function avatarStyle(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, logo, size = 32 }: { name: string; logo: string | null; size?: number }) {
  const style = avatarStyle(name)
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-medium"
      style={{ width: size, height: size, background: style.bg, color: style.color }}
    >
      {initials(name)}
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Compose box â€” new post
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ComposeBox({
  businessName,
  onPost,
}: {
  businessName: string
  onPost: (post: Post) => void
}) {
  const [body, setBody]         = useState('')
  const [posting, setPosting]   = useState(false)
  const [focused, setFocused]   = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handlePost() {
    if (!body.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        onPost(data.post)
        setBody('')
        setFocused(false)
      }
    } finally {
      setPosting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
    if (e.key === 'Escape') { setFocused(false); setBody('') }
  }

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-4">
      <div className="flex gap-3">
        <Avatar name={businessName} logo={null} size={36} />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Share something with ${businessName.split(' ')[0]} and other traders…`}
            rows={focused ? 4 : 2}
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-all resize-none font-sans leading-relaxed"
          />

          {(focused || body) && (
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[11px] ${body.length > 900 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'}`}>
                {body.length}/1000 · Ctrl+↵ to post
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setBody(''); setFocused(false) }}
                  className="text-[12px] text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[var(--color-text-primary)] font-sans px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting || !body.trim()}
                  className="text-[12px] font-medium bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none px-4 py-1.5 rounded-lg cursor-pointer hover:bg-[#085041] transition-colors font-sans"
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reply box â€” inline under a post
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReplyBox({
  postId,
  businessName,
  onReply,
  onCancel,
}: {
  postId: string
  businessName: string
  onReply: (reply: Reply) => void
  onCancel: () => void
}) {
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/community/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        onReply(data.reply)
        setBody('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-2.5 mt-3 ml-9">
      <Avatar name={businessName} logo={null} size={26} />
      <div className="flex-1">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
          placeholder="Write a reply…"
          rows={2}
          autoFocus
          className="w-full text-[12px] px-3 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none font-sans"
        />
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={onCancel}
            className="text-[11px] text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[var(--color-text-primary)] font-sans"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="text-[11px] font-medium bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#085041] transition-colors font-sans"
          >
            {sending ? 'Sending…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Post card
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PostCard({
  post,
  currentBusinessId,
  currentBusinessName,
  onDelete,
}: {
  post: Post
  currentBusinessId: string
  currentBusinessName: string
  onDelete: (id: string) => void
}) {
  const [expanded,    setExpanded]    = useState(false)
  const [replying,    setReplying]    = useState(false)
  const [replies,     setReplies]     = useState<Reply[]>(post.replies)
  const [showReplies, setShowReplies] = useState(false)
  const isOwn = post.business.id === currentBusinessId

  function handleNewReply(reply: Reply) {
    setReplies(prev => [...prev, reply])
    setReplying(false)
    setShowReplies(true)
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/community/${post.id}/replies`, { method: 'DELETE' })
    onDelete(post.id)
  }

  return (
    <div className={`bg-[var(--color-background-primary)] border rounded-xl p-4 mb-3 ${
      post.pinned
        ? 'border-[#5DCAA5] bg-[#F0FBF7]'
        : 'border-[var(--color-border-tertiary)]'
    }`}>

      {/* Pinned badge */}
      {post.pinned && (
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#085041] mb-2">
          <i className="ti ti-pin text-[11px]" aria-hidden="true" />
          Pinned
        </div>
      )}

      {/* Post header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <Avatar name={post.business.name} logo={post.business.logo} size={34} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {post.business.name}
            </span>
            {isOwn && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#085041]">
                You
              </span>
            )}
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isOwn && (
            <button
              onClick={handleDelete}
              className="text-[12px] text-[var(--color-text-secondary)] hover:text-red-500 bg-transparent border-none cursor-pointer p-1 transition-colors"
              title="Delete post"
            >
              <i className="ti ti-trash text-[13px]" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Post body */}
      <div className="ml-[46px]">
        <p className={`text-[13px] text-[var(--color-text-primary)] leading-relaxed ${
          !expanded && post.body.length > 280 ? 'line-clamp-4' : ''
        }`}>
          {post.body}
        </p>
        {post.body.length > 280 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-[#0F6E56] bg-transparent border-none cursor-pointer mt-1 hover:underline font-sans"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Action row */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => setReplying(!replying)}
            className="text-[11px] text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[#0F6E56] transition-colors font-sans flex items-center gap-1.5"
          >
            <i className="ti ti-message text-[12px]" aria-hidden="true" />
            Reply
          </button>

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-[11px] text-[var(--color-text-secondary)] bg-transparent border-none cursor-pointer hover:text-[#0F6E56] transition-colors font-sans flex items-center gap-1.5"
            >
              <i className={`ti ${showReplies ? 'ti-chevron-up' : 'ti-chevron-down'} text-[12px]`} aria-hidden="true" />
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply composer */}
        {replying && (
          <ReplyBox
            postId={post.id}
            businessName={currentBusinessName}
            onReply={handleNewReply}
            onCancel={() => setReplying(false)}
          />
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 border-l-2 border-[var(--color-border-tertiary)] pl-4 flex flex-col gap-3">
            {replies.map(reply => (
              <div key={reply.id} className="flex gap-2.5">
                <Avatar name={reply.business.name} logo={reply.business.logo} size={26} />
                <div className="flex-1 bg-[var(--color-background-secondary)] rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
                      {reply.business.name}
                    </span>
                    {reply.business.id === currentBusinessId && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#085041]">
                        You
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--color-text-secondary)] ml-auto">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                    {reply.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Filter tabs
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Filter = 'all' | 'pinned' | 'mine'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main forum component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CommunityForum({
  initialPosts,
  currentBusinessId,
  currentBusinessName,
  townSlug,
  townName,
}: {
  initialPosts: Post[]
  currentBusinessId: string
  currentBusinessName: string
  townSlug: string
  townName: string
}) {
  const [posts,  setPosts]  = useState<Post[]>(initialPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  function handleNewPost(post: Post) {
    setPosts(prev => [post, ...prev])
  }

  function handleDelete(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  // Filter + search
  const filtered = posts.filter(post => {
    if (filter === 'pinned' && !post.pinned) return false
    if (filter === 'mine'   && post.business.id !== currentBusinessId) return false
    if (search && !post.body.toLowerCase().includes(search.toLowerCase()) &&
        !post.business.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {/* Compose */}
      <ComposeBox
        businessName={currentBusinessName}
        onPost={handleNewPost}
      />

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {([
            { value: 'all',    label: `All (${posts.length})` },
            { value: 'pinned', label: 'Pinned' },
            { value: 'mine',   label: 'Mine' },
          ] as { value: Filter; label: string }[]).map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-[12px] px-3 py-1.5 rounded-full border cursor-pointer transition-colors font-sans ${
                filter === f.value
                  ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                  : 'bg-transparent border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5] hover:text-[#085041]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-text-secondary)]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="text-[12px] pl-8 pr-3 py-1.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] w-44 font-sans"
          />
        </div>
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl">
          <i className="ti ti-messages text-[32px] text-[var(--color-border-secondary)] block mb-3" aria-hidden="true" />
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-1">
            {search
              ? `No posts matching "${search}"`
              : filter === 'mine'
              ? `You haven't posted yet — use the box above to share something.`
              : filter === 'pinned'
              ? 'No pinned posts.'
              : `Be the first to post in the ${townName} community.`
            }
          </p>
        </div>
      ) : (
        filtered.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentBusinessId={currentBusinessId}
            currentBusinessName={currentBusinessName}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  )
}

