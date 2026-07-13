'use client'

import { useEffect, useRef, useState } from 'react'
import { getPusherClient } from '@/lib/pusher-client'
import type { NewPostPayload, PostExpiredPayload } from '@/lib/pusher-server'
import { PUSHER_EVENTS } from '@/lib/pusher-server'

export type LivePost = NewPostPayload & {
  isNew: boolean
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed'

export function useTownFeed({
  townSlug,
  initialPosts,
}: {
  townSlug: string
  initialPosts: LivePost[]
}) {
  const [posts, setPosts] = useState<LivePost[]>(initialPosts)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [newPostCount, setNewPostCount] = useState(0)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const pusher = getPusherClient()
    const channelName = `town-${townSlug}`

    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    pusher.connection.bind('connected', () => setConnectionState('connected'))
    pusher.connection.bind('disconnected', () => setConnectionState('disconnected'))
    pusher.connection.bind('failed', () => setConnectionState('failed'))
    pusher.connection.bind('connecting', () => setConnectionState('connecting'))

    channel.bind(PUSHER_EVENTS.NEW_POST, (payload: NewPostPayload) => {
      setPosts(prev => {
        if (prev.some(p => p.id === payload.id)) return prev
        return [{ ...payload, isNew: true }, ...prev]
      })
      setNewPostCount(n => n + 1)

      setTimeout(() => {
        setPosts(prev =>
          prev.map(p => (p.id === payload.id ? { ...p, isNew: false } : p))
        )
      }, 5000)
    })

    channel.bind(PUSHER_EVENTS.POST_EXPIRED, (payload: PostExpiredPayload) => {
      setPosts(prev => prev.filter(p => p.id !== payload.id))
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
    }
  }, [townSlug])

  function clearNewCount() {
    setNewPostCount(0)
  }

  return { posts, connectionState, newPostCount, clearNewCount }
}

export type Toast = {
  id: string
  post: NewPostPayload
  removing: boolean
}

export function useToastNotifications({ townSlug }: { townSlug: string }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`town-${townSlug}`)

    channel.bind(PUSHER_EVENTS.NEW_POST, (payload: NewPostPayload) => {
      const toastId = `toast-${payload.id}`

      setToasts(prev => [...prev, { id: toastId, post: payload, removing: false }])

      setTimeout(() => dismissToast(toastId), 5000)
    })

    return () => {
      channel.unbind(PUSHER_EVENTS.NEW_POST)
    }
  }, [townSlug])

  function dismissToast(id: string) {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 350)
  }

  return { toasts, dismissToast }
}
