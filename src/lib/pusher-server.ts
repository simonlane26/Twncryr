import PusherServer from 'pusher'

declare global {
  // eslint-disable-next-line no-var
  var _pusherServer: PusherServer | undefined
}

function createPusherServer() {
  return new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER ?? 'eu',
    useTLS: true,
  })
}

export const pusherServer =
  global._pusherServer ?? (global._pusherServer = createPusherServer())

export function townChannel(townSlug: string) {
  return `town-${townSlug}`
}

export const PUSHER_EVENTS = {
  NEW_POST: 'new-post',
  POST_EXPIRED: 'post-expired',
  POST_UPDATED: 'post-updated',
} as const

export type NewPostPayload = {
  id: string
  type: 'TABLE' | 'DEAL' | 'EVENT' | 'ANNOUNCEMENT'
  title: string
  body: string
  expiresAt: string | null
  startsAt: string | null
  tableCount: number | null
  discountText: string | null
  createdAt: string
  business: {
    id: string
    name: string
    slug: string
    logo: string | null
    category: string
  }
}

export type PostExpiredPayload = {
  id: string
  businessId: string
}
