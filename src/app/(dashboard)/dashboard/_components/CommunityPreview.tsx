'use client'

import { useState } from 'react'

type CommunityPostPreview = {
  id: string
  body: string
  pinned: boolean
  createdAt: string
  businessName: string
  replyCount: number
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

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#E6F1FB', color: '#042C53' },
  { bg: '#FAECE7', color: '#4A1B0C' },
  { bg: '#F3E8FF', color: '#5B21B6' },
]

export default function CommunityPreview({
  posts,
  townName,
}: {
  posts: CommunityPostPreview[]
  townName: string
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText]   = useState('')
  const [newPost, setNewPost]       = useState('')
  const [posting, setPosting]       = useState(false)

  async function handlePost() {
    if (!newPost.trim()) return
    setPosting(true)
    try {
      await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newPost.trim() }),
      })
      setNewPost('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
          <i className="ti ti-messages text-[14px] text-[#0F6E56]" aria-hidden="true" />
          Business community
        </p>
        <a
          href="/dashboard/community"
          className="text-[11px] text-[#0F6E56] hover:underline no-underline"
        >
          Open forum
        </a>
      </div>

      {/* Quick post */}
      <div className="mb-3">
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder={`Share something with ${townName} businesses…`}
          rows={2}
          className="w-full text-[12px] px-3 py-2 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none font-sans"
        />
        {newPost.trim() && (
          <button
            onClick={handlePost}
            disabled={posting}
            className="mt-1.5 text-[11px] font-medium bg-[#0F6E56] text-[#E1F5EE] border-none px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#085041] transition-colors font-sans disabled:opacity-60"
          >
            {posting ? 'Posting…' : 'Post to community'}
          </button>
        )}
      </div>

      {/* Thread list */}
      {posts.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)] py-4 text-center">
          Be the first to post in the {townName} business community.
        </p>
      ) : (
        posts.map((post, i) => {
          const avatarStyle = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const isReplying  = replyingTo === post.id

          return (
            <div
              key={post.id}
              className={`py-2.5 ${i < posts.length - 1 ? 'border-b border-[var(--color-border-tertiary)]' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                  style={{ background: avatarStyle.bg, color: avatarStyle.color }}
                >
                  {initials(post.businessName)}
                </div>
                <span className="text-[11px] font-medium text-[var(--color-text-primary)]">
                  {post.businessName}
                </span>
                {post.pinned && (
                  <i className="ti ti-pin text-[11px] text-[#0F6E56]" aria-hidden="true" title="Pinned" />
                )}
                <span className="text-[10px] text-[var(--color-text-secondary)] ml-auto">
                  {timeAgo(post.createdAt)}
                </span>
              </div>

              <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                {post.body}
              </p>

              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => setReplyingTo(isReplying ? null : post.id)}
                  className="text-[10px] text-[#0F6E56] bg-transparent border-none cursor-pointer hover:underline font-sans"
                >
                  Reply
                </button>
                {post.replyCount > 0 && (
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>

              {/* Inline reply */}
              {isReplying && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    className="flex-1 text-[12px] px-2.5 py-1.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] font-sans"
                    autoFocus
                  />
                  <button
                    onClick={() => { setReplyText(''); setReplyingTo(null) }}
                    className="text-[11px] font-medium bg-[#0F6E56] text-[#E1F5EE] border-none px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[#085041] transition-colors font-sans"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
