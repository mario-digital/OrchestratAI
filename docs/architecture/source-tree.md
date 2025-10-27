# OrchestratAI - Source Tree Structure

**Last Updated:** October 26, 2025
**Status:** ✅ Active Development (Epic 2 Complete, Epic 3 In Planning)
**Current Branch:** epic-3-stories-drafts

This document provides the definitive project structure for the OrchestratAI monorepo, showing both implemented components and planned architecture.

---

## Quick Statistics

| Metric | Count |
|--------|-------|
| Backend Files (Python) | 26 files |
| Frontend Files (TypeScript/React) | 90+ files |
| Documentation Files | 75 files |
| BMAD Framework Files | 74 files |
| Test Files | 30+ files |
| Total Lines of Code | ~6,500+ lines |
| Test Coverage | 90%+ (enforced) |

---

## Root Structure

```
orchestratai/                          # Monorepo root
├── .bmad-core/                        # BMad agent framework configuration
│   ├── agents/                        # Agent persona definitions (10 files)
│   │   ├── architect.md
│   │   ├── dev.md
│   │   ├── po.md
│   │   ├── pm.md
│   │   ├── qa.md
│   │   ├── analyst.md
│   │   ├── ux-expert.md
│   │   ├── sm.md
│   │   ├── bmad-master.md
│   │   └── bmad-orchestrator.md
│   ├── agent-teams/                   # Team configurations (4 files)
│   ├── checklists/                    # Workflow checklists (6 files)
│   ├── tasks/                         # Task execution templates (22 files)
│   ├── templates/                     # Document templates (13 files)
│   ├── workflows/                     # Workflow definitions (6 files)
│   ├── data/                          # Knowledge base (6 files)
│   ├── utils/                         # Utilities (2 files)
│   └── core-config.yaml               # BMad configuration
│
├── .github/                           # GitHub configuration
│   ├── workflows/                     # CI/CD pipelines
│   │   ├── ci.yml                     # Continuous integration (✅)
│   │   ├── auto-label.yml             # PR auto-labeling (✅)
│   │   ├── validate-enums.yml         # Enum synchronization validation (✅)
│   │   ├── claude.yml                 # Claude AI workflow (✅)
│   │   └── claude-code-review.yml     # Claude code review workflow (✅)
│   ├── dependabot.yml                 # Dependabot configuration (✅)
│   ├── labeler.yml                    # PR labeler rules (✅)
│   └── pull_request_template.md       # PR template (✅)
│
├── .husky/                            # Git hooks
│   ├── _/                             # Husky internals (17 hook templates)
│   ├── pre-commit                     # Pre-commit validation (✅)
│   ├── pre-push                       # Pre-push validation (✅)
│   └── README.md
│
├── .claude/                           # Claude Code commands
│   └── commands/BMad/                 # BMAD command integration
│       ├── agents/                    # Agent definitions (10 files)
│       └── tasks/                     # Task commands (22 files)
│
├── .cursor/                           # Cursor IDE rules
│   └── rules/bmad/                    # BMAD agent rules (10 files)
│
├── docs/                              # Project documentation
│   ├── architecture/                  # Architecture docs (sharded)
│   │   ├── index.md                   # Architecture index
│   │   ├── table-of-contents.md       # Complete TOC
│   │   ├── 1-introduction.md
│   │   ├── 2-high-level-architecture.md
│   │   ├── 3-tech-stack.md
│   │   ├── 4-data-models.md
│   │   ├── 5-api-specification.md
│   │   ├── 6-components.md
│   │   ├── 7-core-workflows.md
│   │   ├── 8-database-schema.md
│   │   ├── 9-frontend-architecture.md
│   │   ├── 10-backend-architecture.md
│   │   ├── 11-unified-project-structure.md
│   │   ├── 12-development-workflow.md
│   │   ├── 13-deployment-architecture.md
│   │   ├── 14-security-and-performance.md
│   │   ├── 15-testing-strategy.md
│   │   ├── 16-coding-standards.md
│   │   ├── 17-error-handling-strategy.md
│   │   ├── 18-monitoring-and-observability.md
│   │   ├── source-tree.md             # This file
│   │   ├── change-log.md
│   │   ├── coding-standards.md
│   │   ├── document-complete.md
│   │   └── architecture.md            # Architecture master doc
│   ├── prd/                           # Product Requirements (sharded)
│   │   └── orchestratai_prd_v2.md     # PRD v2
│   ├── qa/                            # Quality assurance docs
│   │   ├── gates/                     # QA Gate Definitions (18 files)
│   │   │   ├── 1.1-setup-dependencies.yml
│   │   │   ├── 1.2-create-token-file-structure.yml
│   │   │   ├── 1.3-create-typescript-enums-zod-schemas.yml
│   │   │   ├── 1.4-python-enums-pydantic-schemas.yml
│   │   │   ├── 1.5-enum-validation.yml
│   │   │   ├── 1.6-install-shadcn-ui-components.yml
│   │   │   ├── 1.7-create-desktop-three-panel-layout.yml
│   │   │   ├── 1.8-implement-collapsible-panel-functionality.yml
│   │   │   ├── 1.9-create-header-footer-components.yml
│   │   │   ├── 1.10-create-mobile-responsive-layout.yml
│   │   │   ├── 2.1-backend-pydantic-models-mock-service.yml
│   │   │   ├── 2.2-backend-chat-endpoint.yml
│   │   │   ├── 2.3-frontend-api-client.yml
│   │   │   ├── 2.4-chat-api-functions-zod-validation.yml
│   │   │   ├── 2.5-message-components.yml
│   │   │   ├── 2.6-message-input-area.yml
│   │   │   ├── 2.7-chat-provider-state-management.yml
│   │   │   └── 2.8-optimistic-ui-error-handling.yml
│   │   └── assessments/               # QA Assessments (inline)
│   ├── stories/                       # User stories (27 files)
│   │   ├── README.md                  # Stories overview
│   │   ├── epic-1-foundation-design-system.md
│   │   ├── epic-2-chat-interface.md
│   │   ├── epic-3-agent-log-panels.md
│   │   ├── epic-4-mobile-realtime.md
│   │   ├── epic-5-polish-enhancement.md
│   │   ├── epic-6-documentation-deployment.md
│   │   │
│   │   ├── 1.1.setup-dependencies.story.md
│   │   ├── 1.2.create-token-file-structure.story.md
│   │   ├── 1.3.create-typescript-enums-zod-schemas.story.md
│   │   ├── 1.4.create-python-enums-pydantic-schemas.story.md
│   │   ├── 1.5.create-enum-validation-script.story.md
│   │   ├── 1.6.install-shadcn-ui-components.story.md
│   │   ├── 1.7.create-desktop-three-panel-layout.story.md
│   │   ├── 1.8.implement-collapsible-panel-functionality.story.md
│   │   ├── 1.9.create-header-footer-components.story.md
│   │   ├── 1.10.create-mobile-responsive-layout.story.md
│   │   │
│   │   ├── 2.1.backend-pydantic-models-mock-service.story.md
│   │   ├── 2.2.backend-chat-endpoint.story.md
│   │   ├── 2.3.frontend-api-client.story.md
│   │   ├── 2.4.chat-api-functions-zod-validation.story.md
│   │   ├── 2.5.message-components.story.md
│   │   ├── 2.6.message-input-area.story.md
│   │   ├── 2.7.chat-provider-state-management.story.md
│   │   ├── 2.8.optimistic-ui-error-handling.story.md
│   │   │
│   │   ├── 3.1.extend-chatresponse-agent-status-logs.story.md
│   │   ├── 3.2.enhance-mock-service-agent-metrics-logs.story.md
│   │   ├── 3.3.build-agent-card-status-badges.story.md
│   │   ├── 3.4.implement-agent-metrics-display.story.md
│   │   ├── 3.5.connect-agent-panel-chatprovider.story.md
│   │   ├── 3.6.build-log-entry-components.story.md
│   │   └── 3.7.implement-document-modal.story.md
│   │
│   └── ux-design-tokens/              # UX Design Token Guides (5 files)
│       ├── component-styling-guide.md
│       ├── css-tokens-usage.md
│       ├── shadcn-migration-quick-reference.md
│       ├── shadcn-ui-token-mappings.md
│       └── story-1-1-completion-summary.md
│
├── orchestratai_client/               # ⚛️ Frontend Application (✅ Epic 2 Complete)
│   ├── public/                        # Static assets (empty currently)
│   │
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── layout.tsx             # Root layout (✅)
│   │   │   ├── page.tsx               # Home page - main chat interface (✅)
│   │   │   ├── globals.css            # Global styles + Tailwind (✅)
│   │   │   └── styles/                # Design token system (✅)
│   │   │       └── tokens/            # CSS custom properties
│   │   │           ├── colors.css     # Color palette tokens
│   │   │           ├── typography.css # Font & text tokens
│   │   │           ├── spacing.css    # Spacing scale tokens
│   │   │           ├── layout.css     # Layout tokens
│   │   │           ├── animation.css  # Animation tokens
│   │   │           ├── effects.css    # Shadow & effect tokens
│   │   │           └── opacity.css    # Opacity tokens
│   │   │
│   │   ├── components/                # React Components
│   │   │   ├── ui/                    # shadcn/ui primitives (10 components) (✅)
│   │   │   │   ├── button.tsx         # Button component
│   │   │   │   ├── card.tsx           # Card component
│   │   │   │   ├── input.tsx          # Input component
│   │   │   │   ├── badge.tsx          # Badge component
│   │   │   │   ├── separator.tsx      # Separator component
│   │   │   │   ├── scroll-area.tsx    # Scroll area component
│   │   │   │   ├── tabs.tsx           # Tabs component
│   │   │   │   ├── collapsible.tsx    # Collapsible component
│   │   │   │   ├── sonner.tsx         # Toast notifications (✅)
│   │   │   │   └── textarea.tsx       # Textarea component (✅)
│   │   │   │
│   │   │   ├── chat/                  # Chat Components (✅ Epic 2)
│   │   │   │   ├── chat-interface.tsx # Main chat container (560 lines total)
│   │   │   │   ├── chat-error-boundary.tsx # Error boundary wrapper
│   │   │   │   ├── input-area.tsx     # Message input with validation
│   │   │   │   ├── message-bubble.tsx # Individual message display
│   │   │   │   ├── message-list.tsx   # Message list container
│   │   │   │   ├── typing-indicator.tsx # Typing animation
│   │   │   │   ├── types.ts           # Chat component types
│   │   │   │   └── __tests__/         # Component tests
│   │   │   │       ├── chat-interface-integration.test.tsx
│   │   │   │       ├── input-area.test.tsx
│   │   │   │       ├── message-bubble.test.tsx
│   │   │   │       ├── message-list.test.tsx
│   │   │   │       └── typing-indicator.test.tsx
│   │   │   │
│   │   │   ├── providers/             # React Context Providers (✅)
│   │   │   │   ├── chat-provider.tsx  # Chat state management (395 lines)
│   │   │   │   └── __tests__/
│   │   │   │       └── chat-provider.test.tsx
│   │   │   │
│   │   │   ├── panels/                # Side panels (✅)
│   │   │   │   └── collapsible-panel.tsx  # Reusable collapsible panel
│   │   │   │
│   │   │   └── layout/                # Layout components (✅)
│   │   │       ├── header.tsx         # App header
│   │   │       ├── footer.tsx         # App footer
│   │   │       ├── three-panel-layout.tsx  # Desktop 3-panel layout
│   │   │       └── mobile-layout.tsx  # Mobile responsive layout
│   │   │
│   │   ├── lib/                       # Utilities & Types
│   │   │   ├── api/                   # API Client Layer (✅)
│   │   │   │   ├── chat.ts            # Chat API functions (126 lines)
│   │   │   │   └── __tests__/
│   │   │   │       └── chat.test.ts
│   │   │   │
│   │   │   ├── utils/                 # Utility Functions (✅)
│   │   │   │   ├── agent-colors.ts    # Agent color mappings
│   │   │   │   └── error-messages.ts  # User-friendly error messages
│   │   │   │
│   │   │   ├── api-client.ts          # Base API client with error handling (✅)
│   │   │   ├── errors.ts              # Custom error classes (✅)
│   │   │   ├── utils.ts               # Utility functions (cn helper) (✅)
│   │   │   ├── types.ts               # TypeScript interfaces (✅)
│   │   │   ├── enums.ts               # Shared enums (✅)
│   │   │   ├── schemas.ts             # Zod validation schemas (✅)
│   │   │   └── __tests__/             # Library tests
│   │   │       ├── api-client.test.ts
│   │   │       ├── errors.test.ts
│   │   │       ├── enums.test.ts
│   │   │       ├── schemas.test.ts
│   │   │       └── types.test.ts
│   │   │
│   │   └── test-setup.ts              # Vitest setup (✅)
│   │
│   ├── __tests__/                     # Legacy test location
│   │   └── page.test.tsx              # Page component test
│   │
│   ├── tests/                         # Test files (✅)
│   │   └── unit/                      # Unit tests
│   │       ├── components/
│   │       │   ├── layout/            # Layout component tests (4 files)
│   │       │   ├── panels/            # Panel component tests (1 file)
│   │       │   └── ui/                # UI component tests (4 files)
│   │       └── lib/                   # Library tests
│   │
│   ├── scripts/                       # Build scripts
│   │   └── check-coverage.sh          # Coverage validation script (✅)
│   │
│   ├── .env.local                     # Environment variables (gitignored)
│   ├── .eslintrc.json                 # ESLint config (deprecated)
│   ├── eslint.config.mjs              # ESLint flat config (✅)
│   ├── eslint-local-rules.mjs         # Custom ESLint rules (✅)
│   ├── .prettierrc                    # Prettier config (✅)
│   ├── .prettierignore                # Prettier ignore rules (✅)
│   ├── next.config.ts                 # Next.js configuration (✅)
│   ├── next-env.d.ts                  # Next.js type definitions (✅)
│   ├── postcss.config.mjs             # PostCSS config (✅)
│   ├── tsconfig.json                  # TypeScript config (✅)
│   ├── tsconfig.tsbuildinfo           # TypeScript build cache
│   ├── vitest.config.ts               # Vitest config (✅)
│   ├── components.json                # shadcn/ui config (✅)
│   ├── Dockerfile                     # Production Docker image (✅)
│   ├── Dockerfile.dev                 # Development Docker image (✅)
│   ├── package.json                   # Frontend dependencies (✅)
│   └── .gitignore                     # Git ignore rules (✅)
│
├── orchestratai_api/                  # 🐍 Backend Application (✅ Epic 2 Complete)
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point (✅)
│   │   ├── config.py                  # Configuration management (✅)
│   │   │
│   │   ├── api/                       # API Layer (✅)
│   │   │   ├── __init__.py
│   │   │   ├── health.py              # Health check endpoint (✅)
│   │   │   └── routes/                # API Routes (✅)
│   │   │       ├── __init__.py
│   │   │       └── chat.py            # Chat endpoint (/api/chat) (✅)
│   │   │
│   │   ├── models/                    # Data Models (✅)
│   │   │   ├── __init__.py
│   │   │   ├── enums.py               # Python enums (synced with frontend) (✅)
│   │   │   └── schemas.py             # Pydantic models (✅)
│   │   │
│   │   └── services/                  # Business Logic (✅ Epic 2)
│   │       ├── __init__.py
│   │       └── mock_data.py           # Mock response generator (258 lines)
│   │
│   ├── tests/                         # Python tests (✅)
│   │   ├── __init__.py
│   │   ├── test_health.py             # Health endpoint tests (✅)
│   │   ├── test_enums.py              # Enum tests (✅)
│   │   ├── test_schemas.py            # Schema validation tests (✅)
│   │   ├── test_chat_endpoint.py      # Chat endpoint tests (✅)
│   │   └── test_mock_data.py          # Mock service tests (✅)
│   │
│   ├── .env                           # Environment variables (gitignored)
│   ├── .env.template                  # Environment variables template (✅)
│   ├── .python-version                # Python version spec (3.12) (✅)
│   ├── pyproject.toml                 # Python project config (uv) (✅)
│   ├── uv.lock                        # uv lockfile (✅)
│   ├── Dockerfile                     # Docker image definition (✅)
│   ├── Dockerfile.dev                 # Development Docker image (✅)
│   ├── dev.sh                         # Development startup script (✅)
│   ├── .dockerignore                  # Docker build ignores (✅)
│   ├── .coverage                      # Coverage data file
│   └── .gitignore                     # Git ignore rules (✅)
│
│   # 📋 PLANNED (Future Phases):
│   # ├── src/agents/                  # AI Agent Modules (Phase 3+)
│   # ├── src/middleware/              # Middleware (Phase 3+)
│   # └── src/core/                    # Core utilities (Phase 3+)
│
├── packages/                          # 📦 Shared Packages (📋 PLANNED)
│   └── README.md                      # Placeholder for future shared package
│
│   # 📋 PLANNED: packages/shared/ for type-safe contracts
│   # Will contain TypeScript types, enums, and Zod schemas
│   # shared between frontend and backend
│
├── scripts/                           # 🛠️ Build & Dev Scripts (✅)
│   └── validate-enums.ts              # Enum synchronization validator (✅)
│
├── .gitignore                         # Git ignore rules (✅)
├── .dockerignore                      # Docker ignore rules (✅)
├── docker-compose.yml                 # Development containers (✅)
├── docker-compose.prod.yml            # Production containers (✅)
├── package.json                       # Monorepo root package.json (✅)
├── bun.lock                           # Bun lockfile (✅)
├── .coverage                          # Coverage data file (✅)
├── README.md                          # Project README (✅)
└── AGENTS.md                          # Agent documentation (✅)
```

---

## Key Directory Purposes

### Frontend (`orchestratai_client/`) - ✅ Epic 2 Complete
- **Next.js 15 + React 19** application with App Router
- **Server Components First** architecture
- Uses **shadcn/ui** for UI primitives (10 components implemented)
- **Tailwind CSS v4** with custom 7-token system
  - colors, typography, spacing, layout, animation, effects, opacity
- **Complete Chat Interface** (Epic 2)
  - Message bubbles with user/assistant styling
  - Input area with validation
  - Typing indicator animation
  - Error boundary for resilience
  - 560 lines of chat components
- **Chat State Management** (Epic 2)
  - React Context + useReducer (395 lines)
  - Optimistic UI updates
  - Error recovery and retry logic
  - Message history management
- **API Client Layer** (Epic 2)
  - Base API client with error handling
  - Chat-specific API functions
  - Zod validation integration
  - User-friendly error messages
- **3-panel responsive layout** (desktop) + **tabbed mobile layout**
- **Vitest** for unit tests with 90%+ coverage requirement
- **Bun** as package manager and runtime
- **ESLint flat config** with custom local rules
- **Prettier** for code formatting

### Backend (`orchestratai_api/`) - ✅ Epic 2 Complete
- **FastAPI** Python backend (MVP + Chat implementation)
- **Health check endpoint** operational (`/health`)
- **Chat endpoint** operational (`/api/chat`)
- **Mock Data Service** (Epic 2)
  - Keyword-based routing (258 lines)
  - Generates realistic chat responses
  - Simulates agent behavior
  - Includes metrics and metadata
- **Pydantic models** for data validation
  - ChatRequest, ChatResponse
  - Agent, Message, RetrievalLog
  - ChatMetrics with timing data
- **Enum synchronization** with frontend (validated in CI/CD)
- **uv** for Python dependency management
- **pytest** for testing with 90%+ coverage requirement
- **Future expansion** planned for agents, services, middleware

### Shared (`packages/`)  - 📋 Planned
- Currently placeholder only
- Future: Type-safe contracts between frontend and backend
- Future: Shared enums synchronized via validation script
- Future: Zod schemas for runtime validation

### Documentation (`docs/`)
- **Sharded architecture** for modular access (✅)
- **PRD** (Product Requirements Document v2) (✅)
- **Stories** (27 user stories across 6 epics) (✅)
- **QA** (18 QA gate definitions for Epic 1 & 2) (✅)
- **Architecture** (18 separate docs + source tree) (✅)
- **UX Design Tokens** (5 comprehensive guides) (✅)

---

## Epic Implementation Status

### Epic 1: Foundation & Design System ✅ COMPLETE
**Stories:** 1.1 - 1.10 | **Status:** All 10 stories completed

| Story | Description | Status |
|-------|-------------|--------|
| 1.1 | Setup Dependencies | ✅ Complete |
| 1.2 | Create Token File Structure | ✅ Complete |
| 1.3 | TypeScript Enums & Zod Schemas | ✅ Complete |
| 1.4 | Python Enums & Pydantic Schemas | ✅ Complete |
| 1.5 | Enum Validation Script | ✅ Complete |
| 1.6 | Install shadcn/ui Components | ✅ Complete |
| 1.7 | Desktop 3-Panel Layout | ✅ Complete |
| 1.8 | Collapsible Panel Functionality | ✅ Complete |
| 1.9 | Header & Footer Components | ✅ Complete |
| 1.10 | Mobile Responsive Layout | ✅ Complete |

**Key Deliverables:**
- 7 CSS token files with design system
- 10 shadcn/ui components installed
- Type-safe enums synchronized between frontend/backend
- Responsive 3-panel layout (desktop) + tabbed layout (mobile)
- Comprehensive test coverage (90%+)

### Epic 2: Chat Interface ✅ COMPLETE
**Stories:** 2.1 - 2.8 | **Status:** All 8 stories completed

| Story | Description | Status |
|-------|-------------|--------|
| 2.1 | Backend Pydantic Models & Mock Service | ✅ Complete |
| 2.2 | Backend Chat Endpoint | ✅ Complete |
| 2.3 | Frontend API Client | ✅ Complete |
| 2.4 | Chat API Functions & Zod Validation | ✅ Complete |
| 2.5 | Message Components | ✅ Complete |
| 2.6 | Message Input Area | ✅ Complete |
| 2.7 | Chat Provider State Management | ✅ Complete |
| 2.8 | Optimistic UI & Error Handling | ✅ Complete |

**Key Deliverables:**
- Fully functional chat interface (560 lines)
- Chat state management with React Context (395 lines)
- Mock service with keyword routing (258 lines)
- API client with error handling (126 lines)
- Optimistic UI updates with error recovery
- Comprehensive test suite for all components

### Epic 3: Agent & Log Panels 📋 IN PLANNING
**Stories:** 3.1 - 3.7 | **Status:** Stories drafted, implementation pending

| Story | Description | Status |
|-------|-------------|--------|
| 3.1 | Extend ChatResponse with Agent Status & Logs | 📋 Planned |
| 3.2 | Enhance Mock Service with Agent Metrics | 📋 Planned |
| 3.3 | Build Agent Card with Status Badges | 📋 Planned |
| 3.4 | Implement Agent Metrics Display | 📋 Planned |
| 3.5 | Connect Agent Panel to ChatProvider | 📋 Planned |
| 3.6 | Build Log Entry Components | 📋 Planned |
| 3.7 | Implement Document Modal | 📋 Planned |

**Planned Deliverables:**
- Agent status panel with real-time updates
- Log retrieval panel with filtering
- Document preview modal
- Enhanced mock service with agent simulation
- Extended data models for agents and logs

### Epic 4: Mobile & Real-time 📋 PLANNED
**Status:** Epics 4-6 defined but not yet broken into stories

### Epic 5: Polish & Enhancement 📋 PLANNED
**Status:** Planned for post-MVP polish

### Epic 6: Documentation & Deployment 📋 PLANNED
**Status:** Planned for production readiness

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `ChatInterface.tsx` |
| TypeScript Utilities | kebab-case | `api-client.ts` |
| Python Modules | snake_case | `mock_data.py` |
| Configuration Files | lowercase | `next.config.ts` |
| Documentation | kebab-case | `tech-stack.md` |
| Test Files | `*.test.tsx` or `test_*.py` | `chat-provider.test.tsx` |

---

## Import Aliases

### Frontend (`orchestratai_client`) - Current Implementation
```typescript
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Chat Components (Epic 2)
import { ChatInterface } from '@/components/chat/chat-interface';
import { MessageBubble } from '@/components/chat/message-bubble';
import { InputArea } from '@/components/chat/input-area';

// Providers
import { ChatProvider, useChatContext } from '@/components/providers/chat-provider';

// Layout Components
import { ThreePanelLayout } from '@/components/layout/three-panel-layout';
import { MobileLayout } from '@/components/layout/mobile-layout';

// Panel Components
import { CollapsiblePanel } from '@/components/panels/collapsible-panel';

// API Layer
import { sendChatMessage } from '@/lib/api/chat';
import { apiClient } from '@/lib/api-client';

// Utilities
import { cn } from '@/lib/utils';
import { getAgentColor } from '@/lib/utils/agent-colors';
import { getUserFriendlyErrorMessage } from '@/lib/utils/error-messages';

// Types, Schemas, Errors
import type { Agent, Message, RetrievalLog, ChatRequest, ChatResponse } from '@/lib/types';
import { AgentId, AgentStatus, MessageRole } from '@/lib/enums';
import { chatRequestSchema, chatResponseSchema } from '@/lib/schemas';
import { APIError, NetworkError, ValidationError } from '@/lib/errors';
```

### Backend (`orchestratai_api`) - Current Implementation
```python
# Pydantic models
from src.models.schemas import (
    Agent,
    Message,
    RetrievalLog,
    ChatMetrics,
    ChatRequest,
    ChatResponse,
)

# Enums
from src.models.enums import AgentId, AgentStatus, MessageRole, LogType, LogStatus

# API routes
from src.api.health import health_check
from src.api.routes.chat import chat_endpoint

# Services
from src.services.mock_data import generate_mock_response

# Configuration
from src.config import get_settings
```

---

## Development Workflow Files

| File | Purpose | Status |
|------|---------|--------|
| `docker-compose.yml` | Development environment (frontend + backend) | ✅ Active |
| `docker-compose.prod.yml` | Production build configuration | ✅ Active |
| `.github/workflows/ci.yml` | CI/CD pipeline (tests, linting, type checking) | ✅ Active |
| `.github/workflows/validate-enums.yml` | Enum synchronization validation | ✅ Active |
| `.github/workflows/auto-label.yml` | Automatic PR labeling | ✅ Active |
| `.github/workflows/claude.yml` | Claude AI integration workflow | ✅ Active |
| `.github/workflows/claude-code-review.yml` | Claude code review automation | ✅ Active |
| `.husky/pre-commit` | Pre-commit hook (lint, format, type check) | ✅ Active |
| `.husky/pre-push` | Pre-push hook (tests, coverage validation) | ✅ Active |
| `scripts/validate-enums.ts` | Ensures frontend/backend enum synchronization | ✅ Active |
| `orchestratai_client/scripts/check-coverage.sh` | Frontend coverage validation | ✅ Active |

---

## Status Legend

- ✅ **Implemented** - Component exists and is functional
- 🚧 **In Progress** - Currently being developed
- 📋 **Planned** - Defined in architecture, not yet started
- ⚠️ **Needs Update** - Exists but requires modification

---

## Recent Changes (Epic 2 Completion)

### Backend Additions
- **New Directory:** `src/api/routes/` - API route organization
- **New File:** `src/api/routes/chat.py` - Chat endpoint implementation
- **New Directory:** `src/services/` - Business logic layer
- **New File:** `src/services/mock_data.py` - Mock response generator (258 lines)
- **New Tests:** `test_chat_endpoint.py`, `test_mock_data.py`

### Frontend Additions
- **New Directory:** `src/components/chat/` - Complete chat UI (7 files)
  - `chat-interface.tsx` - Main container
  - `chat-error-boundary.tsx` - Error handling
  - `input-area.tsx` - Message input
  - `message-bubble.tsx` - Message display
  - `message-list.tsx` - Message list
  - `typing-indicator.tsx` - Loading animation
  - `types.ts` - Chat types
  - `__tests__/` - 5 test files
- **New Directory:** `src/components/providers/` - State management
  - `chat-provider.tsx` - Chat context (395 lines)
  - `__tests__/chat-provider.test.tsx`
- **New Directory:** `src/lib/api/` - API client layer
  - `chat.ts` - Chat API functions (126 lines)
  - `__tests__/chat.test.ts`
- **New Directory:** `src/lib/utils/` - Utility functions
  - `agent-colors.ts` - Agent color mappings
  - `error-messages.ts` - User-friendly errors
- **New Files in lib:**
  - `api-client.ts` - Base API client
  - `errors.ts` - Custom error classes
  - `__tests__/` - Additional test files
- **New UI Components:**
  - `sonner.tsx` - Toast notifications
  - `textarea.tsx` - Multi-line input

### Documentation Additions
- **Epic 3 Stories:** 7 new story files (3.1 - 3.7)
- **UX Design Tokens:** 5 comprehensive guides
- **QA Gates:** 8 new QA gate definitions (2.1 - 2.8)

---

## Current Implementation Notes

1. **Monorepo Management:**
   - Uses **Bun** (v1.1.43+) for JavaScript/TypeScript dependencies
   - Uses **uv** for Python dependency management
   - Workspaces configured for `orchestratai_client` and `packages/*`

2. **Docker Development:**
   - Frontend runs on port **3000** (Bun dev server with Turbopack)
   - Backend runs on port **8000** (FastAPI with uvicorn)
   - All development can happen in containers or locally

3. **Type Safety:**
   - TypeScript **strict mode** enabled
   - Pydantic models for backend validation
   - Enums synchronized between frontend/backend (validated in CI)
   - Zod schemas for runtime validation
   - Custom error classes for better error handling

4. **Quality Gates:**
   - **90%+ test coverage** requirement (both frontend and backend)
   - **Pre-commit hooks** for linting, formatting, type checking
   - **Pre-push hooks** for test validation
   - **CI/CD validation** on all PRs
   - **Enum synchronization** validation in CI

5. **Design System:**
   - **7-layer CSS token system** (colors, typography, spacing, layout, animation, effects, opacity)
   - **10 shadcn/ui components** implemented
   - **Tailwind CSS v4** with custom configuration
   - **Responsive design** (3-panel desktop, tabbed mobile)

6. **Chat Implementation (Epic 2):**
   - **Complete chat interface** with message bubbles, input, typing indicator
   - **State management** with React Context + useReducer pattern
   - **Optimistic UI** updates with error recovery
   - **API client layer** with comprehensive error handling
   - **Mock service** with keyword-based routing for development

7. **Future Expansion Ready:**
   - Agent structure prepared for LangGraph (Epic 3+)
   - Modular design enables microservice extraction
   - Shared package infrastructure planned
   - Real-time updates architecture planned (Epic 4)

---

## Code Metrics

### Lines of Code (Excluding Tests)
- **Backend Source:** ~2,500 lines
  - `src/services/mock_data.py`: 258 lines
  - `src/api/routes/chat.py`: ~100 lines
  - Models, schemas, config: ~400 lines
- **Frontend Source:** ~4,000+ lines
  - Chat components: 560 lines
  - Chat provider: 395 lines
  - API client: 126 lines
  - UI components: ~800 lines
  - Layout components: ~600 lines
- **Test Files:** ~3,000+ lines
  - 30+ test files with comprehensive coverage

### Test Coverage
- **Backend:** 90%+ (enforced by pre-push hook and CI)
- **Frontend:** 90%+ (enforced by pre-push hook and CI)

---

**Document Maintained By:** Winston (Architect Agent)
**Last Review:** October 26, 2025
**Next Review:** After Epic 3 completion
**Reference:** See `docs/architecture/11-unified-project-structure.md` for architectural context
