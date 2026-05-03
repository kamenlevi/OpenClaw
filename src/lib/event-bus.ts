import { EventEmitter } from 'events'

class EventBus extends EventEmitter {}
export const eventBus = new EventBus()
eventBus.setMaxListeners(100)

export function emitEvent(data: Record<string, unknown>) {
  eventBus.emit('update', { ...data, timestamp: new Date().toISOString() })
}
