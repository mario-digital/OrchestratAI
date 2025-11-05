# OrchestratAI Frontend

Next.js 15 + React 19 frontend with **Server Components**, **Tailwind CSS v4**, and **shadcn/ui**. Provides a modern, accessible chat interface for interacting with the multi-agent AI system.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Component Architecture](#component-architecture)
- [Styling & Design System](#styling--design-system)
- [State Management](#state-management)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Next.js 15 App Router

```
orchestratai_client/
├── src/
│   ├── app/                    # Next.js App Router (pages + layouts)
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home/landing page
│   │   ├── chat/
│   │   │   └── page.tsx        # Chat interface page
│   │   └── api/                # API routes (BFF pattern)
│   │       ├── health/
│   │       └── chat/           # Proxy to backend
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── chat/               # Chat-specific components
│   │   ├── layout/             # Layout components
│   │   └── shared/             # Shared/common components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChat.ts          # Chat state management
│   │   └── useStream.ts        # SSE streaming
│   ├── lib/                    # Utilities & helpers
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Common utilities
│   └── types/                  # TypeScript types
│       └── chat.ts             # Chat-related types
├── public/                     # Static assets
│   ├── screenshots/            # README images
│   └── favicon.ico
└── __tests__/                  # Test files
```

### Key Design Principles

- **Server Components First:** 90% Server Components, 10% Client Components
- **Progressive Enhancement:** Works without JavaScript for basic navigation
- **Type Safety:** TypeScript strict mode, end-to-end type safety
- **Accessibility:** WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Performance:** Optimized bundle size, lazy loading, streaming responses

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.5 | React meta-framework with App Router |
| **React** | React | 19.2 | UI library with Server Components |
| **Language** | TypeScript | 5.6+ | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework |
| **Components** | shadcn/ui | 3.5.0 | Accessible UI component library |
| **Icons** | Lucide React | Latest | Icon library |
| **State** | React Context + TanStack Query | v5 | Client state + server cache |
| **Validation** | Zod | 3.23+ | Schema validation |
| **Testing** | Vitest | Latest | Unit/integration tests |
| **E2E Testing** | Playwright | 1.55+ | Browser automation |
| **Package Manager** | Bun | 1.1+ | Fast JavaScript runtime |

---

## Project Structure

### Components Organization

```
src/components/
├── ui/                         # shadcn/ui primitives (copied locally)
│   ├── button.tsx              # Button component
│   ├── input.tsx               # Input field
│   ├── card.tsx                # Card container
│   ├── dialog.tsx              # Modal dialog
│   └── ...                     # Other UI primitives
├── chat/                       # Chat-specific components
│   ├── ChatInterface.tsx       # Main chat container (Client)
│   ├── ChatMessage.tsx         # Individual message (Server)
│   ├── ChatInput.tsx           # Message input field (Client)
│   ├── AgentIndicator.tsx      # Shows active agent (Client)
│   └── SourceList.tsx          # Document sources (Server)
├── layout/                     # Layout components
│   ├── Header.tsx              # Site header (Server)
│   ├── Footer.tsx              # Site footer (Server)
│   └── Sidebar.tsx             # Navigation sidebar (Server)
└── shared/                     # Shared/reusable components
    ├── LoadingSpinner.tsx      # Loading state
    ├── ErrorBoundary.tsx       # Error handling
    └── StreamingText.tsx       # Animated text streaming
```

### Server vs Client Components

Server Components (default):
- Render on server, no JavaScript sent to client
- Can directly access backend APIs, databases
- Better performance, smaller bundle size
- Examples: `ChatMessage.tsx`, `SourceList.tsx`, `Header.tsx`

Client Components (explicit "use client"):
- Render on client, include interactivity
- Use React hooks (useState, useEffect, etc.)
- Required for: forms, event handlers, streaming UI updates
- Examples: `ChatInterface.tsx`, `ChatInput.tsx`, `AgentIndicator.tsx`

Rule of thumb: Start with Server Component, only add `"use client"` when needed for interactivity.

---

## Setup & Installation

### Prerequisites

- **Bun 1.x** (JavaScript runtime) or **Node.js 18+**

### Installation Steps

1. **Install Bun:**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies:**
   ```bash
   cd orchestratai_client
   bun install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   bun dev
   ```

5. **Open browser:** http://localhost:3000

---

## Development

### Running Locally

**Start development server:**
```bash
bun dev
```

**Build and test production locally:**
```bash
bun run build
bun run start
# Opens on http://localhost:3000
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `OrchestratAI` |

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Development Commands

```bash
bun run typecheck  # TypeScript type checking
bun run lint       # ESLint code linting
bun run format     # Code formatting
```

---

## Component Architecture

### Chat Interface Flow

<div align="center">
  <img src="../orchestratai_client/public/screenshots/chat_interfase_flow.png" alt="Visual Backend Agent Architecture Diagram" width="600"/>
</div>

### Example: ChatInterface Component

File: `src/components/chat/ChatInterface.tsx`

```tsx
"use client";

import { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
      />
    </div>
  );
}
```

### Custom Hooks

#### useChat Hook

File: `src/hooks/useChat.ts`

```typescript
import { useState, useCallback } from "react";
import { ChatMessage } from "@/types/chat";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Stream AI response
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    });

    // Handle streaming (SSE)
    const reader = response.body?.getReader();
    // ... streaming logic

    setIsLoading(false);
  }, []);

  return { messages, sendMessage, isLoading };
}
```

---

## Styling & Design System

### Tailwind CSS v4

Configuration in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#f0f9ff", 100: "#e0f2fe", /* ... */ },
      },
    },
  },
};
export default config;
```

### shadcn/ui Components

Installation and usage:

```bash
bunx shadcn@latest init
bunx shadcn@latest add button input card
```

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MyComponent() {
  return (
    <>
      <Input placeholder="Type a message..." />
      <Button>Send</Button>
    </>
  );
}
```

Benefits: Accessible (Radix UI), customizable, type-safe, Tailwind-styled

---

## State Management

### Client State (React Context)

Minimal client state for:
- Current theme (light/dark)
- UI preferences
- Temporary form state

### Server State

Current approach: Direct API calls with React hooks

Future: TanStack Query for chat history caching, user preferences, API response caching, and optimistic updates

---

## Testing

### Running Tests

```bash
bun test              # Unit/integration tests
bun test --watch      # Watch mode
bun test --coverage   # Coverage report
bun test:e2e          # E2E tests with Playwright
```

### Test Structure

```
__tests__/
├── components/
│   ├── ChatInterface.test.tsx
│   ├── ChatMessage.test.tsx
│   └── ChatInput.test.tsx
├── hooks/
│   └── useChat.test.ts
└── utils/
    └── api.test.ts

e2e/
├── chat.spec.ts              # End-to-end chat flow
└── navigation.spec.ts        # Navigation tests
```

### Example Test

File: `__tests__/components/ChatMessage.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/ChatMessage";

describe("ChatMessage", () => {
  it("renders user message", () => {
    const message = {
      id: "1",
      role: "user",
      content: "Hello!",
      timestamp: new Date(),
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("Hello!")).toBeInTheDocument();
  });

  it("renders assistant message with sources", () => {
    const message = {
      id: "2",
      role: "assistant",
      content: "To authenticate...",
      sources: ["api/authentication.md"],
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("To authenticate...")).toBeInTheDocument();
    expect(screen.getByText(/authentication\.md/)).toBeInTheDocument();
  });
});
```

Test coverage target: 80%+ (enforced in CI)

---

## Performance Optimization

### Bundle Size

Target: < 350MB Docker image (frontend production build)

Optimization strategies:
- Tree shaking (automatic with Next.js)
- Code splitting per route
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization with next/font

### Rendering Performance

Server Components benefits:
- 90% reduction in JavaScript bundle
- Faster initial page load
- Better SEO (server-rendered HTML)

Client Component optimization:
- Lazy load with `React.lazy()` and `Suspense`
- Memoization with `React.memo()` for expensive renders
- `useCallback` and `useMemo` for expensive computations

### Network Performance

Streaming responses with Server-Sent Events (SSE):
- Real-time updates
- Incremental UI updates as data arrives
- Better perceived performance

---

## Accessibility

### Standards

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels)
- Color contrast requirements met
- Focus management

### Implementation Examples

Keyboard navigation:
```tsx
<button onClick={handleClick} onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") handleClick();
}}>
  Send
</button>
```

ARIA labels:
```tsx
<input type="text" aria-label="Chat message input" placeholder="Type a message..." />
```

Focus management:
```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => { inputRef.current?.focus(); }, []);
```

---

## Deployment

### Production Build

```bash
bun run build  # Build for production
bun run start  # Test production build locally
```

### Docker Deployment

Build Docker image from repository root:
```bash
docker build -t orchestratai-frontend:latest -f orchestratai_client/Dockerfile .
```

Run container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  orchestratai-frontend:latest
```

### Production Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.orchestratai.com
NEXT_PUBLIC_APP_NAME=OrchestratAI
NODE_ENV=production
```

---

## Troubleshooting

### Common Issues

**"Module not found" error:**
1. Check import path is correct (use @/ alias)
2. Verify file exists at path
3. Run `bun install` to re-install dependencies
4. Restart dev server

**Hydration mismatch error:**
1. Check for client-only code in Server Components
2. Ensure consistent rendering between server and client
3. Use suppressHydrationWarning sparingly if needed
4. Check for time-based or random content

**Tailwind styles not applying:**
1. Verify file is in content config (tailwind.config.ts)
2. Restart dev server after config changes
3. Check class names are correct (no typos)
4. Ensure Tailwind directives in globals.css

**API calls failing:**
1. Check NEXT_PUBLIC_API_URL is set correctly
2. Verify backend is running (http://localhost:8000)
3. Check CORS settings in backend
4. Inspect network tab for error details

---

## Additional Resources

- [Root README](../README.md) - Project overview and quick start
- [Backend README](../orchestratai_api/README.md) - Backend architecture
- [Architecture Docs](../docs/architecture/) - Detailed technical specs
- [Next.js Documentation](https://nextjs.org/docs) - Framework reference
- [React Documentation](https://react.dev/) - React 19 features
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

Questions or Issues? Open an issue on [GitHub](https://github.com/mario-digital/orchestratai/issues)
