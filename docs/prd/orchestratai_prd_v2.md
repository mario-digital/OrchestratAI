# OrchestratAI - Product Requirements Document (PRD) v2.0

**Project Name**: OrchestratAI
**Version**: 2.0.0
**Last Updated**: October 24, 2025
**Document Type**: Frontend PRD with Minimal Backend Integration
**Repository**: https://github.com/mario-digital/OrchestratAI
**Status**: 📋 Ready for Implementation
**Previous Version**: v1.0.0 (superseded)

---

## Document Change Log

**v2.0.0 (October 24, 2025)**:
- ✅ **FIXED**: Clarified CSS design token system (base colors + Tailwind opacity syntax)
- ✅ **ADDED**: Section 4.5 - Execution Graph Specification
- ✅ **ADDED**: Section 7.3 - State Management Architecture
- ✅ **ADDED**: Section 8.4 - Modular Backend Structure (Day 1)
- ✅ **ADDED**: Section 13 - Frontend-Backend Integration Patterns
- ✅ **ADDED**: Section 14 - Error Handling & Edge Cases
- ✅ **ADDED**: Section 15 - Enum Synchronization Validation
- ✅ **UPDATED**: Technology stack with TanStack Query
- ✅ **UPDATED**: Implementation phases with realistic timelines
- ✅ **CLARIFIED**: Server Components First strategy

---

## Table of Contents

0. [Current Project Status](#0-current-project-status)
1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack-latest-versions---october-2025)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Core Features & Components](#4-core-features--components)
5. [Key User Interactions](#5-key-user-interactions)
6. [Data Models & TypeScript Types](#6-data-models--typescript-types)
7. [API Integration](#7-api-integration)
8. [Backend Setup](#8-backend-setup-minimal-mvp)
9. [Frontend Setup Instructions](#9-frontend-setup-instructions)
10. [Implementation Priority](#10-implementation-priority)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment](#12-deployment)
13. [Frontend-Backend Integration](#13-frontend-backend-integration)
14. [Error Handling & Edge Cases](#14-error-handling--edge-cases)
15. [Enum Synchronization Validation](#15-enum-synchronization-validation)
16. [Future Enhancements](#16-future-enhancements-post-mvp)
17. [Success Metrics](#17-success-metrics)
18. [Resources & References](#18-resources--references)

---

## 0. Current Project Status

### ✅ Already Completed

Based on the existing repository, the following infrastructure is already in place:

**Project Setup**:
- ✅ Repository initialized with git
- ✅ Docker and Docker Compose configuration
- ✅ Development and production docker-compose files
- ✅ Monorepo with Bun workspaces
- ✅ Package manager: **Bun** (for frontend)
- ✅ Backend package manager: **uv** (Python)
- ✅ Redis infrastructure configured
- ✅ Husky + lint-staged for pre-commit hooks

**Technology Stack Confirmed**:
- ✅ Frontend: Next.js 15, React 19, TypeScript
- ✅ Backend: FastAPI, Python 3.12
- ✅ Styling: Tailwind CSS v4
- ✅ Containerization: Docker with hot reload
- ✅ Code quality: ESLint 9, Prettier, Vitest

**Backend Structure**:
- ✅ Modular organization started (`api/`, `config.py`, `main.py`)
- ✅ Health check endpoint implemented
- ✅ CORS middleware configured
- ✅ FastAPI Swagger docs at `/docs`

**Development Environment**:
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://localhost:8000
- ✅ API Documentation: http://localhost:8000/docs
- ✅ Hot reload enabled for development
- ✅ Docker network: `orchestratai-network` configured

**Docker Commands Available**:
```bash
# Development mode (with hot reload)
docker compose up

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Production mode
docker compose -f docker-compose.prod.yml up
```

### 🚧 To Be Implemented

Everything outlined in this PRD that isn't checked above, including:
- [ ] 3-layer CSS design token system (my_flow_app pattern)
- [ ] TypeScript enums + Zod validation
- [ ] Frontend components (chat interface, panels, etc.)
- [ ] Backend agent implementation (modular structure)
- [ ] shadcn/ui components installation
- [ ] Chat endpoint with mock data
- [ ] Enum synchronization validation script

### 📝 Notes for Implementation

- **Use Bun** for all frontend package management (not npm/pnpm)
- **Use uv** for Python package management
- **Docker-first development**: All development should be done through Docker Compose
- **Server Components First**: Use React Server Components by default, client components only when needed
- **Design Token System**: Follow my_flow_app pattern (base tokens + Tailwind opacity)
- **Modular Backend**: Organize into `agents/`, `models/`, `services/` from Day 1
- Redis is available for session management when needed
- FastAPI Swagger docs auto-generated at `/docs` endpoint

---

## 1. Executive Summary

**OrchestratAI** is an advanced customer service AI application featuring a multi-agent architecture with intelligent routing and specialized support capabilities. The application showcases a **modular monolith architecture** - a single deployable unit with clearly separated, loosely-coupled modules that can be easily extracted into microservices in the future.

This PRD focuses on the frontend implementation using cutting-edge technologies (Next.js 15, React 19, Tailwind v4) and a minimal backend setup to demonstrate the system's capabilities as a portfolio-ready proof of concept. The modular monolith approach provides the simplicity of a single deployment while maintaining the architectural benefits of service separation, making it ideal for an MVP while demonstrating production-ready design thinking.

**Key Differentiators**:
- 🎨 **Production-grade 3-layer design token system** (proven in my_flow_app)
- 🔒 **Type-safe end-to-end** (TypeScript enums + Zod + Python Pydantic)
- 🏗️ **Modular from Day 1** (even with mock data)
- 📱 **Mobile-first responsive** (desktop 3-panel, mobile tabs)
- 🚀 **Server Components First** (Next.js 15 RSC pattern)
- 🔄 **Real-time updates** (Server-Sent Events for streaming)

---

## 2. Technology Stack (Latest Versions - October 2025)

### Frontend

- **Framework**: Next.js 15.5 (latest stable - August 2025) ✅ *Already configured*
  - App Router architecture
  - React Server Components (RSC) - **Server Components First approach**
  - Turbopack for builds (beta)
  - Server Actions support

- **React**: Version 19.2 (latest stable - October 2025) ✅ *Already configured*
  - React Compiler optimizations
  - Actions API
  - Enhanced Suspense
  - useActionState, useOptimistic hooks

- **UI Library**: shadcn/ui (v3.5.0 - latest) 🚧 *To be installed*
  - Radix UI primitives
  - Tailwind CSS v4 compatible
  - Fully customizable components

- **Styling**: Tailwind CSS v4 (latest) ✅ *Already configured*
  - **3-layer design token system** (following my_flow_app pattern)
  - CSS custom properties via `@theme`
  - Utility-first approach

- **Icons**: Lucide React 🚧 *To be installed*

- **TypeScript**: v5.x ✅ *Already configured*

- **Runtime Validation**: Zod v3.x 🚧 *To be installed*
  - Type-safe API request/response validation
  - Form validation
  - Environment variable validation
  - Automatic TypeScript type inference

- **Package Manager**: **Bun** (not npm/pnpm) ✅ *Already configured*

- **State Management**:
  - React Server Components (primary)
  - React Context (client-side only when needed)
  - TanStack Query v5 (optional - Phase 5 for caching)

- **Real-time Communication**: Server-Sent Events (SSE) - Phase 4

### Backend (Minimal MVP)

- **Architecture**: Modular Monolith ✅ *Structure in place*
  - Single deployable FastAPI application
  - Clear module separation (agents, services, API routes)
  - Designed for easy extraction to microservices
  - Clean interfaces between modules

- **Framework**: FastAPI (Python 3.12) ✅ *Already configured*

- **Package Manager**: **uv** (Python) ✅ *Already configured*

- **Infrastructure**:
  - Docker ✅ *Already configured*
  - Redis ✅ *Already configured*

- **API Structure**:
  - `/api/health` ✅ *Implemented*
  - `/api/chat` 🚧 *To implement with mocks*

- **Mock Data**: Static responses simulating agent behavior 🚧 *To be implemented*

- **API Docs**: Auto-generated Swagger at `/docs` ✅ *Already available*

### Development Tools ✅ *All configured*

- **Containerization**: Docker + Docker Compose with hot reload
- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Testing**: Vitest (frontend), pytest (backend)
- **Git Hooks**: Husky + lint-staged
- **Type Checking**: TypeScript (FE), mypy (BE)

---

## 3. Frontend Architecture

### 3.1 Project Structure

```
orchestratai/                          # Project root (monorepo)
├── orchestratai_client/               # Frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with providers
│   │   │   ├── page.tsx              # Home/Landing page (Server Component)
│   │   │   ├── chat/
│   │   │   │   └── page.tsx          # Main chat interface (Server Component)
│   │   │   ├── globals.css           # Token imports + @theme
│   │   │   ├── styles/               # NEW: Token organization
│   │   │   │   └── tokens/
│   │   │   │       ├── colors.css    # Layer 1: Color primitives
│   │   │   │       ├── typography.css
│   │   │   │       ├── spacing.css
│   │   │   │       ├── effects.css
│   │   │   │       └── animation.css
│   │   │   └── api/
│   │   │       └── chat/
│   │   │           └── route.ts      # API route for client-side calls
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   ├── chat/
│   │   │   │   ├── chat-interface.tsx    # Main chat component (Client)
│   │   │   │   ├── message-bubble.tsx    # Individual messages
│   │   │   │   ├── input-area.tsx        # Message input (Client)
│   │   │   │   └── typing-indicator.tsx  # Loading state
│   │   │   ├── panels/
│   │   │   │   ├── agent-panel.tsx       # Left panel - Agent pipeline
│   │   │   │   ├── retrieval-panel.tsx   # Right panel - Logs
│   │   │   │   └── collapsible-panel.tsx # Reusable collapsible wrapper
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── mobile-nav.tsx
│   │   │   └── providers/
│   │   │       └── chat-provider.tsx     # Chat state context (Client)
│   │   ├── lib/
│   │   │   ├── api-client.ts         # NEW: Base HTTP client
│   │   │   ├── api/
│   │   │   │   └── chat.ts           # NEW: Chat API functions
│   │   │   ├── enums.ts              # TypeScript enums
│   │   │   ├── schemas.ts            # Zod schemas
│   │   │   ├── types.ts              # TypeScript types (inferred)
│   │   │   ├── errors.ts             # NEW: Custom error classes
│   │   │   └── utils.ts              # Utility functions
│   │   ├── hooks/
│   │   │   ├── use-chat.ts           # Chat logic hook
│   │   │   ├── use-streaming.ts      # SSE streaming hook (Phase 4)
│   │   │   └── use-mobile.ts         # Mobile detection
│   │   ├── public/
│   │   │   └── logo.svg
│   │   ├── __tests__/                # Tests
│   │   ├── next.config.ts            # Next.js config
│   │   ├── tailwind.config.ts        # Tailwind config
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   └── eslint.config.mjs
│
├── orchestratai_api/                  # Backend application
│   └── src/
│       ├── main.py                   # FastAPI app entry point
│       ├── config.py                 # Configuration
│       ├── api/
│       │   ├── __init__.py
│       │   ├── health.py             # ✅ Health check (implemented)
│       │   └── chat.py               # 🚧 Chat endpoint (to implement)
│       ├── agents/                   # 🚧 Agent modules (to create)
│       │   ├── __init__.py
│       │   ├── base.py               # Abstract BaseAgent
│       │   └── mock_agents.py        # Mock agent responses for MVP
│       ├── models/                   # 🚧 Pydantic models (to create)
│       │   ├── __init__.py
│       │   ├── enums.py              # Python enums (mirror frontend!)
│       │   └── schemas.py            # Request/response models
│       └── services/                 # 🚧 Shared services (to create)
│           ├── __init__.py
│           └── mock_data.py          # Mock response generator
│
├── scripts/                           # 🚧 Utility scripts (to create)
│   └── validate-enums.ts             # Enum synchronization validator
│
├── docs/
│   └── prd/
│       ├── orchestratai_prd.md       # v1.0 (superseded)
│       └── orchestratai_prd_v2.md    # v2.0 (this document)
│
├── docker-compose.yml                # ✅ Development setup
├── docker-compose.prod.yml           # ✅ Production setup
├── package.json                      # ✅ Monorepo scripts
└── README.md
```

**Key Organization Principles**:
1. **Server Components First**: Default to Server Components, mark Client Components with `'use client'`
2. **Token Separation**: CSS tokens in dedicated files, imported via layers
3. **Modular Backend**: Even with mocks, maintain clean separation
4. **Type Safety**: Enums → Zod → Types pipeline for both FE and BE
5. **Testability**: Tests co-located with implementation

---

## 4. Core Features & Components

### 4.1 Desktop Layout (768px+)

#### Three-Panel Layout

**Left Panel: Agent Pipeline (Collapsible)**
- Display of all 4 agents (Orchestrator, Billing, Technical, Policy)
- Real-time status indicators (IDLE, ROUTING, ACTIVE)
- Agent details:
  - Model name (e.g., "OpenAI GPT-4o")
  - Strategy badge (RAG/CAG/Hybrid)
  - Token usage counter
  - Cost tracking
  - Cache status
- Execution graph link (navigates to separate page - Phase 5)

**Center Panel: Chat Interface**
- Conversation history
- Message bubbles with:
  - User messages (right-aligned, blue)
  - AI messages (left-aligned, dark)
  - Agent attribution badge
  - Confidence score display
- Message input area
- Session ID display
- Typing indicator during processing

**Right Panel: Retrieval Log (Collapsible)**
- Real-time operation logs with timestamps
- Query analysis section:
  - Intent classification
  - Confidence score
  - Target agent
  - Reasoning
- Vector search details:
  - Collection name
  - Chunks retrieved
  - Similarity scores
  - Latency metrics
- Cache operations:
  - Cache status
  - Hit rate
  - Size information
- Retrieved documents preview:
  - Source file names
  - Document snippets (truncated)
  - Similarity scores
  - "View Full" buttons
- Color-coded by operation type

#### Header

- Logo + "OrchestratAI" branding
- Subtitle: "LangGraph Orchestrator + RAG/CAG Hybrid"
- System status indicator (ACTIVE)

#### Footer Stats Bar

- Real-time metrics:
  - Latency (with clock icon)
  - Total tokens (with CPU icon)
  - Total cost (with trending icon)
  - Database status (ChromaDB Connected)

### 4.2 Mobile Layout (< 768px)

#### Tabbed Interface

- Three tabs: Chat | Agents | Logs
- Full-screen panels
- Swipeable tabs
- Same footer stats (responsive)

### 4.3 Color System

**Agent Color Coding**:
- Orchestrator: Cyan (`#06B6D4`)
- Billing Agent: Green (`#10B981`)
- Technical Agent: Blue (`#3B82F6`)
- Policy Agent: Purple (`#A855F7`)

**Retrieval Strategy Badges**:
- RAG: Blue background
- CAG: Purple background
- Hybrid RAG/CAG: Green background

**Status Colors**:
- Success/Complete: Green (`#10B981`)
- Warning/Routing: Yellow (`#F59E0B`)
- Error: Red (`#EF4444`)
- Idle: Gray (`#6B7280`)

**Theme**:
- **Dark Mode Only** (no light mode toggle)
- Background: Dark theme (`#0F172A`, `#1E293B`, `#0A0F1E`)
- Text: Light gray to white gradient
- Accents: Per agent color scheme

### 4.4 Design System - 3-Layer CSS Design Tokens

**CRITICAL**: This follows the proven my_flow_app pattern.

#### Architecture

```
Layer 1: Primitives (Base Values) → colors.css, typography.css, etc.
    ↓
Layer 2: Semantic Tokens (Contextual Meanings) → @theme block
    ↓
Layer 3: Component Tokens (Component-Specific) → @theme block
    ↓
Usage: Base tokens + Tailwind /N opacity syntax
```

#### Token Organization Structure

```
orchestratai_client/src/app/
├── globals.css              # Token imports + @theme block
└── styles/
    └── tokens/
        ├── colors.css       # Layer 1: Color primitives
        ├── typography.css   # Layer 1: Font primitives
        ├── spacing.css      # Layer 1: Space primitives
        ├── effects.css      # Layer 1: Shadows, radius, z-index
        └── animation.css    # Layer 1: Durations, easing
```

#### Implementation in `globals.css`

```css
/* ========================================
   LAYER 1: PRIMITIVE TOKENS (Imported)
   ======================================== */
@import './styles/tokens/colors.css' layer(tokens.colors);
@import './styles/tokens/typography.css' layer(tokens.typography);
@import './styles/tokens/spacing.css' layer(tokens.spacing);
@import './styles/tokens/effects.css' layer(tokens.effects);
@import './styles/tokens/animation.css' layer(tokens.animation);

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ========================================
   LAYERS 2 & 3: SEMANTIC + COMPONENT TOKENS
   ======================================== */
@theme {
  /* ==========================================
     LAYER 2: SEMANTIC TOKENS
     ========================================== */

  /* Backgrounds */
  --color-bg-primary: var(--token-color-slate-950);      /* #0a0f1e */
  --color-bg-secondary: var(--token-color-slate-900);    /* #0f172a */
  --color-bg-tertiary: var(--token-color-slate-800);     /* #1e293b */
  --color-bg-elevated: var(--token-color-slate-700);     /* #334155 */

  /* Text */
  --color-text-primary: var(--token-color-gray-50);      /* #f9fafb */
  --color-text-secondary: var(--token-color-gray-300);   /* #d1d5db */
  --color-text-tertiary: var(--token-color-gray-500);    /* #6b7280 */
  --color-text-muted: var(--token-color-gray-600);       /* #4b5563 */

  /* Borders */
  --color-border-default: var(--token-color-gray-700);   /* #374151 */
  --color-border-subtle: var(--token-color-gray-800);    /* #1f2937 */

  /* ==========================================
     LAYER 3: COMPONENT TOKENS
     Base colors only - NO opacity baked in!
     ========================================== */

  /* Agent Cards - Base colors */
  --color-agent-card-bg: var(--color-bg-secondary);
  --color-agent-card-border-cyan: var(--token-color-cyan-600);
  --color-agent-card-border-green: var(--token-color-green-600);
  --color-agent-card-border-blue: var(--token-color-blue-600);
  --color-agent-card-border-purple: var(--token-color-purple-600);
  --color-agent-card-text-cyan: var(--token-color-cyan-400);
  --color-agent-card-text-green: var(--token-color-green-400);
  --color-agent-card-text-blue: var(--token-color-blue-400);
  --color-agent-card-text-purple: var(--token-color-purple-400);

  /* Status Badges */
  --color-badge-idle-bg: var(--token-color-gray-700);
  --color-badge-idle-text: var(--token-color-gray-400);
  --color-badge-active: var(--token-color-green-500);
  --color-badge-routing: var(--token-color-yellow-500);

  /* Messages */
  --color-message-user-bg: var(--token-color-blue-600);
  --color-message-user-text: var(--token-color-gray-50);
  --color-message-assistant-bg: var(--color-bg-secondary);
  --color-message-assistant-text: var(--token-color-gray-300);
  --color-message-assistant-border: var(--color-border-default);

  /* Retrieval Logs */
  --color-log-border-success: var(--token-color-green-500);
  --color-log-border-warning: var(--token-color-yellow-500);
  --color-log-border-error: var(--token-color-red-500);
  --color-log-text-routing: var(--token-color-purple-400);
  --color-log-text-vector: var(--token-color-blue-400);
  --color-log-text-cache: var(--token-color-green-400);
  --color-log-text-docs: var(--token-color-cyan-400);

  /* Panels */
  --color-panel-bg: var(--color-bg-tertiary);
  --color-panel-border: var(--color-border-default);

  /* Inputs */
  --color-input-bg: var(--color-bg-secondary);
  --color-input-border: var(--color-border-default);
  --color-input-border-focus: var(--token-color-cyan-500);

  /* Buttons */
  --color-button-primary-bg: var(--token-color-cyan-600);
  --color-button-primary-hover: var(--token-color-cyan-500);

  /* Spacing */
  --spacing-panel-collapsed: 3rem;
  --spacing-panel-sm: 20rem;
  --spacing-panel-lg: 24rem;

  /* Border Radius */
  --radius-message: 0.75rem;
  --radius-card: 0.5rem;
  --radius-badge: 0.25rem;
}

/* Global body styles */
@layer base {
  body {
    @apply bg-bg-primary text-text-primary;
  }
}
```

#### Example Token File: `colors.css`

```css
/* styles/tokens/colors.css */
@layer tokens.colors {
  :root {
    /* ==========================================
       PRIMITIVE COLOR TOKENS
       ========================================== */

    /* Cyan (Orchestrator) */
    --token-color-cyan-400: #22d3ee;
    --token-color-cyan-500: #06b6d4;
    --token-color-cyan-600: #0891b2;

    /* Green (Billing Agent) */
    --token-color-green-300: #86efac;
    --token-color-green-400: #4ade80;
    --token-color-green-500: #10b981;
    --token-color-green-600: #059669;

    /* Blue (Technical Agent) */
    --token-color-blue-400: #60a5fa;
    --token-color-blue-500: #3b82f6;
    --token-color-blue-600: #2563eb;

    /* Purple (Policy Agent) */
    --token-color-purple-300: #d8b4fe;
    --token-color-purple-400: #c084fc;
    --token-color-purple-500: #a855f7;
    --token-color-purple-600: #9333ea;

    /* Grays */
    --token-color-gray-50: #f9fafb;
    --token-color-gray-100: #f3f4f6;
    --token-color-gray-300: #d1d5db;
    --token-color-gray-400: #9ca3af;
    --token-color-gray-500: #6b7280;
    --token-color-gray-600: #4b5563;
    --token-color-gray-700: #374151;
    --token-color-gray-800: #1f2937;
    --token-color-gray-900: #111827;

    /* Slates (Backgrounds) */
    --token-color-slate-700: #334155;
    --token-color-slate-800: #1e293b;
    --token-color-slate-900: #0f172a;
    --token-color-slate-950: #0a0f1e;

    /* Status Colors */
    --token-color-yellow-300: #fde047;
    --token-color-yellow-400: #facc15;
    --token-color-yellow-500: #f59e0b;

    --token-color-red-400: #f87171;
    --token-color-red-500: #ef4444;
  }
}
```

#### Usage in Components - THE CRITICAL PATTERN

**✅ CORRECT - Token + Tailwind Opacity Syntax**:

```tsx
// components/panels/agent-card.tsx
export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="
      bg-agent-card-bg
      border border-agent-card-border-cyan/30
      rounded-card
      p-3
    ">
      <h2 className="text-agent-card-text-cyan text-lg">
        {agent.name}
      </h2>
      <span className="
        bg-badge-active/20
        text-green-300
        px-2 py-1
        rounded-badge
      ">
        ACTIVE
      </span>
    </div>
  );
}
```

**Key Pattern**:
- **Tokens define base colors**: `--color-agent-card-border-cyan: #0891b2`
- **Tailwind applies opacity**: `border-agent-card-border-cyan/30` → 30% opacity
- **Best of both worlds**: Semantic naming + flexible opacity

**❌ WRONG - Arbitrary Values**:
```tsx
// DON'T DO THIS!
<div className="bg-[#1e293b]">              // ❌ Arbitrary hex
<div className="bg-[var(--panel-bg)]">      // ❌ CSS var in className
<div style={{ backgroundColor: 'var(--color-bg-primary)' }}>  // ❌ Inline styles
```

#### ESLint Rule to Enforce

```js
// eslint-local-rules.mjs
module.exports = {
  'no-arbitrary-color-values': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow arbitrary color values in className',
      },
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name === 'className') {
            const value = node.value?.value || '';
            if (value.includes('[#') || value.includes('[var(')) {
              context.report({
                node,
                message: 'Use design tokens instead of arbitrary color values. Use token classes with /N opacity syntax.',
              });
            }
          }
        },
      };
    },
  },
};
```

#### Benefits of This Approach

1. **Single Source of Truth**: Change `--token-color-cyan-500` globally
2. **Semantic Clarity**: `agent-card-border-cyan` > `cyan-600`
3. **Flexible Opacity**: Apply any opacity at usage site (`/10`, `/20`, `/50`, etc.)
4. **Type Safety**: Can generate TypeScript types from CSS variables
5. **Maintainability**: Update one layer without touching others
6. **Consistency**: Impossible to use wrong colors accidentally
7. **Performance**: Tailwind compiles only used utilities

---

### 4.5 Execution Graph Specification (NEW)

**Status**: Phase 5+ (Not MVP blocker)

The execution graph visualizes the LangGraph agent routing and execution flow. This will be implemented on a **separate page** (`/chat/[sessionId]/graph`), not in the main chat interface.

#### Purpose

- **Debugging**: Understand agent routing decisions
- **Transparency**: Show users how their query was processed
- **Portfolio Feature**: Demonstrates advanced architecture understanding

#### Visual Design

**Layout**: Vertical flow graph (top to bottom)

```
┌─────────────────┐
│  User Query     │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Router  │ (Cyan - Orchestrator)
    └────┬────┘
         │
    ┌────▼─────────┬──────────┐
    │              │          │
┌───▼───┐    ┌────▼───┐  ┌───▼───┐
│Billing│    │Technical│ │Policy │
│(Green)│    │ (Blue)  │ │(Purple)│
└───┬───┘    └────┬───┘  └───┬───┘
    │             │          │
    └─────────┬───┴──────────┘
              │
         ┌────▼────┐
         │ Response│
         └─────────┘
```

#### Data Model

```typescript
// lib/types.ts
export interface GraphNode {
  id: string;
  type: 'query' | 'router' | 'agent' | 'response';
  agentId?: AgentId;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  confidence?: number;
}

export interface ExecutionGraph {
  sessionId: string;
  messageId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  startTime: string;
  endTime?: string;
}
```

#### Library Choice

**Recommended**: **React Flow** (https://reactflow.dev/)
- Pros: React-native, highly customizable, good performance
- Cons: Larger bundle size
- Alternative: D3.js (more control, steeper learning curve)

**Fallback (MVP)**: Simple ordered list with indentation
```tsx
<ul>
  <li>1. Query received: "What are your pricing tiers?"</li>
  <li className="ml-4">2. Router → Billing Agent (confidence: 94%)</li>
  <li className="ml-8">3. Billing Agent executed</li>
  <li className="ml-4">4. Response generated</li>
</ul>
```

#### Implementation Timeline

- **Phase 1-4**: Use fallback list view
- **Phase 5**: Implement React Flow graph
- **Phase 6**: Add animation and interactive tooltips

---

## 5. Key User Interactions

### 5.1 Sending a Message

1. User types in input field
2. User clicks "Send" or presses Enter
3. **Optimistic UI update**: Message appears in chat immediately
4. Left panel shows orchestrator status → ROUTING
5. Right panel displays query analysis log
6. Target agent status changes to ACTIVE
7. Retrieval logs appear in real-time (SSE - Phase 4)
8. Response streams into chat (token by token - Phase 4)
9. Agent status returns to IDLE
10. Footer metrics update

### 5.2 Collapsing Panels

1. User clicks chevron icon on panel header
2. Panel smoothly animates to collapsed state (3rem width)
3. Only collapse icon remains visible
4. Center chat panel expands to fill space
5. Click again to restore panel
6. State persists in localStorage

### 5.3 Mobile Navigation

1. User taps tab (Chat/Agents/Logs)
2. Active panel slides in
3. Previous panel slides out
4. Tab indicator updates
5. Swipe gesture support (optional - Phase 5)

### 5.4 Viewing Execution Graph (Phase 5)

1. User clicks "View Graph" button on message
2. Navigate to `/chat/[sessionId]/graph/[messageId]`
3. Graph renders with animation
4. Hover over nodes for details
5. Click node to see full metadata
6. Back button returns to chat

---

## 6. Data Models & TypeScript Types

### 6.1 TypeScript Enums (Compile-Time Type Safety)

```typescript
// lib/enums.ts

export enum AgentStatus {
  IDLE = 'idle',
  ROUTING = 'routing',
  ACTIVE = 'active',
}

export enum AgentId {
  ORCHESTRATOR = 'orchestrator',
  BILLING = 'billing',
  TECHNICAL = 'technical',
  POLICY = 'policy',
}

export enum RetrievalStrategy {
  PURE_RAG = 'Pure RAG',
  PURE_CAG = 'Pure CAG',
  HYBRID_RAG_CAG = 'Hybrid RAG/CAG',
}

export enum AgentColor {
  CYAN = 'cyan',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum LogStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum LogType {
  ROUTING = 'routing',
  VECTOR_SEARCH = 'vector_search',
  CACHE = 'cache',
  DOCUMENTS = 'documents',
}
```

### 6.2 Zod Schemas (Runtime Validation)

```typescript
// lib/schemas.ts
import { z } from 'zod';
import {
  AgentStatus,
  AgentId,
  RetrievalStrategy,
  AgentColor,
  MessageRole,
  LogStatus,
  LogType
} from './enums';

// Create Zod schemas from enums
export const AgentStatusSchema = z.nativeEnum(AgentStatus);
export const AgentIdSchema = z.nativeEnum(AgentId);
export const RetrievalStrategySchema = z.nativeEnum(RetrievalStrategy);
export const AgentColorSchema = z.nativeEnum(AgentColor);
export const MessageRoleSchema = z.nativeEnum(MessageRole);
export const LogStatusSchema = z.nativeEnum(LogStatus);
export const LogTypeSchema = z.nativeEnum(LogType);

// Agent schema
export const AgentSchema = z.object({
  id: AgentIdSchema,
  name: z.string(),
  status: AgentStatusSchema,
  model: z.string(),
  strategy: RetrievalStrategySchema.optional(),
  color: AgentColorSchema,
  tokensUsed: z.number().int().min(0),
  cost: z.number().min(0),
  cached: z.boolean().optional(),
});

// Message schema
export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1),
  agent: AgentIdSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  timestamp: z.date(),
});

// Document chunk schema
export const DocumentChunkSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  similarity: z.number().min(0).max(1),
  source: z.string(),
});

// Retrieval log schema
export const RetrievalLogSchema = z.object({
  id: z.string().uuid(),
  type: LogTypeSchema,
  title: z.string(),
  data: z.record(z.any()),
  timestamp: z.string(),
  status: LogStatusSchema,
  chunks: z.array(DocumentChunkSchema).optional(),
});

// API schemas
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  session_id: z.string().uuid(),
});

export const ChatMetricsSchema = z.object({
  tokens_used: z.number().int().min(0),
  cost: z.number().min(0),
  latency: z.number().int().min(0),
});

export const ChatResponseSchema = z.object({
  message: z.string(),
  agent: AgentIdSchema,
  confidence: z.number().min(0).max(1),
  logs: z.array(RetrievalLogSchema),
  metrics: ChatMetricsSchema,
});

// Chat state schema
export const ChatStateSchema = z.object({
  messages: z.array(MessageSchema),
  agents: z.array(AgentSchema),
  retrievalLogs: z.array(RetrievalLogSchema),
  isProcessing: z.boolean(),
  sessionId: z.string().uuid(),
  totalTokens: z.number().int().min(0),
  totalCost: z.number().min(0),
  latency: z.number().int().min(0),
});

// Environment variable validation
export const EnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('OrchestratAI'),
});
```

### 6.3 TypeScript Types (Inferred from Zod)

```typescript
// lib/types.ts
import type { z } from 'zod';
import {
  AgentSchema,
  MessageSchema,
  RetrievalLogSchema,
  DocumentChunkSchema,
  ChatRequestSchema,
  ChatResponseSchema,
  ChatStateSchema,
  ChatMetricsSchema,
} from './schemas';

// Re-export enums for easy imports
export {
  AgentStatus,
  AgentId,
  RetrievalStrategy,
  AgentColor,
  MessageRole,
  LogStatus,
  LogType,
} from './enums';

// Infer types from Zod schemas
export type Agent = z.infer<typeof AgentSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type RetrievalLog = z.infer<typeof RetrievalLogSchema>;
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ChatState = z.infer<typeof ChatStateSchema>;
export type ChatMetrics = z.infer<typeof ChatMetricsSchema>;
```

### 6.4 Benefits of Enums + Zod Pattern

**TypeScript Enums**:
- Compile-time type checking
- Autocomplete in IDE
- Refactoring support (find all usages)
- Reverse mapping
- Switch statement exhaustiveness checking

**Zod with nativeEnum**:
- Runtime validation of enum values
- Ensures API responses match expected enums
- Catches unexpected values before they reach components
- Works seamlessly with TypeScript enums

**Combined Benefits**:
```typescript
// Compile-time safety
function updateAgentStatus(status: AgentStatus) {
  switch (status) {
    case AgentStatus.IDLE:
      return 'Agent is idle';
    case AgentStatus.ROUTING:
      return 'Agent is routing';
    case AgentStatus.ACTIVE:
      return 'Agent is active';
    // TypeScript ensures all cases covered!
  }
}

// Runtime validation
const apiData = { status: 'idle' };
const validated = AgentStatusSchema.parse(apiData.status);
// validated is typed as AgentStatus and guaranteed valid!
```

---

## 7. API Integration

### 7.1 Backend Endpoint (Minimal MVP)

**Endpoint**: `POST http://localhost:8000/api/chat`

**Request**:
```json
{
  "message": "What are your pricing tiers?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** (JSON):
```json
{
  "message": "I can help you with pricing information...",
  "agent": "billing",
  "confidence": 0.94,
  "logs": [
    {
      "id": "log-001",
      "type": "routing",
      "title": "QUERY ANALYSIS",
      "data": {
        "intent": "billing_inquiry",
        "confidence": 0.94,
        "target": "Billing Support",
        "reasoning": "Keywords: pricing, tiers"
      },
      "timestamp": "14:32:18",
      "status": "success"
    },
    {
      "id": "log-002",
      "type": "vector_search",
      "title": "VECTOR SEARCH",
      "data": {
        "collection": "billing_docs",
        "chunks": 3,
        "topSimilarity": 0.89,
        "method": "Hybrid RAG/CAG",
        "latency": "247ms"
      },
      "timestamp": "14:32:18",
      "status": "success"
    }
  ],
  "metrics": {
    "tokens_used": 1243,
    "cost": 0.0034,
    "latency": 247
  }
}
```

### 7.2 Frontend API Client

```typescript
// lib/api-client.ts
'use client';

import { APIError } from './errors';

export class APIClient {
  private baseUrl: string;

  constructor() {
    // CRITICAL: Uses Docker service name for server-side calls
    // Browser calls use localhost, Next.js Server Components use service name
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(response.status, errorText);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
}

export const apiClient = new APIClient();
```

```typescript
// lib/api/chat.ts
import { apiClient } from '../api-client';
import { ChatRequestSchema, ChatResponseSchema } from '../schemas';
import type { ChatRequest, ChatResponse } from '../types';
import { ZodError } from 'zod';

export async function sendMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  // Validate request
  const validatedRequest = ChatRequestSchema.parse({
    message,
    session_id: sessionId,
  });

  // Make API call
  const rawResponse = await apiClient.post<unknown>(
    '/api/chat',
    validatedRequest
  );

  // Validate response
  const validatedResponse = ChatResponseSchema.parse(rawResponse);

  return validatedResponse;
}

// With error handling
export async function sendMessageSafe(
  message: string,
  sessionId: string
): Promise<{ success: true; data: ChatResponse } | { success: false; error: string }> {
  try {
    const response = await sendMessage(message, sessionId);
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      return { success: false, error: 'Invalid data format' };
    }
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

### 7.3 State Management Architecture (NEW)

**Server Components First Strategy**

OrchestratAI follows the **Server Components First** pattern introduced in Next.js 15 and React 19.

#### State Distribution

**1. Server State (React Server Components)**

Default for:
- Initial page load with server-rendered data
- Static configuration (agent definitions)
- SEO-friendly metadata
- Initial chat history (on page load)

```typescript
// app/chat/page.tsx (Server Component by default)
export default async function ChatPage() {
  // Fetch data on server
  const initialAgents = await getAgentConfig();

  return <ChatInterface initialAgents={initialAgents} />;
}

// No 'use client' directive = Server Component!
```

**2. Client State (React Context)**

Only for:
- Real-time updates (message streaming)
- User interactions (input, panel collapse)
- Optimistic UI updates
- Transient UI state

```typescript
// components/providers/chat-provider.tsx
'use client';  // Explicitly mark as Client Component

import { createContext, useContext, useState } from 'react';

interface ChatContextValue {
  messages: Message[];
  agents: Agent[];
  isProcessing: boolean;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  children,
  initialAgents
}: {
  children: React.ReactNode;
  initialAgents: Agent[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState(initialAgents);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (text: string) => {
    setIsProcessing(true);

    // Optimistic update
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: MessageRole.USER,
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await sendMessageAPI(text, sessionId);

      // Update with real response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.ASSISTANT,
        content: response.message,
        agent: response.agent,
        confidence: response.confidence,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update agent statuses from logs
      // ... (agent status updates)

    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, agents, isProcessing, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
```

**3. Real-Time Updates (Server-Sent Events - Phase 4)**

```typescript
// hooks/use-streaming.ts
'use client';

import { useEffect, useState } from 'react';

interface StreamUpdate {
  type: 'agent_status' | 'log' | 'message_chunk';
  data: unknown;
}

export function useStreaming(sessionId: string) {
  const [streamData, setStreamData] = useState<StreamUpdate | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/stream?session=${sessionId}`
    );

    eventSource.onmessage = (event) => {
      const update: StreamUpdate = JSON.parse(event.data);
      setStreamData(update);
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return streamData;
}
```

#### Implementation Phases

**Phase 1-3 (MVP)**: Simple Client Components with useState + fetch

```typescript
// Simplified approach for MVP
'use client';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (text: string) => {
    setIsProcessing(true);

    // Optimistic update
    setMessages([...messages, { role: 'user', content: text }]);

    // API call
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();

    setMessages(prev => [...prev, data]);
    setIsProcessing(false);
  };

  return (/* JSX */);
}
```

**Phase 4**: Add SSE streaming (useStreaming hook)

**Phase 5**: Optional TanStack Query for caching and background refetching

```typescript
// lib/queries/chat.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useChatHistory(sessionId: string) {
  return useQuery({
    queryKey: ['chat', sessionId],
    queryFn: () => fetchChatHistory(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      // Invalidate and refetch chat history
      queryClient.invalidateQueries(['chat', variables.sessionId]);
    },
  });
}
```

#### Real-Time Update Flow

```
User sends message
    ↓
Optimistic UI update (show user message immediately)
    ↓
POST /api/chat → Backend processes
    ↓
SSE connection streams updates (Phase 4):
  1. { type: 'agent_status', data: { agent: 'orchestrator', status: 'routing' } }
  2. { type: 'log', data: { type: 'routing', title: 'QUERY ANALYSIS', ... } }
  3. { type: 'agent_status', data: { agent: 'billing', status: 'active' } }
  4. { type: 'message_chunk', data: { chunk: 'I can help...' } }
  5. { type: 'agent_status', data: { agent: 'billing', status: 'idle' } }
    ↓
UI updates in real-time via Context
```

#### When to Use Which Pattern

| State Type | Pattern | Example |
|------------|---------|---------|
| Static data, initial load | Server Component | Agent configurations |
| User interactions | Client Component + useState | Input field value |
| Optimistic updates | Client Component + useState | Message send |
| Real-time streams | Client Component + SSE | Agent status changes |
| Cached API data | TanStack Query (Phase 5) | Chat history |
| Global UI state | React Context | Panel collapsed state |

---

## 8. Backend Setup (Minimal MVP)

### 8.1 Technology Overview

- **Framework**: FastAPI (Python 3.12)
- **Package Manager**: uv
- **Architecture**: Modular Monolith (organized from Day 1)
- **Mock Data**: For MVP, all responses are simulated
- **Future**: Real LangGraph + RAG/CAG integration

### 8.2 Installation

```bash
# From project root
cd orchestratai_api

# uv will automatically create venv and install dependencies
uv sync
```

### 8.3 Current Structure (Already Implemented)

```python
# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.health import router as health_router
from src.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS configured for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api", tags=["health"])

@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "Welcome to OrchestratAI API",
        "version": settings.app_version,
        "docs": "/docs",
    }
```

### 8.4 Modular Backend Structure - Day 1 Organization (NEW)

**CRITICAL**: Even with mock data, we organize into modules from the start.

#### Target Directory Structure

```
orchestratai_api/
└── src/
    ├── main.py                 # ✅ FastAPI app (already exists)
    ├── config.py               # ✅ Settings (already exists)
    ├── api/
    │   ├── __init__.py
    │   ├── health.py           # ✅ Health check (already exists)
    │   └── chat.py             # 🚧 TO CREATE: Chat endpoint
    ├── agents/                 # 🚧 TO CREATE
    │   ├── __init__.py
    │   ├── base.py             # Abstract BaseAgent class
    │   └── mock_agents.py      # Mock agent responses for MVP
    ├── models/                 # 🚧 TO CREATE
    │   ├── __init__.py
    │   ├── enums.py            # Python enums (MUST mirror frontend!)
    │   └── schemas.py          # Pydantic request/response models
    └── services/               # 🚧 TO CREATE
        ├── __init__.py
        └── mock_data.py        # Mock response generator
```

#### Phase 1 Implementation Steps

**Step 1**: Create Python enums (mirror frontend)

```python
# src/models/enums.py
from enum import Enum

class AgentStatus(str, Enum):
    IDLE = "idle"
    ROUTING = "routing"
    ACTIVE = "active"

class AgentId(str, Enum):
    ORCHESTRATOR = "orchestrator"
    BILLING = "billing"
    TECHNICAL = "technical"
    POLICY = "policy"

class LogType(str, Enum):
    ROUTING = "routing"
    VECTOR_SEARCH = "vector_search"
    CACHE = "cache"
    DOCUMENTS = "documents"

class LogStatus(str, Enum):
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"

# CRITICAL: These MUST match frontend enums exactly!
# Validation script will check this.
```

**Step 2**: Create Pydantic schemas

```python
# src/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .enums import AgentId, LogType, LogStatus

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(..., pattern=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')

class RetrievalLog(BaseModel):
    id: str
    type: LogType
    title: str
    data: Dict[str, Any]
    timestamp: str
    status: LogStatus

class ChatMetrics(BaseModel):
    tokens_used: int = Field(..., ge=0)
    cost: float = Field(..., ge=0)
    latency: int = Field(..., ge=0)

class ChatResponse(BaseModel):
    message: str
    agent: AgentId
    confidence: float = Field(..., ge=0, le=1)
    logs: List[RetrievalLog]
    metrics: ChatMetrics
```

**Step 3**: Create mock data service

```python
# src/services/mock_data.py
import random
import time
from typing import List, Dict, Any
from src.models.enums import AgentId, LogType, LogStatus
from src.models.schemas import RetrievalLog, ChatMetrics, ChatResponse

MOCK_RESPONSES = {
    "billing": {
        "keywords": ["price", "pricing", "cost", "tier", "billing", "pay"],
        "message": "I can help you with pricing information. We offer three enterprise tiers: Professional ($99/mo), Business ($299/mo), and Enterprise (custom pricing).",
        "confidence": 0.94,
    },
    "technical": {
        "keywords": ["api", "key", "technical", "error", "bug", "code"],
        "message": "To reset your API key, navigate to Settings > API Keys, click the three dots next to your current key, and select 'Regenerate'.",
        "confidence": 0.89,
    },
    "policy": {
        "keywords": ["policy", "privacy", "terms", "data", "gdpr"],
        "message": "According to our Terms of Service, user data is retained for 90 days after account deletion. Contact privacy@orchestratai.com for immediate deletion.",
        "confidence": 0.92,
    },
}

def get_agent_for_message(message: str) -> str:
    """Simple keyword matching to determine agent"""
    message_lower = message.lower()

    for agent, config in MOCK_RESPONSES.items():
        if any(keyword in message_lower for keyword in config["keywords"]):
            return agent

    return "billing"  # Default

def generate_mock_logs(agent: str) -> List[RetrievalLog]:
    """Generate mock retrieval logs"""
    timestamp = time.strftime("%H:%M:%S")

    return [
        RetrievalLog(
            id=f"log-{random.randint(1000, 9999)}",
            type=LogType.ROUTING,
            title="QUERY ANALYSIS",
            data={
                "intent": f"{agent}_inquiry",
                "confidence": round(random.uniform(0.85, 0.95), 2),
                "target": f"{agent.title()} Support",
                "reasoning": "Keywords detected in query"
            },
            timestamp=timestamp,
            status=LogStatus.SUCCESS
        ),
        RetrievalLog(
            id=f"log-{random.randint(1000, 9999)}",
            type=LogType.VECTOR_SEARCH,
            title="VECTOR SEARCH",
            data={
                "collection": f"{agent}_docs",
                "chunks": random.randint(2, 5),
                "topSimilarity": round(random.uniform(0.80, 0.95), 2),
                "method": "Hybrid RAG/CAG",
                "latency": f"{random.randint(100, 300)}ms"
            },
            timestamp=timestamp,
            status=LogStatus.SUCCESS
        )
    ]

def generate_mock_response(message: str) -> ChatResponse:
    """Generate complete mock chat response"""
    agent = get_agent_for_message(message)
    response_config = MOCK_RESPONSES[agent]

    tokens_used = random.randint(800, 1500)

    return ChatResponse(
        message=response_config["message"],
        agent=AgentId(agent),
        confidence=response_config["confidence"],
        logs=generate_mock_logs(agent),
        metrics=ChatMetrics(
            tokens_used=tokens_used,
            cost=round(tokens_used * 0.000003, 4),
            latency=random.randint(200, 400)
        )
    )
```

**Step 4**: Create chat endpoint

```python
# src/api/chat.py
from fastapi import APIRouter, HTTPException
from src.models.schemas import ChatRequest, ChatResponse
from src.services.mock_data import generate_mock_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint with mock responses for MVP

    Future: This will integrate with real LangGraph orchestration
    """
    try:
        response = generate_mock_response(request.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Step 5**: Register chat router in main.py

```python
# src/main.py (updated)
from src.api.health import router as health_router
from src.api.chat import router as chat_router  # NEW

app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(chat_router, prefix="/api", tags=["chat"])  # NEW
```

#### Benefits of Modular Organization from Day 1

1. **Clear Separation**: Even mocks are organized by responsibility
2. **Easy Testing**: Each module can be tested independently
3. **Ready for Real Implementation**: Drop in LangGraph later without restructuring
4. **Team Scalability**: Clear where new features go
5. **Microservice-Ready**: Folders can become separate services

#### Future Evolution (Not MVP)

```python
# agents/orchestrator.py (Future)
from langchain.graphs import StateGraph
from .base import BaseAgent

class OrchestratorAgent(BaseAgent):
    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        # LangGraph orchestration logic
        pass

    async def route(self, query: str) -> AgentId:
        # Real routing logic with LangChain
        pass
```

---

## 9. Frontend Setup Instructions

### 9.1 Install Dependencies

**IMPORTANT**: Use Bun, not npm/pnpm

```bash
# Navigate to frontend
cd orchestratai_client

# Install shadcn/ui dependencies
bun add lucide-react zod class-variance-authority clsx tailwind-merge

# Install shadcn/ui CLI and initialize
bunx shadcn@latest init

# Follow prompts:
# - Style: New York
# - Base color: Zinc
# - CSS variables: Yes
# - Components location: src/components/ui
```

### 9.2 Add Required shadcn Components

```bash
cd orchestratai_client

bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add card
bunx shadcn@latest add badge
bunx shadcn@latest add separator
bunx shadcn@latest add scroll-area
```

### 9.3 Install Additional Dependencies

```bash
cd orchestratai_client

# Runtime validation
bun add zod

# Optional: TanStack Query (Phase 5)
# bun add @tanstack/react-query

# Development dependencies (if not already present)
bun add -D @types/node @types/react @types/react-dom
```

### 9.4 Environment Variables

Create `.env.local`:

```bash
# orchestratai_client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=OrchestratAI
```

**For Docker**: Already configured in `docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://backend:8000  # Service name resolution
```

### 9.5 Validate Environment Variables

```typescript
// src/lib/env.ts
import { EnvSchema } from './schemas';

export const env = EnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

// Usage in app
import { env } from '@/lib/env';
console.log(env.NEXT_PUBLIC_API_URL); // Type-safe!
```

---

## 10. Implementation Priority

### Phase 1: Foundation & Design System (Days 1-5)

**Goal**: Set up architecture and design tokens

- [x] ~~Next.js 15 project~~ *Already configured*
- [x] ~~Docker + Docker Compose~~ *Already configured*
- [x] ~~Bun package manager~~ *Already configured*
- [ ] **Install shadcn/ui** (30 min)
- [ ] **Install Zod** (5 min)
- [ ] **Create token file structure** (2 hours)
  - [ ] `styles/tokens/colors.css`
  - [ ] `styles/tokens/typography.css`
  - [ ] `styles/tokens/spacing.css`
  - [ ] `styles/tokens/effects.css`
  - [ ] `styles/tokens/animation.css`
  - [ ] Update `globals.css` with imports and @theme
- [ ] **Create TypeScript enums** (2 hours)
  - [ ] `lib/enums.ts` with all enum definitions
- [ ] **Create Zod schemas** (3 hours)
  - [ ] `lib/schemas.ts` with validation schemas
  - [ ] `lib/types.ts` with inferred types
- [ ] **Create backend enums** (1 hour)
  - [ ] `orchestratai_api/src/models/enums.py`
- [ ] **Create enum validation script** (2 hours)
  - [ ] `scripts/validate-enums.ts`
  - [ ] Add to `package.json` scripts
  - [ ] Add to Husky pre-commit
- [ ] **Create three-panel desktop layout** (4 hours)
  - [ ] Basic layout component
  - [ ] Panel structure
  - [ ] Responsive grid
- [ ] **Implement collapsible panel functionality** (3 hours)
  - [ ] Collapse/expand animation
  - [ ] State persistence
- [ ] **Add header and footer components** (2 hours)

**Estimated Time**: ~20 hours (4-5 days with testing)

### Phase 2: Chat Interface (Days 6-10)

**Goal**: Build core chat functionality with mock backend

- [ ] **Create backend modular structure** (3 hours)
  - [ ] `models/schemas.py` (Pydantic models)
  - [ ] `services/mock_data.py`
  - [ ] `api/chat.py` endpoint
- [ ] **Create API client** (2 hours)
  - [ ] `lib/api-client.ts`
  - [ ] `lib/api/chat.ts`
  - [ ] `lib/errors.ts`
- [ ] **Build message components** (4 hours)
  - [ ] Message bubble (user/assistant)
  - [ ] Message list with scrolling
- [ ] **Implement chat state management** (4 hours)
  - [ ] Chat provider context
  - [ ] Message state
  - [ ] Processing state
- [ ] **Add input area with send functionality** (3 hours)
  - [ ] Input component
  - [ ] Send button
  - [ ] Enter key handling
- [ ] **Create typing indicator** (1 hour)
- [ ] **Add optimistic UI updates** (2 hours)
- [ ] **Test FE/BE integration** (3 hours)
  - [ ] Verify Docker networking
  - [ ] Test chat flow end-to-end

**Estimated Time**: ~22 hours (5 days with testing)

### Phase 3: Agent & Log Panels (Days 11-15)

**Goal**: Implement agent visualization and retrieval logs

- [ ] **Build agent status cards** (4 hours)
  - [ ] Agent card component
  - [ ] Status badges
  - [ ] Metrics display
- [ ] **Implement agent panel** (3 hours)
  - [ ] Agent list
  - [ ] Real-time status updates
- [ ] **Implement retrieval log components** (5 hours)
  - [ ] Log card component
  - [ ] Log type styling
  - [ ] Timestamp formatting
- [ ] **Add document preview modals** (3 hours)
  - [ ] Modal component
  - [ ] Document chunk display
- [ ] **Create real-time status updates** (3 hours)
  - [ ] Update agents from chat response
  - [ ] Update logs from chat response

**Estimated Time**: ~18 hours (4-5 days with testing)

### Phase 4: Mobile Layout & Real-Time (Days 16-20)

**Goal**: Mobile responsiveness and SSE streaming

- [ ] **Build mobile tabbed interface** (4 hours)
  - [ ] Tab navigation
  - [ ] Tab panels
  - [ ] Swipe gestures (optional)
- [ ] **Implement SSE streaming** (Backend) (4 hours)
  - [ ] Create `/api/chat/stream` endpoint
  - [ ] Stream agent status updates
  - [ ] Stream retrieval logs
- [ ] **Implement SSE streaming** (Frontend) (4 hours)
  - [ ] `hooks/use-streaming.ts`
  - [ ] Integrate with chat provider
- [ ] **Mobile responsive testing** (3 hours)
- [ ] **Add error handling** (3 hours)
  - [ ] Error boundaries
  - [ ] API error handling
  - [ ] Toast notifications

**Estimated Time**: ~18 hours (4-5 days with testing)

### Phase 5: Polish & Enhancement (Days 21-25)

**Goal**: Final polish, animations, and optional features

- [ ] **Add animations and transitions** (4 hours)
  - [ ] Panel collapse animation
  - [ ] Message appear animation
  - [ ] Loading states
- [ ] **Optimize mobile responsiveness** (3 hours)
- [ ] **Add keyboard shortcuts** (2 hours)
  - [ ] Enter to send
  - [ ] Esc to clear input
  - [ ] Ctrl+/ for shortcuts help
- [ ] **Implement session persistence** (3 hours)
  - [ ] Redis session storage
  - [ ] Load chat history
- [ ] **Performance testing** (3 hours)
  - [ ] Lighthouse audit
  - [ ] Bundle size optimization
- [ ] **Accessibility improvements** (3 hours)
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader testing
- [ ] **Optional: TanStack Query integration** (4 hours)
  - [ ] Setup query client
  - [ ] Convert API calls to queries/mutations
  - [ ] Implement caching
- [ ] **Optional: Execution Graph (separate page)** (6 hours)
  - [ ] React Flow setup
  - [ ] Graph visualization
  - [ ] Navigation from messages

**Estimated Time**: ~22-28 hours (5-7 days with testing)

### Phase 6: Documentation & Deployment (Days 26-28)

**Goal**: Production-ready deployment

- [ ] **Update README** (2 hours)
  - [ ] Component documentation
  - [ ] API documentation
  - [ ] Development guide
- [ ] **Create demo video script** (1 hour)
- [ ] **Record demo video** (2 hours)
  - [ ] Showcase all features
  - [ ] Explain architecture
- [ ] **Deploy to Vercel (frontend)** (1 hour)
- [ ] **Optional: Deploy backend** (2 hours)
  - [ ] Railway/Render
  - [ ] Environment variables
- [ ] **Final testing** (3 hours)
  - [ ] End-to-end testing
  - [ ] Cross-browser testing
  - [ ] Mobile device testing

**Estimated Time**: ~11 hours (2-3 days)

---

**Total Estimated Time**: ~111-117 hours (~4-5 weeks at 25-30 hours/week)

---

## 11. Testing Strategy

### 11.1 Manual Testing Checklist

**Desktop Layout**:
- [ ] All three panels visible and correctly positioned
- [ ] Panels collapsible and expand correctly
- [ ] Animations smooth (60fps)
- [ ] Panel state persists in localStorage

**Mobile Layout**:
- [ ] Tabs work correctly
- [ ] Panels stack properly
- [ ] Swipe gestures work (if implemented)
- [ ] Footer metrics responsive

**Chat Functionality**:
- [ ] Messages send and display correctly
- [ ] User messages right-aligned, AI left-aligned
- [ ] Typing indicator appears during processing
- [ ] Optimistic UI updates work
- [ ] Error messages display correctly

**Agent Panel**:
- [ ] Agent status updates in real-time
- [ ] Status badges show correct colors
- [ ] Metrics update correctly
- [ ] Agent cards use correct design tokens

**Retrieval Log Panel**:
- [ ] Logs appear with proper formatting
- [ ] Color coding is consistent
- [ ] Timestamps display correctly
- [ ] Document previews work

**Color System**:
- [ ] Agent colors match specification
- [ ] Status colors correct
- [ ] Dark theme consistent throughout
- [ ] No arbitrary color values used (ESLint check)

**Footer Metrics**:
- [ ] Metrics update correctly
- [ ] Icons display properly
- [ ] Database status indicator works

**Responsive Design**:
- [ ] Works at 320px width (mobile)
- [ ] Works at 768px (tablet breakpoint)
- [ ] Works at 1024px+ (desktop)
- [ ] No horizontal scroll on any device

### 11.2 Automated Testing

**Unit Tests (Vitest)**:
```typescript
// __tests__/lib/api-client.test.ts
describe('APIClient', () => {
  it('should validate requests with Zod', () => {
    // Test request validation
  });

  it('should handle API errors correctly', () => {
    // Test error handling
  });
});

// __tests__/components/message-bubble.test.tsx
describe('MessageBubble', () => {
  it('should render user messages correctly', () => {
    // Test component rendering
  });

  it('should use correct design tokens', () => {
    // Test className includes token classes
  });
});
```

**Enum Synchronization**:
```bash
# Run before every commit (Husky)
bun run validate:enums
```

**Integration Tests (Playwright - Optional Phase 6)**:
```typescript
// e2e/chat.spec.ts
test('should send message and receive response', async ({ page }) => {
  await page.goto('http://localhost:3000/chat');
  await page.fill('[data-testid="message-input"]', 'What are your pricing tiers?');
  await page.click('[data-testid="send-button"]');

  await expect(page.locator('[data-testid="message-bubble"]')).toContainText('pricing tiers');
  await expect(page.locator('[data-agent="billing"]')).toBeVisible();
});
```

### 11.3 Browser Compatibility

**Target Browsers**:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Chrome/Safari (latest)

**Testing Tools**:
- BrowserStack (optional)
- Real device testing (iPhone, Android)
- Responsive design mode in DevTools

### 11.4 Accessibility Testing

**Tools**:
- Lighthouse (Accessibility score > 90)
- axe DevTools
- Screen reader testing (VoiceOver, NVDA)

**Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on all buttons/inputs
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader can navigate entire app

---

## 12. Deployment

### 12.1 Frontend Deployment (Vercel - Recommended)

**Why Vercel**:
- Native Next.js support
- Automatic deployments from GitHub
- Edge functions for API routes
- Free tier for hobby projects

**Steps**:
1. Connect GitHub repository to Vercel
2. Vercel auto-detects Next.js configuration
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_APP_NAME=OrchestratAI
   ```
4. Deploy!

**Alternative**: Netlify, Cloudflare Pages

### 12.2 Backend Deployment (Optional for MVP)

**Option 1: Railway.app** (Recommended for MVP)
- Easy Docker deployment
- PostgreSQL/Redis add-ons
- Free tier available

**Option 2: Render.com**
- Similar to Railway
- Free tier with sleep on inactivity

**Option 3: AWS EC2**
- More control
- Requires more DevOps knowledge

**Option 4: Keep it local**
- Run backend only for demo video
- Focus on frontend portfolio piece

### 12.3 Docker Production Deployment

If deploying both FE + BE via Docker:

```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Environment variables in .env.prod
NEXT_PUBLIC_API_URL=https://api.orchestratai.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## 13. Frontend-Backend Integration (NEW)

### 13.1 Docker Network Configuration

**Your docker-compose.yml is already correctly configured!**

```yaml
# docker-compose.yml
services:
  frontend:
    environment:
      # CRITICAL: Use service name 'backend' for container-to-container communication
      - NEXT_PUBLIC_API_URL=http://backend:8000

  backend:
    # Service name: 'backend' is resolvable within Docker network

networks:
  orchestratai-network:
    driver: bridge
```

**How it works**:
- Docker Compose creates network `orchestratai-network`
- Services resolve each other by name: `backend` → internal IP
- From browser (client-side Next.js), still use `http://localhost:8000`
- From Next.js Server Components, use `http://backend:8000`

### 13.2 API Client Pattern (Following my_flow_app)

**File Structure**:
```
src/lib/
├── api-client.ts          # Base HTTP client
├── api/
│   └── chat.ts            # Chat-specific API functions
├── enums.ts               # TypeScript enums (mirror backend!)
├── schemas.ts             # Zod validation
├── types.ts               # Inferred types
├── errors.ts              # Custom error classes
└── utils.ts               # Helper functions
```

**Base API Client**:

```typescript
// lib/api-client.ts
'use client';

import { APIError } from './errors';

export class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(response.status, errorText);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
}

export const apiClient = new APIClient();
```

**Custom Error Class**:

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'APIError';
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }
}
```

**Chat API with Validation**:

```typescript
// lib/api/chat.ts
import { apiClient } from '../api-client';
import { ChatRequestSchema, ChatResponseSchema } from '../schemas';
import type { ChatRequest, ChatResponse } from '../types';
import { ZodError } from 'zod';
import { APIError } from '../errors';

export async function sendMessage(
  message: string,
  sessionId: string
): Promise<ChatResponse> {
  // Validate request before sending
  const validatedRequest = ChatRequestSchema.parse({
    message,
    session_id: sessionId,
  });

  // Make API call
  const rawResponse = await apiClient.post<unknown>(
    '/api/chat',
    validatedRequest
  );

  // Validate response from backend
  const validatedResponse = ChatResponseSchema.parse(rawResponse);

  return validatedResponse;
}

// Safe version with error handling
export async function sendMessageSafe(
  message: string,
  sessionId: string
): Promise<{ success: true; data: ChatResponse } | { success: false; error: string }> {
  try {
    const response = await sendMessage(message, sessionId);
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      return { success: false, error: 'Invalid data format from server' };
    }
    if (error instanceof APIError) {
      if (error.isServerError) {
        return { success: false, error: 'Server error. Please try again.' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

### 13.3 Usage in Components

**Server Component** (initial load):

```typescript
// app/chat/page.tsx
import { getAgentConfig } from '@/lib/api/agents';

export default async function ChatPage() {
  // Fetches on server using http://backend:8000 in Docker
  const initialAgents = await getAgentConfig();

  return <ChatInterface initialAgents={initialAgents} />;
}
```

**Client Component** (user interactions):

```typescript
// components/chat/chat-interface.tsx
'use client';

import { useState } from 'react';
import { sendMessageSafe } from '@/lib/api/chat';
import { toast } from 'sonner';

export function ChatInterface({ initialAgents }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (text: string) => {
    setIsProcessing(true);

    // Optimistic update
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    // API call with validation and error handling
    const result = await sendMessageSafe(text, sessionId);

    if (result.success) {
      const assistantMessage = {
        role: 'assistant',
        content: result.data.message,
        agent: result.data.agent,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      toast.error(result.error);
      // Remove optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    }

    setIsProcessing(false);
  };

  return (/* JSX */);
}
```

### 13.4 Environment Variable Validation

**Validate on app startup**:

```typescript
// app/layout.tsx
import { env } from '@/lib/env';

export default function RootLayout({ children }: Props) {
  // env is validated via Zod on import
  // Will throw error if NEXT_PUBLIC_API_URL is invalid

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```typescript
// lib/env.ts
import { EnvSchema } from './schemas';

// Validates environment variables at build/runtime
export const env = EnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

// Usage anywhere in app
import { env } from '@/lib/env';
console.log(env.NEXT_PUBLIC_API_URL); // Type-safe and validated!
```

---

## 14. Error Handling & Edge Cases (NEW)

### 14.1 Frontend Error Boundaries

**Top-level Error Boundary**:

```typescript
// app/error.tsx (Next.js convention)
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Something went wrong!</h2>
        <p className="mt-2 text-text-secondary">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded bg-button-primary-bg px-4 py-2 text-button-primary-text hover:bg-button-primary-hover"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Component-level Error Boundary**:

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-card border border-log-border-error bg-bg-secondary p-4">
          <p className="text-sm text-red-400">
            Failed to load component
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ChatPanelError />}>
  <ChatPanel />
</ErrorBoundary>
```

### 14.2 API Error Handling

**HTTP Status Code Mapping**:

```typescript
// lib/errors.ts (extended)
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  get userMessage(): string {
    switch (this.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in.';
      case 403:
        return 'You don't have permission to do that.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please slow down.';
      case 500:
        return 'Server error. Our team has been notified.';
      case 503:
        return 'Service temporarily unavailable. Try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  get shouldRetry(): boolean {
    // Retry on server errors and timeout, not client errors
    return this.statusCode >= 500 || this.statusCode === 408;
  }
}
```

**Retry Logic with Exponential Backoff**:

```typescript
// lib/api-client.ts (extended)
export class APIClient {
  // ... existing code ...

  async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T> {
    let lastError: APIError | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        if (error instanceof APIError && error.shouldRetry) {
          lastError = error;

          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));

          continue;
        }

        // Don't retry client errors
        throw error;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}
```

### 14.3 Edge Cases

**1. Empty Message Submission**:
```typescript
// components/chat/input-area.tsx
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  const trimmed = input.trim();
  if (!trimmed) {
    // Don't send empty messages
    return;
  }

  onSend(trimmed);
  setInput('');
};
```

**2. Session Expiry**:
```typescript
// lib/api/chat.ts
export async function sendMessage(message: string, sessionId: string) {
  try {
    // ... existing code ...
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      // Session expired, create new session
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', newSessionId);

      // Retry with new session
      return sendMessage(message, newSessionId);
    }
    throw error;
  }
}
```

**3. Network Offline**:
```typescript
// components/providers/network-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const NetworkContext = createContext({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {!isOnline && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-2 text-center text-sm text-yellow-300">
          You are offline. Messages will be sent when connection is restored.
        </div>
      )}
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
```

**4. Backend Unavailable**:
```typescript
// components/chat/chat-interface.tsx
const handleSend = async (text: string) => {
  setIsProcessing(true);

  const result = await sendMessageSafe(text, sessionId);

  if (!result.success) {
    if (result.error.includes('Server error')) {
      toast.error(result.error, {
        action: {
          label: 'Retry',
          onClick: () => handleSend(text),
        },
      });
    } else {
      toast.error(result.error);
    }
  }

  setIsProcessing(false);
};
```

**5. Validation Errors (Zod)**:
```typescript
// lib/api/chat.ts
import { ZodError } from 'zod';

export async function sendMessage(message: string, sessionId: string) {
  try {
    const validatedRequest = ChatRequestSchema.parse({
      message,
      session_id: sessionId,
    });
    // ...
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors for user
      const firstError = error.errors[0];
      throw new Error(`Validation error: ${firstError.message} at ${firstError.path.join('.')}`);
    }
    throw error;
  }
}
```

### 14.4 Loading States

**Skeleton Loaders**:

```typescript
// components/chat/message-skeleton.tsx
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-bg-elevated" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-bg-elevated" />
        <div className="h-4 w-1/2 rounded bg-bg-elevated" />
      </div>
    </div>
  );
}
```

**Spinner Component**:

```typescript
// components/ui/spinner.tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-gray-700 border-t-cyan-500`} />
  );
}
```

---

## 15. Enum Synchronization Validation (NEW)

### 15.1 The Problem

Frontend TypeScript enums and backend Python enums **must stay synchronized**. If they diverge:
- Runtime validation errors
- Incorrect agent routing
- API contract breakage

### 15.2 Validation Script

```typescript
// scripts/validate-enums.ts
/**
 * Validates that TypeScript and Python enums are synchronized
 * Run with: bun run scripts/validate-enums.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnumDefinition {
  name: string;
  values: Record<string, string>;
}

function parseTSEnums(filePath: string): EnumDefinition[] {
  const content = readFileSync(filePath, 'utf-8');
  const enums: EnumDefinition[] = [];

  // Match: export enum EnumName { ... }
  const enumRegex = /export enum (\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const [, name, body] = match;
    const values: Record<string, string> = {};

    // Match: KEY = 'value',
    const valueRegex = /(\w+)\s*=\s*['"]([^'"]+)['"]/g;
    let valueMatch;

    while ((valueMatch = valueRegex.exec(body)) !== null) {
      values[valueMatch[1]] = valueMatch[2];
    }

    enums.push({ name, values });
  }

  return enums;
}

function parsePyEnums(filePath: string): EnumDefinition[] {
  const content = readFileSync(filePath, 'utf-8');
  const enums: EnumDefinition[] = [];

  // Match: class EnumName(str, Enum):
  const enumRegex = /class (\w+)\(.*?Enum\):([^]*?)(?=class |$)/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const [, name, body] = match;
    const values: Record<string, string> = {};

    // Match: KEY = "value"
    const valueRegex = /(\w+)\s*=\s*["']([^"']+)["']/g;
    let valueMatch;

    while ((valueMatch = valueRegex.exec(body)) !== null) {
      values[valueMatch[1]] = valueMatch[2];
    }

    enums.push({ name, values });
  }

  return enums;
}

function compareEnums(
  tsEnums: EnumDefinition[],
  pyEnums: EnumDefinition[]
): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  // Create maps for easy lookup
  const tsMap = new Map(tsEnums.map(e => [e.name, e]));
  const pyMap = new Map(pyEnums.map(e => [e.name, e]));

  // Check TypeScript enums exist in Python
  for (const [name, tsEnum] of tsMap) {
    const pyEnum = pyMap.get(name);

    if (!pyEnum) {
      errors.push(`❌ Enum "${name}" exists in TypeScript but not in Python`);
      continue;
    }

    // Check values match
    const tsKeys = Object.keys(tsEnum.values).sort();
    const pyKeys = Object.keys(pyEnum.values).sort();

    if (tsKeys.join(',') !== pyKeys.join(',')) {
      errors.push(`❌ Enum "${name}" has different keys:\n  TS: ${tsKeys}\n  PY: ${pyKeys}`);
    }

    // Check value equality
    for (const key of tsKeys) {
      if (tsEnum.values[key] !== pyEnum.values[key]) {
        errors.push(
          `❌ Enum "${name}.${key}" has different values:\n  TS: "${tsEnum.values[key]}"\n  PY: "${pyEnum.values[key]}"`
        );
      }
    }
  }

  // Check Python enums exist in TypeScript
  for (const name of pyMap.keys()) {
    if (!tsMap.has(name)) {
      errors.push(`❌ Enum "${name}" exists in Python but not in TypeScript`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

// Main execution
const TS_ENUMS_PATH = join(process.cwd(), 'orchestratai_client/src/lib/enums.ts');
const PY_ENUMS_PATH = join(process.cwd(), 'orchestratai_api/src/models/enums.py');

console.log('🔍 Validating enum synchronization...\n');

try {
  const tsEnums = parseTSEnums(TS_ENUMS_PATH);
  const pyEnums = parsePyEnums(PY_ENUMS_PATH);

  console.log(`Found ${tsEnums.length} TypeScript enums`);
  console.log(`Found ${pyEnums.length} Python enums\n`);

  const result = compareEnums(tsEnums, pyEnums);

  if (result.success) {
    console.log('✅ All enums are synchronized!');
    process.exit(0);
  } else {
    console.error('❌ Enum synchronization failed:\n');
    result.errors.forEach(error => console.error(error));
    console.error('\nFix enum mismatches before committing.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading enum files:', error);
  process.exit(1);
}
```

### 15.3 Integration into Development Workflow

**package.json**:
```json
{
  "scripts": {
    "validate:enums": "bun run scripts/validate-enums.ts",
    "test": "bun run validate:enums && vitest",
    "lint": "bun run validate:enums && eslint .",
  }
}
```

**Husky pre-commit hook**:
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run enum validation
bun run validate:enums || {
  echo ""
  echo "❌ Enum validation failed!"
  echo "Frontend and backend enums are out of sync."
  echo "Fix enum mismatches before committing."
  echo ""
  exit 1
}

# Run other checks
bun run lint-staged
```

**GitHub Actions (Optional)**:
```yaml
# .github/workflows/validate-enums.yml
name: Validate Enums

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run validate:enums
```

### 15.4 Usage Example

```bash
# Manual validation
bun run validate:enums

# Output on success:
# 🔍 Validating enum synchronization...
#
# Found 7 TypeScript enums
# Found 7 Python enums
#
# ✅ All enums are synchronized!

# Output on failure:
# 🔍 Validating enum synchronization...
#
# Found 7 TypeScript enums
# Found 7 Python enums
#
# ❌ Enum synchronization failed:
#
# ❌ Enum "AgentStatus" has different keys:
#   TS: ACTIVE,IDLE,ROUTING
#   PY: ACTIVE,IDLE
#
# ❌ Enum "AgentId.POLICY" has different values:
#   TS: "policy"
#   PY: "policy_agent"
#
# Fix enum mismatches before committing.
```

---

## 16. Future Enhancements (Post-MVP)

### 16.1 Transition to Full Modular Monolith

When you implement the full backend (referencing the Backend Architecture Discussion Notes document):

- [ ] Implement proper module separation as shown in project structure
- [ ] Add LangGraph orchestration workflow
- [ ] Implement real agent classes with RAG/CAG strategies
- [ ] Integrate ChromaDB vector store
- [ ] Add proper state management across modules
- [ ] Maintain single deployment while keeping modules loosely coupled

### 16.2 Potential Microservices Extraction (Future)

The modular monolith design allows easy extraction to microservices:

- Each agent module → Separate agent service
- Vector store service → Dedicated ChromaDB service
- BFF layer → API Gateway
- Benefits shown in demo video: "This modular design allows seamless transition to microservices when scaling requirements demand it"

### 16.3 Advanced Features

- [ ] Real LangGraph backend integration
- [ ] Actual RAG/CAG retrieval systems
- [ ] ChromaDB vector database
- [ ] Multi-session support
- [ ] Export conversation history
- [ ] Chat history persistence (database)
- [ ] User authentication (Logto?)
- [ ] Custom agent configuration
- [ ] Theme switcher (light/dark)
- [ ] Conversation analytics dashboard
- [ ] Multi-language support

### 16.4 Technical Improvements

- [ ] Implement actual streaming (SSE/WebSockets)
- [ ] Add Redis for session management
- [ ] Set up proper error boundaries
- [ ] Add comprehensive logging
- [ ] Implement rate limiting
- [ ] Add automated tests (Jest, Playwright)
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring (Sentry)
- [ ] Bundle size optimization
- [ ] Image optimization (Next.js Image)

---

## 17. Success Metrics

### 17.1 Portfolio Goals

- ✅ Demonstrates multi-agent AI architecture understanding
- ✅ Showcases modern React/Next.js skills (Server Components First)
- ✅ Displays advanced UI/UX design capabilities (3-layer design tokens)
- ✅ Highlights real-time data handling
- ✅ Shows TypeScript proficiency (Enums + Zod + Type inference)
- ✅ Portfolio-ready demo video quality
- ✅ Production-grade code organization

### 17.2 Technical Goals

- Load time < 2s (first contentful paint)
- Smooth 60fps animations
- Mobile responsive on all devices
- Accessibility score > 90 (Lighthouse)
- Performance score > 85 (Lighthouse)
- Zero console errors
- Type-safe codebase (100% TypeScript)
- Bundle size < 500KB (initial load)

### 17.3 Code Quality Metrics

- ESLint: 0 errors, 0 warnings
- TypeScript: 0 type errors
- Test coverage > 70% (Phase 6)
- Enum synchronization: 100% (enforced via pre-commit)
- Design token usage: 100% (no arbitrary values)

---

## 18. Resources & References

### 18.1 Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Zod Documentation](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)

### 18.2 Design References

- **my_flow_app**: Design token system reference
- [Vercel AI SDK Examples](https://sdk.vercel.ai/)
- [ChatGPT Interface](https://chat.openai.com/)
- [Claude AI Interface](https://claude.ai/)

### 18.3 Architecture References

- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Modular Monolith Architecture](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)

---

## Appendix A: Quick Start Commands

**IMPORTANT**: This project is already set up with Docker. Use these commands:

```bash
# Clone the repository (if not already done)
git clone https://github.com/mario-digital/OrchestratAI.git
cd OrchestratAI

# Start development environment (hot reload enabled)
docker compose up

# Or run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Installing New Dependencies

**Frontend (using Bun inside Docker)**:
```bash
# Enter the frontend container
docker compose exec frontend sh

# Install package with Bun
bun add lucide-react zod

# Or from outside container
docker compose exec frontend bun add @tanstack/react-query

# Exit container
exit
```

**Backend (using uv inside Docker)**:
```bash
# Enter the backend container
docker compose exec backend sh

# Install package with uv
uv add <package-name>

# Exit container
exit
```

### Testing the API

```bash
# Test backend is running
curl http://localhost:8000

# Test health endpoint
curl http://localhost:8000/api/health

# Test chat endpoint (once implemented)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your pricing tiers?",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Development Workflow

1. Start Docker Compose: `docker compose up`
2. Make changes to code (hot reload active)
3. View changes at http://localhost:3000
4. Check backend logs: `docker compose logs -f backend`
5. Check frontend logs: `docker compose logs -f frontend`
6. Validate enums before committing: `bun run validate:enums`

---

## Appendix B: PRD Change Summary (v1.0 → v2.0)

### Major Additions

1. **Section 4.5**: Execution Graph Specification (separate page, Phase 5)
2. **Section 7.3**: State Management Architecture (Server Components First)
3. **Section 8.4**: Modular Backend Structure (Day 1 organization)
4. **Section 13**: Frontend-Backend Integration (API client pattern)
5. **Section 14**: Error Handling & Edge Cases (comprehensive error strategy)
6. **Section 15**: Enum Synchronization Validation (automated script)

### Major Corrections

1. **Design Token System**: Clarified base tokens + Tailwind opacity syntax (following my_flow_app)
2. **Opacity Handling**: Resolved contradiction - tokens define base colors, `/N` applies opacity
3. **Modular Backend**: Emphasized organizing from Day 1, even with mocks
4. **Implementation Phases**: Added realistic hour estimates

### Key Decisions Documented

1. ✅ **Design Tokens**: Follow my_flow_app pattern (separate token files in `styles/tokens/`)
2. ✅ **Opacity**: Base colors in tokens, opacity via Tailwind `/N` syntax
3. ✅ **Backend**: Start modular from Day 1 (agents/, models/, services/)
4. ✅ **State Management**: Server Components First, client only when needed
5. ✅ **Enum Sync**: Validation script runs on pre-commit via Husky
6. ✅ **Execution Graph**: Separate page, not MVP blocker (Phase 5+)
7. ✅ **TanStack Query**: Optional enhancement for Phase 5

---

**Document Status**: ✅ Ready for Implementation
**Next Steps**: Begin Phase 1 - Foundation & Design System

**Approval Required**: Please review this PRD v2.0 and confirm before implementation begins.
