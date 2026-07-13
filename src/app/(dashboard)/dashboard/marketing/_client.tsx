'use client'

import { useState, useRef } from 'react'

type ContentType = 'instagram' | 'facebook' | 'google' | 'newsletter' | 'campaign' | 'ideas' | 'seasonal' | 'bio'
type Tone = 'warm' | 'professional' | 'playful' | 'urgent'

type Business = {
  name: string; category: string; description: string | null
  address: string | null; townName: string; townCounty: string
}

const GoogleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const CONTENT_TYPES: { value: ContentType; label: string; icon: string; description: string }[] = [
  { value: 'instagram', label: 'Instagram',     icon: 'ti-brand-instagram', description: '2 captions + hashtags' },
  { value: 'facebook',  label: 'Facebook',      icon: 'ti-brand-facebook',  description: 'Short & long version' },
  { value: 'google',    label: 'Google post',   icon: 'ti-map-pin',         description: 'Local search optimised' },
  { value: 'newsletter',label: 'Newsletter',    icon: 'ti-mail',            description: 'Email-ready draft' },
  { value: 'campaign',  label: 'Campaign idea', icon: 'ti-bulb',            description: 'Full execution plan' },
  { value: 'ideas',     label: 'Post ideas',    icon: 'ti-list',            description: '10 ideas for the month' },
  { value: 'seasonal',  label: 'Seasonal',      icon: 'ti-calendar-event',  description: '3 seasonal angles' },
  { value: 'bio',       label: 'Profile bio',   icon: 'ti-user',            description: 'Short & long versions' },
]

const TONES: { value: Tone; label: string }[] = [
  { value: 'warm',         label: 'Warm & welcoming' },
  { value: 'professional', label: 'Professional' },
  { value: 'playful',      label: 'Playful' },
  { value: 'urgent',       label: 'Create urgency' },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] text-[#0F6E56] bg-transparent border-none cursor-pointer hover:underline font-sans"
    >
      <i className={`ti ${copied ? 'ti-check' : 'ti-copy'} text-[12px]`} aria-hidden="true" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ShareToGoogleButton({
  text,
  onShare,
  status,
}: {
  text: string
  onShare: (text: string) => void
  status: 'idle' | 'sharing' | 'ok' | 'error'
}) {
  if (status === 'ok') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-[#085041]">
        <i className="ti ti-circle-check text-[12px]" aria-hidden="true" />
        Posted to Google
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-red-600">
        <i className="ti ti-alert-circle text-[12px]" aria-hidden="true" />
        Share failed
      </span>
    )
  }
  return (
    <button
      onClick={() => onShare(text)}
      disabled={status === 'sharing'}
      className="flex items-center gap-1.5 text-[11px] text-[#0F6E56] bg-transparent border-none cursor-pointer hover:underline font-sans disabled:opacity-60"
    >
      {status === 'sharing' ? (
        <i className="ti ti-loader-2 animate-spin text-[12px]" aria-hidden="true" />
      ) : (
        <GoogleIcon />
      )}
      {status === 'sharing' ? 'Posting…' : 'Post to Google'}
    </button>
  )
}

function OutputVariant({
  label,
  text,
  index,
  onShareGoogle,
  shareStatus,
}: {
  label: string
  text: string
  index?: number
  onShareGoogle?: (text: string) => void
  shareStatus?: 'idle' | 'sharing' | 'ok' | 'error'
}) {
  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
          <i className="ti ti-file-text text-[12px]" aria-hidden="true" />
          {index !== undefined ? `Option ${index + 1}` : label}
        </span>
        <div className="flex items-center gap-3">
          {onShareGoogle && shareStatus && (
            <ShareToGoogleButton text={text} onShare={onShareGoogle} status={shareStatus} />
          )}
          <CopyButton text={text} />
        </div>
      </div>
      <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function MarketingClient({
  business,
  googleConnected = false,
}: {
  business: Business
  googleConnected?: boolean
}) {
  const [contentType, setContentType] = useState<ContentType>('instagram')
  const [tone,        setTone]        = useState<Tone>('warm')
  const [focus,       setFocus]       = useState('')
  const [specifics,   setSpecifics]   = useState('')
  const [generating,  setGenerating]  = useState(false)
  const [streamText,  setStreamText]  = useState('')
  const [variants,    setVariants]    = useState<string[]>([])
  const [error,       setError]       = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // Per-card Google share state: index → status ('idle'|'sharing'|'ok'|'error')
  // Index -1 = the single output card
  const [googleStatuses, setGoogleStatuses] = useState<Record<number, 'idle' | 'sharing' | 'ok' | 'error'>>({})

  async function shareToGoogle(text: string, index: number) {
    setGoogleStatuses(s => ({ ...s, [index]: 'sharing' }))
    try {
      const res = await fetch('/api/google/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: focus.trim().slice(0, 80), body: text, type: 'ANNOUNCEMENT' }),
      })
      setGoogleStatuses(s => ({ ...s, [index]: res.ok ? 'ok' : 'error' }))
    } catch {
      setGoogleStatuses(s => ({ ...s, [index]: 'error' }))
    }
  }

  const selectedType = CONTENT_TYPES.find(t => t.value === contentType)!

  async function generate() {
    if (!focus.trim()) return
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setGenerating(true)
    setStreamText('')
    setVariants([])
    setError('')
    setGoogleStatuses({})

    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, tone, focus: focus.trim(), specifics: specifics.trim() }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error('Generation failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              full += parsed.delta.text
              setStreamText(full)
            }
          } catch {}
        }
      }

      // Split into variants if separated by ---
      const parts = full.split('---').map(s => s.trim()).filter(Boolean)
      if (parts.length > 1) {
        setVariants(parts)
        setStreamText('')
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Business context strip */}
      <div className="flex items-center gap-3 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-xl px-4 py-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
          <i className="ti ti-building-store text-[16px] text-[#085041]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{business.name}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            {business.address} · {business.townName}, {business.townCounty}
          </p>
        </div>
        {!business.description && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <i className="ti ti-alert-circle text-[12px]" aria-hidden="true" />
            Add a description in your profile for better results
          </div>
        )}
      </div>

      {/* Content type grid */}
      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[var(--color-text-secondary)] mb-3">
        What do you want to create?
      </p>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {CONTENT_TYPES.map(ct => (
          <button
            key={ct.value}
            onClick={() => setContentType(ct.value)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 border rounded-xl cursor-pointer font-sans transition-all ${
              contentType === ct.value
                ? 'border-[#5DCAA5] bg-[#E1F5EE]'
                : 'border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] hover:border-[#5DCAA5]'
            }`}
          >
            <i
              className={`ti ${ct.icon} text-[20px]`}
              style={{ color: contentType === ct.value ? '#085041' : 'var(--color-text-secondary)' }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] font-medium"
              style={{ color: contentType === ct.value ? '#085041' : 'var(--color-text-secondary)' }}
            >
              {ct.label}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">{ct.description}</span>
          </button>
        ))}
      </div>

      {/* Tone selector */}
      <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[var(--color-text-secondary)] mb-2">Tone</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {TONES.map(t => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={`text-[12px] px-3.5 py-1.5 rounded-full border cursor-pointer font-sans transition-all ${
              tone === t.value
                ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                : 'bg-[var(--color-background-primary)] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[#5DCAA5]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Focus inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-text-primary)] mb-1.5">
            What's the focus? *
          </label>
          <input
            type="text"
            value={focus}
            onChange={e => setFocus(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. Market day lunch deal, new autumn menu, wine tasting evening"
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-text-primary)] mb-1.5">
            Specifics to include
          </label>
          <input
            type="text"
            value={specifics}
            onChange={e => setSpecifics(e.target.value)}
            placeholder="e.g. prices, times, dietary options, booking link"
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
          />
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-red-600 mb-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        onClick={generate}
        disabled={generating || !focus.trim()}
        className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-xl text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center justify-center gap-2 mb-5"
      >
        {generating ? (
          <>
            <i className="ti ti-loader-2 animate-spin text-[15px]" aria-hidden="true" />
            Generating your {selectedType.label.toLowerCase()}…
          </>
        ) : (
          <>
            <i className="ti ti-sparkles text-[15px]" aria-hidden="true" />
            Generate {selectedType.label.toLowerCase()}
          </>
        )}
      </button>

      {/* Output */}
      {(streamText || variants.length > 0) && (
        <div className="border-t border-[var(--color-border-tertiary)] pt-5">
          <p className="text-[10px] font-medium uppercase tracking-[1.2px] text-[var(--color-text-secondary)] mb-3">
            {selectedType.label} · {TONES.find(t => t.value === tone)?.label}
          </p>

          {variants.length > 0 ? (
            <div className="flex flex-col gap-3">
              {variants.map((v, i) => (
                <OutputVariant
                  key={i}
                  label={selectedType.label}
                  text={v}
                  index={i}
                  onShareGoogle={contentType === 'google' && googleConnected
                    ? (text) => shareToGoogle(text, i)
                    : undefined}
                  shareStatus={contentType === 'google' && googleConnected
                    ? (googleStatuses[i] ?? 'idle')
                    : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <i className="ti ti-file-text text-[12px]" aria-hidden="true" />
                  {selectedType.label}
                </span>
                <div className="flex items-center gap-3">
                  {contentType === 'google' && !generating && streamText && googleConnected && (
                    <ShareToGoogleButton
                      text={streamText}
                      onShare={(text) => shareToGoogle(text, -1)}
                      status={googleStatuses[-1] ?? 'idle'}
                    />
                  )}
                  {!generating && streamText && <CopyButton text={streamText} />}
                </div>
              </div>
              <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {streamText}
                {generating && (
                  <span className="inline-block w-0.5 h-3.5 bg-[#0F6E56] animate-pulse ml-0.5 align-[-2px]" />
                )}
              </p>
            </div>
          )}

          {/* Prompt to connect Google when on google type but not connected */}
          {contentType === 'google' && !googleConnected && !generating && (streamText || variants.length > 0) && (
            <div className="mt-3 flex items-center gap-2 bg-(--color-background-secondary) border border-(--color-border-tertiary) rounded-lg px-4 py-3">
              <GoogleIcon />
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                <a href="/api/google/connect" className="text-[#0F6E56] hover:underline font-medium">Connect Google Business Profile</a>
                {' '}to post this directly to your listing
              </p>
            </div>
          )}

          {!generating && (
            <div className="mt-3 bg-[var(--color-background-secondary)] rounded-lg px-4 py-3">
              <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                <i className="ti ti-bulb text-[13px] text-[#0F6E56] mr-1.5" aria-hidden="true" />
                Not quite right? Adjust the focus or tone and regenerate. Each generation is unique.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
