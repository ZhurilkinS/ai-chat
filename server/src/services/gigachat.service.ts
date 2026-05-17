import axios from 'axios'
import * as crypto from 'crypto'
import https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production',
})

interface GigaChatToken {
  access_token: string
  expires_in: number
  token_type: string
}

interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GigaChatResponse {
  choices: Array<{
    message: GigaChatMessage
  }>
}

export function getGigaChatService(): GigaChatService {
  if (!serviceInstance) {
    serviceInstance = new GigaChatService()
  }
  return serviceInstance
}

let serviceInstance: GigaChatService | null = null

class GigaChatService {
  private accessToken: string = ''
  private tokenExpiry: number = 0
  private authKey: string = ''
  private initialized: boolean = false

  private messages: GigaChatMessage[] = [
    {
      role: 'system',
      content: 'Ты полезный помощник. Отвечай кратко и по делу.',
    },
  ]

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.authKey = process.env.GIGACHAT_AUTH_KEY || ''
      if (!this.authKey) {
        throw new Error('GigaChat auth key not configured')
      }
      this.initialized = true
    }
  }

  async #refreshToken(): Promise<void> {
    try {
      const response = await axios.post(
        'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        'scope=GIGACHAT_API_PERS',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            'RqUID': crypto.randomUUID(),
            Authorization: `Basic ${this.authKey}`,
          },
          httpsAgent,
        }
      )

      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
    } catch (error) {
      throw new Error('Failed to refresh GigaChat token')
    }
  }

  private async ensureToken(): Promise<void> {
    this.ensureInitialized()
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.#refreshToken()
    }
  }

  async sendMessage(message: string): Promise<string> {
    return this.#sendMessageWithRetry(message, 0)
  }

  async #sendMessageWithRetry(message: string, retryCount: number): Promise<string> {
    try {
      await this.ensureToken()
      this.messages.push({ role: 'user', content: message })

      const response = await axios.post<GigaChatResponse>(
        'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
        {
          model: 'GigaChat',
          messages: this.messages,
          stream: false,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'RqUID': crypto.randomUUID(),
          },
          httpsAgent,
        }
      )

      const assistantMessage = response.data.choices[0]?.message
      const content = assistantMessage?.content || 'Получен пустой ответ'

      this.messages.push({ role: 'assistant', content })

      if (this.messages.length > 20) {
        this.messages = [this.messages[0], ...this.messages.slice(-19)]
      }

      return content
    } catch (error) {
      this.messages.pop()

      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data

        if (status === 401 && retryCount === 0) {
          this.accessToken = ''
          this.tokenExpiry = 0
          await this.#refreshToken()
          return this.#sendMessageWithRetry(message, retryCount + 1)
        }

        if (status === 401) {
          throw new Error('Ошибка аутентификации GigaChat')
        } else if (status === 429) {
          throw new Error('Превышен лимит запросов')
        } else {
          throw new Error(`Ошибка GigaChat: ${data?.detail || error.message}`)
        }
      }

      throw new Error('Не удалось отправить сообщение')
    }
  }

  clearContext(): void {
    this.messages = [{ role: 'system', content: 'Ты полезный помощник. Отвечай кратко и по делу.' }]
  }

  getMessageCount(): number {
    return this.messages.length
  }
}
