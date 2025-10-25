# OrchestratAI - Source Tree Structure

**Last Updated:** October 24, 2025
**Status:** ✅ Active Development

This document provides the definitive project structure for the OrchestratAI monorepo, showing both implemented components and planned architecture.

---

## Root Structure

```
orchestratai/                          # Monorepo root
├── .bmad-core/                        # BMad agent framework configuration
│   ├── agents/                        # Agent persona definitions
│   │   ├── architect.md
│   │   ├── dev.md
│   │   └── po.md
│   ├── checklists/                    # Workflow checklists
│   ├── tasks/                         # Task execution templates
│   ├── templates/                     # Document templates
│   └── core-config.yaml               # BMad configuration
│
├── .github/                           # GitHub configuration
│   └── workflows/                     # CI/CD pipelines
│       ├── ci.yml                     # Continuous integration
│       ├── auto-label.yml             # PR auto-labeling
│       └── test.yml                   # Test automation
│
├── .husky/                            # Git hooks
│   ├── pre-commit                     # Pre-commit validation
│   └── commit-msg                     # Commit message linting
│
├── docs/                              # Project documentation
│   ├── architecture/                  # Architecture docs (sharded)
│   │   ├── index.md                   # Architecture index
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
│   │   └── source-tree.md             # This file
│   ├── prd/                           # Product Requirements (sharded)
│   ├── qa/                            # Quality assurance docs
│   ├── stories/                       # User stories
│   └── architecture.md                # Architecture master doc
│
├── orchestratai_client/               # ⚛️ Frontend Application
│   ├── public/                        # Static assets
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── globals.css            # Global styles + Tailwind
│   │   │   └── api/                   # API routes (if needed)
│   │   │
│   │   ├── components/                # React Components
│   │   │   ├── ui/                    # shadcn/ui primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── [other-shadcn-components]
│   │   │   │
│   │   │   ├── chat/                  # Chat UI components
│   │   │   │   ├── chat-interface.tsx
│   │   │   │   ├── message-list.tsx
│   │   │   │   ├── message-bubble.tsx
│   │   │   │   └── chat-input.tsx
│   │   │   │
│   │   │   ├── panels/                # Side panels
│   │   │   │   ├── agent-panel.tsx
│   │   │   │   ├── agent-card.tsx
│   │   │   │   ├── retrieval-panel.tsx
│   │   │   │   └── log-card.tsx
│   │   │   │
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── footer.tsx
│   │   │   │
│   │   │   └── providers/             # Context providers
│   │   │       └── chat-provider.tsx
│   │   │
│   │   ├── lib/                       # Utilities & API
│   │   │   ├── api-client.ts          # HTTP client class
│   │   │   ├── api/
│   │   │   │   ├── chat.ts            # Chat API functions
│   │   │   │   └── session.ts         # Session API functions
│   │   │   ├── errors.ts              # Custom error classes
│   │   │   ├── utils.ts               # Utility functions
│   │   │   └── validators.ts          # Zod schemas
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── use-chat.ts            # Chat state management
│   │   │   ├── use-mobile.ts          # Mobile detection
│   │   │   └── use-optimistic.ts      # Optimistic updates
│   │   │
│   │   ├── types/                     # TypeScript types (local)
│   │   │   └── index.ts
│   │   │
│   │   └── test-setup.ts              # Vitest setup
│   │
│   ├── tests/                         # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/                       # Playwright E2E tests
│   │
│   ├── .env.local                     # Environment variables
│   ├── .eslintrc.json                 # ESLint config
│   ├── .prettierrc                    # Prettier config
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS config
│   ├── tsconfig.json                  # TypeScript config
│   ├── vitest.config.ts               # Vitest config
│   ├── package.json                   # Frontend dependencies
│   └── README.md
│
├── orchestratai_api/                  # 🐍 Backend Application
│   ├── src/
│   │   ├── api/                       # API Layer
│   │   │   ├── __init__.py
│   │   │   └── routes/                # FastAPI routers
│   │   │       ├── __init__.py
│   │   │       ├── health.py          # Health check endpoint
│   │   │       ├── chat.py            # Chat endpoints
│   │   │       └── session.py         # Session management
│   │   │
│   │   ├── agents/                    # AI Agent Modules (loosely coupled)
│   │   │   ├── __init__.py
│   │   │   ├── base_agent.py          # Abstract base class
│   │   │   ├── orchestrator.py        # Router agent (Phase 2)
│   │   │   ├── billing_agent.py       # Billing support agent (Phase 3)
│   │   │   ├── technical_agent.py     # Technical support agent (Phase 3)
│   │   │   └── policy_agent.py        # Policy & compliance agent (Phase 3)
│   │   │
│   │   ├── services/                  # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── mock_data.py           # Mock response generator (MVP)
│   │   │   ├── session_manager.py     # Redis session management
│   │   │   └── langgraph_service.py   # LangGraph integration (Phase 4+)
│   │   │
│   │   ├── models/                    # Data Models
│   │   │   ├── __init__.py
│   │   │   ├── enums.py               # Python enums (mirrored from frontend)
│   │   │   └── schemas.py             # Pydantic models
│   │   │
│   │   ├── middleware/                # Middleware
│   │   │   ├── __init__.py
│   │   │   ├── error_handler.py       # Global error handling
│   │   │   ├── logging.py             # Request logging
│   │   │   └── cors.py                # CORS configuration
│   │   │
│   │   ├── core/                      # Core utilities
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Configuration management
│   │   │   └── redis_client.py        # Redis connection
│   │   │
│   │   └── main.py                    # FastAPI app entry point
│   │
│   ├── tests/                         # Python tests
│   │   ├── __init__.py
│   │   ├── conftest.py                # pytest configuration
│   │   ├── test_health.py             # Health endpoint tests
│   │   └── test_chat.py               # Chat endpoint tests (planned)
│   │
│   ├── .env                           # Environment variables
│   ├── .python-version                # Python version spec
│   ├── pyproject.toml                 # Python project config (uv)
│   ├── uv.lock                        # uv lockfile
│   ├── Dockerfile                     # Docker image definition
│   ├── dev.sh                         # Development startup script
│   └── README.md
│
├── packages/                          # 📦 Shared Packages
│   └── shared/                        # Shared TypeScript types (TO CREATE)
│       ├── src/
│       │   ├── types/                 # TypeScript interfaces
│       │   │   ├── agent.ts
│       │   │   ├── message.ts
│       │   │   ├── retrieval-log.ts
│       │   │   ├── document-chunk.ts
│       │   │   ├── chat-session.ts
│       │   │   └── chat-metrics.ts
│       │   │
│       │   ├── enums/                 # Shared enums
│       │   │   ├── agent-id.ts
│       │   │   ├── agent-status.ts
│       │   │   ├── message-role.ts
│       │   │   ├── log-type.ts
│       │   │   ├── log-status.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── schemas/               # Zod validation schemas
│       │   │   ├── chat-request.ts
│       │   │   ├── chat-response.ts
│       │   │   └── index.ts
│       │   │
│       │   └── index.ts               # Package entry point
│       │
│       ├── package.json               # Package configuration
│       ├── tsconfig.json              # TypeScript config
│       └── README.md
│
├── scripts/                           # 🛠️ Build & Dev Scripts
│   ├── validate-enums.ts              # Enum synchronization validator
│   ├── setup-dev.sh                   # Development environment setup
│   └── deploy.sh                      # Deployment script (future)
│
├── .vscode/                           # VS Code workspace settings
│   ├── settings.json                  # Editor settings
│   ├── extensions.json                # Recommended extensions
│   └── launch.json                    # Debug configurations
│
├── .gitignore                         # Git ignore rules
├── .prettierignore                    # Prettier ignore rules
├── docker-compose.yml                 # Development containers
├── docker-compose.prod.yml            # Production containers
├── package.json                       # Monorepo root package.json
├── bun.lock                          # Bun lockfile
├── README.md                          # Project README
└── AGENTS.md                          # Agent documentation
```

---

## Key Directory Purposes

### Frontend (`orchestratai_client/`)
- **Next.js 15 + React 19** application
- **Server Components First** architecture
- Uses **shadcn/ui** for UI primitives
- **Tailwind CSS v4** with 3-layer token system
- **Vitest** for unit tests, **Playwright** for E2E

### Backend (`orchestratai_api/`)
- **FastAPI** Python backend
- **Modular monolith** architecture (agents, services, models)
- **Redis** for session management (MVP)
- **LangGraph** integration planned (Phase 4+)
- **pytest** for testing

### Shared (`packages/shared/`)
- **Type-safe contracts** between frontend and backend
- **Shared enums** synchronized via validation script
- **Zod schemas** for runtime validation
- Import as `@orchestratai/shared` in frontend

### Documentation (`docs/`)
- **Sharded architecture** for modular access
- **PRD** (Product Requirements Document)
- **Stories** (User stories for development)
- **QA** (Quality assurance documentation)

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `ChatInterface.tsx` |
| TypeScript Utilities | kebab-case | `api-client.ts` |
| Python Modules | snake_case | `session_manager.py` |
| Configuration Files | lowercase | `next.config.ts` |
| Documentation | kebab-case | `tech-stack.md` |

---

## Import Aliases

### Frontend (`orchestratai_client`)
```typescript
import { Agent } from '@orchestratai/shared';  // Shared package
import { Button } from '@/components/ui';      // UI components
import { apiClient } from '@/lib/api-client';  // Utilities
import { useChat } from '@/hooks/use-chat';    // Hooks
```

### Backend (`orchestratai_api`)
```python
from src.models.schemas import ChatRequest    # Pydantic models
from src.services.mock_data import generate_response  # Services
from src.api.routes import chat               # API routes
```

---

## Development Workflow Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development environment (frontend + backend + Redis) |
| `docker-compose.prod.yml` | Production build configuration |
| `.github/workflows/ci.yml` | CI/CD pipeline (tests, linting, enum validation) |
| `scripts/validate-enums.ts` | Ensures frontend/backend enum synchronization |

---

## Status Legend

- ✅ **Implemented** - Component exists and is functional
- 🚧 **In Progress** - Currently being developed
- 📋 **Planned** - Defined in architecture, not yet started

---

## Notes

1. **Monorepo Management:** Uses Bun workspaces for JavaScript/TypeScript, uv for Python
2. **Docker First:** All development happens in containers
3. **Type Safety:** Shared types prevent contract drift between frontend/backend
4. **Modular Design:** Easy to extract microservices from modular monolith later
5. **AI-Ready:** Agent structure prepared for LangGraph orchestration (Phase 4+)

---

**Document Maintained By:** Winston (Architect Agent)
**Reference:** See `docs/architecture/11-unified-project-structure.md` for architectural context
