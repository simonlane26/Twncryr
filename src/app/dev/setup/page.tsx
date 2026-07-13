'use client'

import { useOrganizationList } from '@clerk/nextjs'
import { useState } from 'react'

export default function DevSetupPage() {
  const { setActive, isLoaded } = useOrganizationList()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function activate() {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/dev/setup', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong')
        return
      }

      setMessage(`Linked to ${data.businessName} — activating session…`)

      if (setActive) {
        await setActive({ organization: data.orgId })
      }

      // Full page reload so the session token picks up the new orgId
      window.location.href = '/dashboard'
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message ?? 'Something went wrong — check the browser console')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-tertiary)]">
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-code text-[22px] text-[#085041]" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-[20px] text-[var(--color-text-primary)] mb-2">
          Dev setup
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Skip claim approval and link your account to a test business instantly.
          Only available in local development.
        </p>

        {message && (
          <p className={`text-[12px] mb-4 ${status === 'error' ? 'text-red-600' : 'text-[#0F6E56]'}`}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={activate}
          disabled={status === 'loading'}
          className="w-full bg-[#0F6E56] disabled:opacity-60 text-[#E1F5EE] border-none py-3 rounded-xl text-[14px] font-medium cursor-pointer hover:bg-[#085041] transition-colors font-sans"
        >
          {status === 'loading' ? 'Setting up…' : 'Activate dashboard access'}
        </button>

        <p className="text-[10px] text-[var(--color-text-secondary)] mt-4">
          This page does not exist in production
        </p>
      </div>
    </div>
  )
}
