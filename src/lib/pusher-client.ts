import PusherClient from 'pusher-js'

declare global {
  // eslint-disable-next-line no-var
  var _pusherClient: PusherClient | undefined
}

function createPusherClient() {
  if (process.env.NODE_ENV === 'development') {
    PusherClient.logToConsole = true
  }

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
    forceTLS: true,
  })
}

export function getPusherClient(): PusherClient {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient() called server-side')
  }
  if (!global._pusherClient) {
    global._pusherClient = createPusherClient()
  }
  return global._pusherClient
}
