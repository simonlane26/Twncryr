'use client'

import { useState, useRef, type ReactNode } from 'react'

const PROPERTY_TYPES = [
  { value: 'retail',      label: 'Retail shop' },
  { value: 'restaurant',  label: 'Restaurant or café' },
  { value: 'pub',         label: 'Pub or bar' },
  { value: 'office',      label: 'Office' },
  { value: 'industrial',  label: 'Industrial / workshop' },
  { value: 'other',       label: 'Other' },
]

const TURNOVER_BANDS = [
  { value: 'under_50k',    label: 'Under £50,000' },
  { value: '50k_100k',     label: '£50,000 – £100,000' },
  { value: '100k_250k',    label: '£100,000 – £250,000' },
  { value: '250k_500k',    label: '£250,000 – £500,000' },
  { value: 'over_500k',    label: 'Over £500,000' },
]

const QUICK_LINKS = [
  {
    label:  'Apply for rate relief',
    sub:    'GOV.UK — business rates relief application',
    icon:   'ti-building-bank',
    href:   'https://www.gov.uk/apply-for-business-rate-relief',
  },
  {
    label:  'Business finance support finder',
    sub:    'GOV.UK — search grants and loans by sector',
    icon:   'ti-search',
    href:   'https://www.gov.uk/business-finance-support',
  },
  {
    label:  'Business Support Helpline',
    sub:    'Free advice · 0800 998 1098 · Mon–Fri 9am–6pm',
    icon:   'ti-phone',
    href:   'https://www.gov.uk/business-support-helpline',
  },
]

// ─── Markdown renderer ───────────────────────────────────────────────────────

function inlineFmt(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
          : p
      )}
    </>
  )
}

function MarkdownContent({ text, streaming }: { text: string; streaming: boolean }) {
  const lines = text.split('\n')

  return (
    <div>
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1
        const cursor = isLast && streaming
          ? <span className="inline-block w-0.5 h-3.5 bg-[#0F6E56] animate-pulse ml-0.5 align-[-2px]" />
          : null

        if (line.startsWith('## ')) {
          return (
            <p key={i} className="font-semibold text-[15px] text-[var(--color-text-primary)] mt-5 mb-2 first:mt-0">
              {inlineFmt(line.slice(3))}{cursor}
            </p>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="font-medium text-[13px] text-[var(--color-text-primary)] mt-4 mb-1.5">
              {inlineFmt(line.slice(4))}{cursor}
            </p>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <p key={i} className="font-serif text-[18px] text-[var(--color-text-primary)] mt-5 mb-2 first:mt-0">
              {inlineFmt(line.slice(2))}{cursor}
            </p>
          )
        }
        if (/^[-*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 text-[13px] text-[var(--color-text-primary)] mb-1.5 ml-2">
              <span className="text-[#0F6E56] flex-shrink-0 mt-0.5 text-[10px]">●</span>
              <span>{inlineFmt(line.slice(2))}{cursor}</span>
            </div>
          )
        }
        const numMatch = line.match(/^(\d+)\.\s(.*)$/)
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 text-[13px] text-[var(--color-text-primary)] mb-1.5 ml-2">
              <span className="text-[#0F6E56] font-medium flex-shrink-0 min-w-[18px]">{numMatch[1]}.</span>
              <span>{inlineFmt(numMatch[2])}{cursor}</span>
            </div>
          )
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-[13px] text-[var(--color-text-primary)] mb-1.5 leading-relaxed">
            {inlineFmt(line)}{cursor}
          </p>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GrantsClient({
  businessName,
  townName,
  county,
}: {
  businessName: string
  townName: string
  county: string
}) {
  const [rateableValue,  setRateableValue]  = useState('')
  const [propertyType,   setPropertyType]   = useState('retail')
  const [employees,      setEmployees]      = useState('')
  const [turnover,       setTurnover]       = useState('50k_100k')
  const [monthsTrading,  setMonthsTrading]  = useState('')
  const [isRural,        setIsRural]        = useState(false)
  const [context,        setContext]        = useState('')

  const [checking,   setChecking]   = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error,      setError]      = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const canCheck = rateableValue.trim() !== '' && employees.trim() !== '' && monthsTrading.trim() !== ''

  async function check() {
    if (!canCheck) return
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setChecking(true)
    setStreamText('')
    setError('')

    try {
      const res = await fetch('/api/grants', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rateableValue, propertyType, employees, turnover, monthsTrading, isRural, context }),
        signal:  controller.signal,
      })

      if (!res.ok) throw new Error('Check failed')

      const reader  = res.body!.getReader()
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
    } catch (err: any) {
      if (err.name !== 'AbortError') setError('Something went wrong. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      {/* Form */}
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border-tertiary)]">
          <div className="w-7 h-7 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
            <i className="ti ti-building-store text-[14px] text-[#085041]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{businessName}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)]">{townName}, {county}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Rateable value */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Rateable value *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-secondary)]">£</span>
              <input
                type="number"
                value={rateableValue}
                onChange={e => setRateableValue(e.target.value)}
                placeholder="12,500"
                className="w-full text-[13px] pl-7 pr-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">From your latest rates bill</p>
          </div>

          {/* Property type */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Property type *
            </label>
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Employees */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Employees (FTE) *
            </label>
            <input
              type="number"
              value={employees}
              onChange={e => setEmployees(e.target.value)}
              placeholder="3"
              min="0"
              className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
            />
          </div>

          {/* Turnover */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Annual turnover *
            </label>
            <select
              value={turnover}
              onChange={e => setTurnover(e.target.value)}
              className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
            >
              {TURNOVER_BANDS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Months trading */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Months trading *
            </label>
            <input
              type="number"
              value={monthsTrading}
              onChange={e => setMonthsTrading(e.target.value)}
              placeholder="24"
              min="0"
              className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors font-sans"
            />
          </div>

          {/* Rural */}
          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsRural(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${
                  isRural ? 'bg-[#0F6E56]' : 'bg-[var(--color-border-secondary)]'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isRural ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--color-text-primary)]">Rural settlement</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">Population under 3,000</p>
              </div>
            </label>
          </div>
        </div>

        {/* Context */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
            Additional context
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. Listed building, recently taken on an apprentice, considering solar panels, part of a BID scheme…"
            rows={2}
            className="w-full text-[13px] px-3 py-2.5 border border-[var(--color-border-tertiary)] rounded-lg bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] outline-none focus:border-[#5DCAA5] transition-colors resize-none font-sans"
          />
        </div>

        {error && (
          <p className="text-[12px] text-red-600 mb-3 flex items-center gap-1.5">
            <i className="ti ti-alert-circle text-[13px]" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={check}
          disabled={checking || !canCheck}
          className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-xl text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans flex items-center justify-center gap-2"
        >
          {checking ? (
            <>
              <i className="ti ti-loader-2 animate-spin text-[15px]" aria-hidden="true" />
              Checking your eligibility…
            </>
          ) : (
            <>
              <i className="ti ti-search text-[15px]" aria-hidden="true" />
              Check my eligibility
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {streamText && (
        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border-tertiary)]">
            <i className="ti ti-file-text text-[14px] text-[#0F6E56]" aria-hidden="true" />
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Eligibility report for {businessName}
            </span>
          </div>
          <MarkdownContent text={streamText} streaming={checking} />
        </div>
      )}

      {/* Quick links — always visible */}
      <div className="border-t border-[var(--color-border-tertiary)] pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[1.2px] text-[var(--color-text-secondary)] mb-3">
          Quick links
        </p>
        <div className="flex flex-col gap-2">
          {QUICK_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl no-underline hover:border-[#5DCAA5] hover:bg-[var(--color-background-secondary)] transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background-secondary)] group-hover:bg-[#E1F5EE] flex items-center justify-center flex-shrink-0 transition-colors">
                <i className={`ti ${link.icon} text-[15px] text-[var(--color-text-secondary)] group-hover:text-[#085041] transition-colors`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:text-[#085041] transition-colors">
                  {link.label}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{link.sub}</p>
              </div>
              <i className="ti ti-external-link text-[12px] text-[var(--color-text-secondary)] ml-auto flex-shrink-0" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
