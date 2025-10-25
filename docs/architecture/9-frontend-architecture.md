# 9. Frontend Architecture

## 9.1 Component Organization

```
orchestratai_client/src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── chat/            # Chat components
│   ├── panels/          # Side panels
│   ├── layout/          # Layout components
│   └── providers/       # Context providers
├── lib/
│   ├── api-client.ts    # HTTP client
│   ├── api/chat.ts      # Chat API
│   ├── errors.ts        # Error classes
│   └── utils.ts         # Utilities
└── hooks/
    ├── use-chat.ts      # Chat logic
    └── use-mobile.ts    # Mobile detection
```

---

## 9.2 State Management

**Pattern:** React Context + useReducer

```typescript
// providers/chat-provider.tsx
'use client';

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, initialAgents }: Props) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = async (text: string) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });

    const result = await sendMessageSafe(text, state.sessionId);

    if (result.success) {
      dispatch({ type: 'ADD_MESSAGE', payload: result.data });
    }

    dispatch({ type: 'SET_PROCESSING', payload: false });
  };

  return (
    <ChatContext.Provider value={{ state, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
```

---

## 9.3 API Client

```typescript
// lib/api-client.ts
export class APIClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---
