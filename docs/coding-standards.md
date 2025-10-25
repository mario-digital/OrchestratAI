# OrchestratAI - Coding Standards

**Version:** 1.0.0
**Last Updated:** October 24, 2025
**Status:** ✅ Mandatory for All Development

---

## ⚠️ CRITICAL RULES - ZERO TOLERANCE

These rules are **ABSOLUTE** and violations will result in immediate PR rejection:

1. **🚫 NEVER use `git push --force`** - Force pushing is forbidden under all circumstances
2. **🚫 NEVER create design tokens without approval** - All new tokens require explicit user permission
3. **✅ ALWAYS run `bun run validate:enums`** - Enum synchronization must pass before every commit

See [Section 1.2](#12-design-token-creation-critical---requires-approval) and [Section 1.3](#13-git-force-push-forbidden) for complete details.

---

## Table of Contents

1. [Critical Fullstack Rules](#1-critical-fullstack-rules)
2. [Naming Conventions](#2-naming-conventions)
3. [File Organization](#3-file-organization)
4. [Import Order Standards](#4-import-order-standards)
5. [Design Token System](#5-design-token-system)
6. [TypeScript Standards](#6-typescript-standards)
7. [Python Standards](#7-python-standards)
8. [Testing Standards](#8-testing-standards)
9. [Git and Version Control](#9-git-and-version-control)

---

## 1. Critical Fullstack Rules

These standards prevent common mistakes and ensure consistency across AI-generated code:

### 1.1 Enum Synchronization (CRITICAL)

**Rule:** TypeScript and Python enums MUST be synchronized. The validation script MUST pass before every commit.

```typescript
// ✅ CORRECT: orchestratai_client/src/lib/enums.ts
export enum AgentId {
  Orchestrator = 'orchestrator',
  Billing = 'billing',
  Technical = 'technical',
  Policy = 'policy'
}

export enum AgentStatus {
  Idle = 'idle',
  Processing = 'processing',
  Completed = 'completed'
}
```

```python
# ✅ CORRECT: orchestratai_api/src/models/enums.py
from enum import Enum

class AgentId(str, Enum):
    ORCHESTRATOR = "orchestrator"
    BILLING = "billing"
    TECHNICAL = "technical"
    POLICY = "policy"

class AgentStatus(str, Enum):
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
```

**Validation:**
```bash
# This MUST pass before commit (enforced by Husky)
bun run validate:enums
```

**Rationale:**
- **Type safety across stack** - Frontend and backend share exact value contracts
- **Prevents runtime errors** - Invalid enum values caught at build time
- **API consistency** - Zod (frontend) and Pydantic (backend) validate same values

**Cross-language enum naming conventions:**

Python and TypeScript use different casing for enum members, but serialize to the same JSON values:

```python
# Python: UPPER_SNAKE for enum members (PEP 8)
class AgentStatus(str, Enum):
    IDLE = "idle"           # Member name: UPPER_SNAKE
    PROCESSING = "processing"
    COMPLETED = "completed"
```

```typescript
// TypeScript: PascalCase for enum members (TypeScript convention)
enum AgentStatus {
  Idle = 'idle',           // Member name: PascalCase
  Processing = 'processing',
  Completed = 'completed'
}
```

**JSON serialization (identical):**
```json
{
  "status": "idle"
}
```

**Key points:**
- Member names differ (Python: `IDLE`, TypeScript: `Idle`)
- String values match exactly (both: `"idle"`)
- API contract uses string values, so consistency is guaranteed
- Each language follows its own naming convention

---

### 1.2 Design Token Creation (CRITICAL - REQUIRES APPROVAL)

**Rule:** NEVER create new design tokens without explicit approval. ALWAYS ask the user before adding any token to the design system.

```css
/* ❌ WRONG: Creating new token without approval */
:root {
  --token-color-purple-500: #a855f7;  /* UNAUTHORIZED! */
}

@theme {
  --color-agent-card-border-purple: var(--token-color-purple-500);  /* UNAUTHORIZED! */
}

/* ✅ CORRECT: Use existing approved tokens */
:root {
  --token-color-cyan-600: #0891b2;  /* Approved in design system */
}

@theme {
  --color-agent-card-border-cyan: var(--token-color-cyan-600);  /* Approved */
}
```

**Process for requesting new tokens:**

1. **Identify the need** - Explain why existing tokens are insufficient
2. **Ask for approval** - Message the user: "I need a new design token for [use case]. The proposed token is `--token-color-[name]-[value]`. Should I proceed?"
3. **Wait for confirmation** - Do NOT create the token until user approves
4. **Document the token** - Add to appropriate token file with comment explaining purpose

**Why this rule exists:**
- **Design consistency** - Prevents token sprawl and maintains cohesive design system
- **UX control** - Design decisions require human approval, not AI autonomy
- **Token bloat prevention** - Uncontrolled token creation leads to unmaintainable stylesheets
- **Brand integrity** - Color and styling choices reflect brand identity

**If you need a styling solution:**
1. First, check if existing tokens can be combined (e.g., using opacity modifiers `/10`, `/20`, etc.)
2. If truly needed, ask for approval with clear justification
3. Never assume you have permission to extend the design system

**Violation consequences:**
- Pull requests will be rejected
- Design tokens must be removed
- Re-work required using approved tokens only

---

### 1.3 Git Force Push (FORBIDDEN)

**Rule:** NEVER use `git push --force` or `git push -f`. Force pushing is absolutely forbidden.

```bash
# ❌ FORBIDDEN: Force push
git push --force
git push -f
git push --force-with-lease  # Also forbidden

# ✅ CORRECT: Normal push
git push

# ✅ CORRECT: If push rejected, pull and merge
git pull origin main
# Resolve conflicts if any
git push
```

**Why this rule exists:**
- **Prevents history loss** - Force push overwrites remote history, potentially losing commits
- **Protects team work** - Other developers' commits can be erased
- **No recovery** - Lost commits may be unrecoverable
- **Breaks CI/CD** - Can corrupt deployment pipelines

**What to do if push is rejected:**

```bash
# Scenario: Your push is rejected due to remote changes

# 1. Pull the latest changes
git pull origin main

# 2. If conflicts, resolve them manually
# Edit conflicting files, then:
git add .
git commit -m "fix: resolve merge conflicts"

# 3. Push normally
git push origin main
```

**Emergency scenarios (still NO force push):**

Even if you made a mistake:
- **Wrong commit message?** Create a new commit with correction
- **Pushed sensitive data?** Contact repository admin immediately, rotate secrets
- **Pushed to wrong branch?** Create new branch from correct state, notify team

**If you believe force push is needed:**
1. Stop immediately
2. Ask the user: "The git history requires force push because [reason]. Should I proceed?"
3. Wait for explicit approval
4. Document the reason in commit message

**Violation consequences:**
- Immediate rollback required
- Repository may need restoration from backup
- Access privileges may be revoked

---

### 1.4 Type Sharing Pattern

**Rule:** All shared types between frontend and backend MUST be defined in TypeScript interfaces that mirror Pydantic models exactly.

```typescript
// ✅ CORRECT: packages/shared/src/types/agent.ts
import { AgentId, AgentStatus, AgentColor } from '../enums';

export interface Agent {
  id: AgentId;
  name: string;
  status: AgentStatus;
  model: string;
  color: AgentColor;
  tokensUsed: number;
  cost: number;
  cached?: boolean;
}
```

```python
# ✅ CORRECT: orchestratai_api/src/models/schemas.py
from pydantic import BaseModel
from src.models.enums import AgentId, AgentStatus, AgentColor

class Agent(BaseModel):
    id: AgentId
    name: str
    status: AgentStatus
    model: str
    color: AgentColor
    tokens_used: int  # Note: snake_case in Python
    cost: float
    cached: bool | None = None
```

**Frontend imports from shared package:**
```typescript
// In React components
import type { Agent } from '@orchestratai/shared';
```

**Rationale:**
- Single source prevents drift
- Backend validates at runtime with Pydantic
- Frontend gets compile-time safety

---

### 1.5 API Call Conventions

**Rule:** All API calls from frontend MUST go through the centralized `APIClient` class. Never use raw `fetch()` in components.

```typescript
// ❌ WRONG: Direct fetch in component
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
});

// ✅ CORRECT: Use APIClient service layer
import { apiClient } from '@/lib/api/chat';

const result = await apiClient.sendMessage({
  message: 'Hello',
  sessionId: currentSessionId
});
```

**APIClient Implementation:**
```typescript
// lib/api-client.ts
export class APIClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  private maxRetries = 3;

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
        });

        if (!response.ok) {
          const error = new APIError(response.status, await response.text());
          if (error.shouldRetry && attempt < this.maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt === this.maxRetries - 1) break;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();
```

**Rationale:**
- **Centralized error handling** - Transform all errors to `AppError` with user-friendly messages
- **Automatic retries** - Exponential backoff for 5xx errors
- **Logging** - Single point for request/response logging
- **Type safety** - Generic types ensure API contract adherence

---

### 1.6 Environment Variable Access

**Rule:** NEVER access `process.env` directly in components or services. Use centralized config.

```typescript
// ❌ WRONG: Direct access
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ CORRECT: Use config module
import { config } from '@/lib/config';
const apiUrl = config.apiUrl;
```

**Config Implementation:**
```typescript
// lib/config.ts
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL'),
  appName: getEnvVar('NEXT_PUBLIC_APP_NAME', 'OrchestratAI'),
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
```

**Backend equivalent:**
```python
# ❌ WRONG: Direct os.environ access
import os
redis_url = os.environ['REDIS_URL']

# ✅ CORRECT: Use Pydantic settings
from src.config import settings
redis_url = settings.REDIS_URL
```

**Backend Config:**
```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str
    CORS_ORIGINS: str = "http://localhost:3000"
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

---

### 1.7 State Update Patterns

**Rule:** Server state updates MUST use optimistic updates for perceived performance.

```typescript
// ❌ WRONG: Pessimistic update (slow UX)
const sendMessage = async (text: string) => {
  dispatch({ type: 'SET_PROCESSING', payload: true });
  const response = await apiClient.post('/api/chat', { message: text });
  dispatch({ type: 'ADD_MESSAGE', payload: response });
  dispatch({ type: 'SET_PROCESSING', payload: false });
};

// ✅ CORRECT: Optimistic update
const sendMessage = async (text: string) => {
  const optimisticMessage: Message = {
    id: crypto.randomUUID(),
    role: MessageRole.USER,
    content: text,
    timestamp: new Date(),
    sessionId: state.sessionId
  };

  // 1. Immediately show user message
  dispatch({ type: 'ADD_MESSAGE', payload: optimisticMessage });
  dispatch({ type: 'SET_PROCESSING', payload: true });

  try {
    // 2. Send to backend
    const response = await apiClient.post('/api/chat', {
      message: text,
      session_id: state.sessionId
    });

    // 3. Add AI response
    dispatch({ type: 'ADD_MESSAGE', payload: response.message });
  } catch (error) {
    // 4. Rollback on failure
    dispatch({ type: 'REMOVE_MESSAGE', payload: optimisticMessage.id });
    dispatch({ type: 'SET_ERROR', payload: error });
  } finally {
    dispatch({ type: 'SET_PROCESSING', payload: false });
  }
};
```

**Rationale:** Perceived latency < 500ms vs 1-2s with pessimistic updates

---

### 1.8 Error Handling Standards

**Rule:** All errors MUST be transformed to `AppError` with user-friendly messages.

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public requestId?: string
  ) {
    super(detail);
    this.name = 'APIError';
  }

  get userMessage(): string {
    switch (this.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again.';
      case 503:
        return 'Service temporarily unavailable. Retrying...';
      default:
        return 'An unexpected error occurred.';
    }
  }

  get shouldRetry(): boolean {
    return this.statusCode >= 500;
  }
}
```

**Usage in components:**
```typescript
// ❌ WRONG: Exposing raw errors
catch (error) {
  toast.error(error.message); // "Network request failed"
}

// ✅ CORRECT: Transform to user-friendly message
catch (error) {
  const apiError = error instanceof APIError
    ? error
    : new APIError(500, 'Unknown error');

  toast.error(apiError.userMessage);

  if (apiError.shouldRetry) {
    // Retry logic
  }
}
```

**Backend:**
```python
# ❌ WRONG: Leaking internal errors
raise ValueError("User not found in database")

# ✅ CORRECT: Use HTTPException with safe message
from fastapi import HTTPException

raise HTTPException(
    status_code=404,
    detail="User not found"
)
```

---

### 1.9 Server Component Rules

**Rule:** Server Components MUST NOT import client-only hooks or state.

```typescript
// ❌ WRONG: Using useState in Server Component
export default function ChatPage() {
  const [messages, setMessages] = useState([]); // ERROR!
  return <div>{messages.map(...)}</div>;
}

// ✅ CORRECT: Server fetches data, Client handles interactivity
// app/page.tsx (Server Component)
export default async function ChatPage() {
  const initialAgents = await fetchAgents();

  return <ChatInterface initialAgents={initialAgents} />;
}

// components/chat-interface.tsx (Client Component)
'use client';
export function ChatInterface({ initialAgents }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  // Interactive logic here
  return <div>...</div>;
}
```

**When to use Client Components:**
- `useState`, `useEffect`, `useReducer`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Third-party libraries that use hooks

---

### 1.10 Database Query Patterns (Backend)

**Rule:** All database queries MUST use service layer with proper error handling.

```python
# ❌ WRONG: Direct Redis access in routes
@router.post("/api/chat")
async def chat(request: ChatRequest):
    session_data = await redis.get(f"session:{request.session_id}")
    # Business logic mixed with data access
    return response

# ✅ CORRECT: Use service layer
@router.post("/api/chat")
async def chat(
    request: ChatRequest,
    session_manager: SessionManager = Depends(get_session_manager)
):
    session = await session_manager.get_session(request.session_id)
    response = generate_mock_response(request.message)
    await session_manager.update_metrics(session.id, response.metrics)
    return response
```

**Service Layer:**
```python
# services/session_manager.py
class SessionManager:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def get_session(self, session_id: str) -> ChatSession:
        data = await self.redis.hgetall(f"session:{session_id}")
        if not data:
            raise HTTPException(status_code=404, detail="Session not found")
        return ChatSession.parse_obj(data)

    async def update_metrics(self, session_id: str, metrics: ChatMetrics):
        await self.redis.hincrby(f"session:{session_id}", "total_tokens", metrics.tokens_used)
        await self.redis.hincrbyfloat(f"session:{session_id}", "total_cost", metrics.cost)
```

---

## 2. Naming Conventions

| Element | Convention | Frontend Example | Backend Example |
|---------|-----------|------------------|-----------------|
| React Components | PascalCase | `ChatInterface.tsx` | N/A |
| React Hooks | camelCase | `useChat.ts` | N/A |
| Client Components | kebab-case | `chat-interface.tsx` | N/A |
| Server Components | kebab-case | `chat-page.tsx` | N/A |
| API Routes (Next.js) | kebab-case | `app/api/chat/route.ts` | N/A |
| API Endpoints (FastAPI) | snake_case | N/A | `@router.post("/send_message")` |
| Python Classes | PascalCase | N/A | `SessionManager`, `MockAgentService` |
| Python Functions | snake_case | N/A | `def generate_mock_response()` |
| Database Keys (Redis) | snake_case | N/A | `session:{uuid}`, `metrics:{id}` |
| TypeScript Interfaces | PascalCase | `interface ChatContextValue {}` | N/A |
| TypeScript Types | PascalCase | `type MessageRole = ...` | N/A |
| CSS Custom Properties | kebab-case | `--color-accent-cyan` | N/A |
| Tailwind Classes | kebab-case | `bg-agent-card-border-cyan` | N/A |
| Environment Variables | UPPER_SNAKE | `NEXT_PUBLIC_API_URL` | `REDIS_URL` |
| Constants | UPPER_SNAKE | `const MAX_RETRIES = 3` | `MAX_RETRIES = 3` |
| Enum Types | PascalCase | `enum AgentStatus` | `class AgentStatus(Enum)` |
| Enum Members | PascalCase (TS) / UPPER_SNAKE (Python) | `AgentStatus.Processing` | `AgentStatus.PROCESSING` |

---

## 3. File Organization

### Frontend Structure

```
orchestratai_client/src/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Home page (Server Component)
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles + @theme
│
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── chat/                    # Chat-specific components
│   │   ├── chat-interface.tsx   # Main chat component
│   │   ├── message-bubble.tsx
│   │   └── input-area.tsx
│   ├── panels/                  # Side panels
│   │   ├── agent-panel.tsx
│   │   └── retrieval-panel.tsx
│   └── providers/               # Context providers
│       └── chat-provider.tsx
│
├── lib/
│   ├── api-client.ts            # HTTP client class
│   ├── api/
│   │   └── chat.ts              # Chat API functions
│   ├── config.ts                # Environment config
│   ├── errors.ts                # Error classes
│   └── utils.ts                 # Utilities
│
├── hooks/
│   ├── use-chat.ts              # Chat state hook
│   └── use-mobile.ts            # Mobile detection
│
└── styles/
    └── tokens/                  # CSS design tokens
        ├── colors.css
        ├── spacing.css
        └── typography.css
```

### Backend Structure

```
orchestratai_api/src/
├── main.py                      # FastAPI app entry
├── config.py                    # Pydantic settings
│
├── api/routes/
│   ├── health.py                # Health check
│   ├── chat.py                  # Chat endpoints
│   └── session.py               # Session management
│
├── agents/                      # Agent modules (future LangGraph)
│   ├── __init__.py
│   ├── base_agent.py            # Abstract base
│   ├── orchestrator.py          # Router agent
│   ├── billing_agent.py         # Billing support
│   ├── technical_agent.py       # Technical support
│   └── policy_agent.py          # Policy & compliance
│
├── services/
│   ├── mock_data.py             # Mock response generator (MVP)
│   └── session_manager.py       # Redis session management
│
├── models/
│   ├── enums.py                 # Enums (MUST match frontend!)
│   └── schemas.py               # Pydantic models
│
└── middleware/
    ├── error_handler.py         # Global error handling
    └── logging.py               # Request logging
```

---

## 4. Import Order Standards

### Frontend (TypeScript)

```typescript
// 1. External dependencies (React, libraries)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports (@/ alias)
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import type { Agent, Message } from '@orchestratai/shared';

// 3. Relative imports
import { MessageBubble } from './message-bubble';

// 4. Styles (if any)
import './styles.css';
```

### Backend (Python)

```python
# 1. Standard library imports
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from redis.asyncio import Redis

# 3. Local application imports
from src.models.schemas import ChatRequest, ChatResponse
from src.models.enums import AgentId, AgentStatus
from src.services.session_manager import SessionManager
from src.config import settings
```

---

## 5. Design Token System

### 5.1 Token Architecture (CRITICAL)

OrchestratAI follows a **3-layer design token system** from the my_flow_app reference:

```
Primitive Tokens (colors.css)
    ↓
Semantic Tokens (@theme in globals.css)
    ↓
Component Usage (Tailwind classes)
```

### 5.2 Primitive Tokens (Base Colors Only)

**Rule:** Primitive tokens define ONLY base colors without opacity.

```css
/* styles/tokens/colors.css */
:root {
  /* Base colors - NO opacity baked in! */
  --token-color-cyan-600: #0891b2;
  --token-color-cyan-700: #0e7490;
  --token-color-green-500: #22c55e;
  --token-color-red-500: #ef4444;
}
```

### 5.3 Semantic Tokens

```css
/* globals.css @theme block */
@theme {
  /* Agent colors */
  --color-agent-card-border-cyan: var(--token-color-cyan-600);
  --color-agent-card-border-green: var(--token-color-green-500);

  /* UI colors */
  --color-bg-primary: #ffffff;
  --color-text-primary: #171717;
  --color-border: #e5e5e5;
}
```

### 5.4 Component Usage with Opacity

**Rule:** Apply opacity at usage site with `/N` syntax. NEVER pre-bake opacity in token values.

```typescript
// ❌ WRONG: Pre-baked opacity in token
<div className="border-[#0891b24d]"> {/* Hardcoded opacity */}

// ❌ WRONG: Verbose arbitrary value syntax
<div className="border-[var(--color-agent-card-border-cyan)]">

// ✅ CORRECT: Tailwind utility + /N opacity syntax
<div className="border-agent-card-border-cyan/30">
```

**Complete Tailwind Mapping:**

| Tailwind Utility | CSS Custom Property | Usage |
|-----------------|---------------------|-------|
| `bg-bg-primary` | `var(--color-bg-primary)` | Primary background |
| `text-text-primary` | `var(--color-text-primary)` | Primary text |
| `border-border` | `var(--color-border)` | Standard border |
| `border-agent-card-border-cyan` | `var(--color-agent-card-border-cyan)` | Agent card (cyan) |
| `border-agent-card-border-green` | `var(--color-agent-card-border-green)` | Agent card (green) |

**All mappings defined in `globals.css` `@theme` block.**

---

## 6. TypeScript Standards

### 6.1 Enum Usage for Type Safety

**Rule:** ALWAYS use enums for fixed value sets. Prefer enums over union type literals.

```typescript
// ❌ DISCOURAGED: Union type literals
interface Message {
  role: 'user' | 'assistant' | 'system';
}

// ✅ PREFERRED: Use enums for autocomplete and type safety
enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

interface Message {
  role: MessageRole;
  content: string;
}

const message: Message = {
  role: MessageRole.User,  // Autocomplete works!
  content: 'Hello'
};
```

**Benefits:**
- **Autocomplete** - IDE suggests all valid values
- **Type safety** - Prevents typos
- **Refactoring** - Rename enum updates all usages
- **Discoverability** - Easy to find all possible values

### 6.2 Strict Type Checking

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 6.3 Avoid `any` Type

```typescript
// ❌ WRONG
function processData(data: any) {
  return data.items.map(item => item.value);
}

// ✅ CORRECT
interface DataItem {
  value: string;
}

interface Data {
  items: DataItem[];
}

function processData(data: Data) {
  return data.items.map(item => item.value);
}
```

---

## 7. Python Standards

### 7.1 Type Hints (Required)

```python
# ❌ WRONG: No type hints
def create_session(user_id):
    session_id = str(uuid4())
    return session_id

# ✅ CORRECT: Full type hints
from uuid import uuid4

def create_session(user_id: str) -> str:
    session_id = str(uuid4())
    return session_id
```

### 7.2 Pydantic for Data Validation

```python
# ❌ WRONG: Manual validation
def create_chat_response(data: dict):
    if 'message' not in data:
        raise ValueError("Missing message")
    if len(data['message']) > 2000:
        raise ValueError("Message too long")
    return data

# ✅ CORRECT: Pydantic validation
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str

def create_chat_response(request: ChatRequest):
    # Validation happens automatically
    return generate_response(request.message)
```

### 7.3 Async/Await for I/O

```python
# ❌ WRONG: Synchronous I/O
def get_session(session_id: str):
    return redis.get(f"session:{session_id}")

# ✅ CORRECT: Async I/O
async def get_session(session_id: str) -> ChatSession:
    data = await redis.hgetall(f"session:{session_id}")
    return ChatSession.parse_obj(data)
```

---

## 8. Testing Standards

### 8.1 Test Pyramid

```
     E2E (10%)      - Playwright full flows
    Integration (20%) - API route tests
   Unit Tests (70%)  - Component/function tests
```

### 8.2 Frontend Component Tests

```typescript
// components/__tests__/message-bubble.test.tsx
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../message-bubble';
import { MessageRole } from '@/lib/enums';

describe('MessageBubble', () => {
  it('renders user messages with correct styling', () => {
    const message = {
      id: '1',
      role: MessageRole.User,
      content: 'Hello',
      timestamp: new Date(),
      sessionId: '123'
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('bg-user-message');
  });
});
```

### 8.3 Backend API Tests

```python
# tests/test_chat.py
import pytest
from httpx import AsyncClient
from src.main import app

@pytest.mark.asyncio
async def test_chat_endpoint_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "test message",
                "session_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "agent" in data
    assert "metrics" in data
```

---

## 9. Git and Version Control

### 9.1 Commit Message Format

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting, semicolons)
refactor: Code refactoring
test: Adding tests
chore: Build/tooling changes

# Examples:
feat(chat): add optimistic UI updates
fix(api): handle session timeout errors
docs(readme): update Docker setup instructions
refactor(agents): extract base agent class
```

### 9.2 Branch Naming

```bash
# Format: <type>/<short-description>

feature/agent-panel-ui
fix/session-timeout
docs/architecture-updates
refactor/api-client
```

### 9.3 Pre-commit Hooks (Husky)

```bash
# Automatically runs before every commit:
1. bun run validate:enums  # Enum synchronization check
2. bun run lint            # ESLint
3. bun run format          # Prettier
```

**Never bypass hooks with `--no-verify` unless absolutely necessary.**

---

### 9.4 Force Push Policy (CRITICAL)

**🚫 Force pushing is ABSOLUTELY FORBIDDEN.**

See [Section 1.3: Git Force Push (FORBIDDEN)](#13-git-force-push-forbidden) for complete details on this critical rule.

**Quick reminder:**
- ❌ `git push --force` - FORBIDDEN
- ❌ `git push -f` - FORBIDDEN
- ❌ `git push --force-with-lease` - FORBIDDEN
- ✅ `git pull` then `git push` - CORRECT

**If you encounter push rejection:**
1. `git pull origin main`
2. Resolve any merge conflicts
3. `git push origin main`

**Never force push. No exceptions.**

---

## Document Status

**Status:** ✅ Ready for Implementation
**Last Updated:** October 24, 2025
**Mandatory Compliance:** All AI agents and developers MUST follow these standards

**Next Steps:**
1. Integrate into development workflow
2. Enforce via Husky pre-commit hooks
3. Reference during code reviews
4. Update as patterns evolve

---

**Related Documents:**
- [Architecture Document](./architecture.md)
- [PRD v2.0](./prd/orchestratai_prd_v2.md)
- Enum Validation Script: `scripts/validate-enums.ts`
