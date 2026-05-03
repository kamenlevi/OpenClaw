'use client'
import { useEffect, useCallback } from 'react'

export function useSSE(onEvent: (event: Record<string, unknown>) => void) {
  const stableHandler = useCallback(onEvent, [])

  useEffect(() => {
    let es: EventSource
    let retryTimeout: ReturnType<typeof setTimeout>

    const connect = () => {
      es = new EventSource('/api/stream')
      es.onmessage = (e) => {
        try { stableHandler(JSON.parse(e.data)) } catch {}
      }
      es.onerror = () => {
        es.close()
        retryTimeout = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => { es?.close(); clearTimeout(retryTimeout) }
  }, [stableHandler])
}
