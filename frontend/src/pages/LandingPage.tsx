import { useState, useEffect, useRef } from 'react'
import { chatStorage } from '@/shared/utils/storage'
import { sendMessageToChat, clearHistory } from '@/entities/chat'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/hooks'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export const LandingPage = () => {
  const dispatch = useAppDispatch()
  const { messages: reduxMessages, isLoading } = useAppSelector((state) => state.chat)
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const messages = reduxMessages.length > 0 ? reduxMessages : (chatStorage.loadMessages() || [])

  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'ru-RU'

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.resultIndex][0].transcript
          setInputValue(transcript)
          setIsRecording(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      await dispatch(sendMessageToChat(inputValue.trim()))
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = () => {
    dispatch(clearHistory())
    setHasMessages(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Голосовой ввод не поддерживается в вашем браузере. Попробуйте Chrome или Edge.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
      }
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col px-6 py-6 max-w-4xl mx-auto w-full min-h-0">
        
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-start justify-center transition-all duration-500">
            <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 border border-blue-400/30">
              <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
              </svg>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Hi there!
            </h1>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              What would you like to know?
            </h2>

            <p className="text-base md:text-2xl text-slate-400 max-w-xl leading-relaxed">
              Use one of the most common prompts below<br />
              or ask your own question
            </p>
          </div>
        )}

        {hasMessages && (
          <div className="flex-1 flex flex-col min-h-0 mb-4 transition-all duration-500">
            <div className="flex-1 min-h-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-y-auto chat-scrollbar">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-white'
                          : 'bg-white/5 backdrop-blur-sm border border-white/10 text-slate-200'
                      }`}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(message.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-3 flex justify-end shrink-0">
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30"
              >
                Clear history
              </button>
            </div>
          </div>
        )}

        <div className="shrink-0 h-14">
          <div className="flex items-center h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl pl-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
            <button
              onClick={handleMicClick}
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-500/20 animate-pulse' : 'hover:bg-white/10'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              <svg
                className={`w-5 h-5 ${
                  isRecording ? 'text-red-400' : 'text-slate-400 hover:text-blue-300'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? 'Listening...' : 'Ask whatever you want'}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 px-3 text-base md:text-lg"
            />

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="h-full w-12 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 flex items-center justify-center flex-shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
