import { localStorage } from '@/shared/lib/localStorage'
import type { Message } from '@/entities/chat'

const STORAGE_KEY = 'chat_history'

export const chatStorage = {
  saveMessages(messages: Message[]): void {
    localStorage.set(STORAGE_KEY, messages)
  },

  loadMessages(): Message[] | null {
    const messages = localStorage.get<Message[]>(STORAGE_KEY)
    if (!messages) return null
    
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  },

  clearMessages(): void {
    localStorage.remove(STORAGE_KEY)
  },
}
