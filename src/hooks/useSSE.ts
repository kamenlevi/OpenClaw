'use client'
import { useEffect, useRef } from 'react'

export function useSSE(onEvent: (event: Record<string, unknown>) => void) {
  // Always point to the latest handler without restarting the SSE connection
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  useEffect(() => {
    let es: EventSource
    let retryTimeout: ReturnType<typeof setTimeout>

    const connect = () => {
      es = new EventSource('/api/stream')
      es.onmessage = (e) => {
        try { handlerRef.current(JSON.parse(e.data)) } catch {}
      }
      es.onerror = () => {
        es.close()
        retryTimeout = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => { es?.close(); clearTimeout(retryTimeout) }
  }, []) // connect once — handler stays current via ref
}
