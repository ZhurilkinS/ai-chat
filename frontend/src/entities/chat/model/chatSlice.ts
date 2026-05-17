import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { chatStorage } from '@/shared/utils/storage'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  inputText: string
}

const initialState: ChatState = {
  messages: chatStorage.loadMessages() || [],
  isLoading: false,
  error: null,
  inputText: '',
}

export const sendMessageToChat = createAsyncThunk(
  'chat/sendMessage',
  async (text: string, { rejectWithValue }) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await axios.post(`${apiUrl}/api/chat`, { message: text })
      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка отправки')
      }
      return rejectWithValue('Неизвестная ошибка')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInputText: (state, action: PayloadAction<string>) => {
      state.inputText = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    addVoiceText: (state, action: PayloadAction<string>) => {
      state.inputText += (state.inputText ? ' ' : '') + action.payload
    },
    clearHistory: (state) => {
      state.messages = []
      chatStorage.clearMessages()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToChat.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendMessageToChat.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages.push({
          id: Date.now().toString(),
          text: action.meta.arg,
          sender: 'user',
          timestamp: new Date(),
        })
        state.messages.push({
          id: (Date.now() + 1).toString(),
          text: action.payload.response,
          sender: 'bot',
          timestamp: new Date(),
        })
        state.inputText = ''
        chatStorage.saveMessages(state.messages)
      })
      .addCase(sendMessageToChat.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const chatReducer = chatSlice.reducer
export const { setInputText, clearError, addVoiceText, clearHistory } = chatSlice.actions
