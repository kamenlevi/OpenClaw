import { eventBus } from '@/lib/event-bus'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Client disconnected
        }
      }

      const listener = (event: unknown) => send(event)
      eventBus.on('update', listener)

      // Ping every 15s to keep connection alive
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          clearInterval(ping)
        }
      }, 15000)

      // Cleanup on stream cancel
      return () => {
        eventBus.off('update', listener)
        clearInterval(ping)
      }
    },
    cancel() {
      // Cleanup is handled by the return value of start()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
