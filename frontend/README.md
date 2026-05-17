# Frontend - Voice Chat App

React + Redux Toolkit + Vite + TypeScript + Tailwind CSS

## Запуск

```bash
npm install
npm run dev
```

Приложение запустится на `http://localhost:3000`

## Сборка

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Структура (FSD)

```
src/
├── entities/          # Сущности (business entities)
│   └── chat/          # Сущность чата
│       ├── model/     # Логика слайса
│       │   └── chatSlice.ts
│       └── index.ts   # Public API
├── features/          # Сценарии использования
│   └── VoiceInputFeature.tsx  # Голосовой ввод
├── pages/             # Страницы
│   └── ChatPage.tsx
├── widgets/           # Сложные компоненты
│   └── ChatWidget.tsx # Основной виджет чата
├── shared/            # Переиспользуемые компоненты
│   ├── api/           # API клиенты
│   │   └── chatApi.ts
│   ├── lib/           # Утилиты
│   │   └── localStorage.ts
│   ├── store/         # Redux store
│   │   └── store.ts
│   ├── types/         # TypeScript типы
│   │   └── speech.d.ts
│   └── utils/         # Вспомогательные функции
│       └── storage.ts
└── App.tsx
```

## Хранение истории сообщений

История сообщений сохраняется в **localStorage** браузера:

- ✅ Сохраняется при каждом новом сообщении
- ✅ Загружается при перезагрузке страницы
- ✅ Очищается кнопкой "Очистить историю"
- ✅ Ограничение: ~5-10MB в зависимости от браузера

**Ключ localStorage:** `chat_history`

## API

### Redux Store

```typescript
state.chat = {
  messages: Message[],     // История сообщений
  isLoading: boolean,      // Загрузка
  error: string | null,    // Ошибка
  inputText: string,       // Текст в поле ввода
}
```

### Actions

- `sendMessageToChat(text)` - отправить сообщение
- `setInputText(text)` - изменить текст ввода
- `addVoiceText(text)` - добавить текст из голоса
- `clearHistory()` - очистить историю
- `clearError()` - сбросить ошибку

## Прокси API

Все запросы к `/api/*` автоматически проксируются на backend (`http://localhost:4000`)

Настроено в `vite.config.ts`
