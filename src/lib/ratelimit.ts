import { NextRequest } from 'next/server'

// In-memory sliding window — works well on Railway (persistent Node process).
// For multi-replica deployments, swap this for Upstash Redis.

const store = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) if (now > v.resetAt) store.delete(k)
}, 60_000).unref()

function check(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count++
  return entry.count <= limit
}

export function rateLimitIP(req: NextRequest, limit = 10, windowMs = 60_000): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  return check(`ip:${ip}`, limit, windowMs)
}

export function rateLimitOrg(orgId: string, limit = 30, windowMs = 60_000): boolean {
  return check(`org:${orgId}`, limit, windowMs)
}
