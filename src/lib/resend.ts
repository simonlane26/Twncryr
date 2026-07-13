import { Resend } from 'resend'

// Lazy singleton — defers instantiation to request time so the build
// doesn't fail when RESEND_API_KEY isn't available as a build arg.
let _client: Resend | null = null

export function getResend(): Resend {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}
