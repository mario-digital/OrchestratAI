# OrchestratAI - Source Tree Structure

**Last Updated:** October 26, 2025
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
│       ├── validate-enums.yml         # Enum synchronization validation
│       ├── claude.yml                 # Claude AI workflow
│       └── claude-code-review.yml     # Claude code review workflow
│
├── .husky/                            # Git hooks
│   ├── pre-commit                     # Pre-commit validation (✅ Implemented)
│   └── pre-push                       # Pre-push validation (✅ Implemented)
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
├── orchestratai_client/               # ⚛️ Frontend Application (✅ MVP)
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
│   │   │   ├── ui/                    # shadcn/ui primitives (✅)
│   │   │   │   ├── button.tsx         # Button component
│   │   │   │   ├── card.tsx           # Card component
│   │   │   │   ├── input.tsx          # Input component
│   │   │   │   ├── badge.tsx          # Badge component
│   │   │   │   ├── separator.tsx      # Separator component
│   │   │   │   ├── scroll-area.tsx    # Scroll area component
│   │   │   │   ├── tabs.tsx           # Tabs component
│   │   │   │   └── collapsible.tsx    # Collapsible component
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
│   │   │   ├── utils.ts               # Utility functions (cn helper) (✅)
│   │   │   ├── types.ts               # TypeScript interfaces (✅)
│   │   │   ├── enums.ts               # Shared enums (✅)
│   │   │   └── schemas.ts             # Zod validation schemas (✅)
│   │   │
│   │   └── test-setup.ts              # Vitest setup (✅)
│   │
│   ├── __tests__/                     # Legacy test location
│   │   └── page.test.tsx              # Page component test
│   │
│   ├── tests/                         # Test files (✅)
│   │   └── unit/                      # Unit tests
│   │       ├── components/
│   │       │   ├── layout/            # Layout component tests
│   │       │   ├── panels/            # Panel component tests
│   │       │   └── ui/                # UI component tests
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
│   ├── postcss.config.mjs             # PostCSS config (✅)
│   ├── tsconfig.json                  # TypeScript config (✅)
│   ├── vitest.config.ts               # Vitest config (✅)
│   ├── components.json                # shadcn/ui config (✅)
│   ├── Dockerfile                     # Production Docker image (✅)
│   ├── Dockerfile.dev                 # Development Docker image (✅)
│   ├── package.json                   # Frontend dependencies (✅)
│   └── .gitignore                     # Git ignore rules (✅)
│
├── orchestratai_api/                  # 🐍 Backend Application (✅ MVP)
│   ├── src/
│   │   ├── api/                       # API Layer (✅)
│   │   │   ├── __init__.py
│   │   │   └── health.py              # Health check endpoint (✅)
│   │   │
│   │   ├── models/                    # Data Models (✅)
│   │   │   ├── __init__.py
│   │   │   ├── enums.py               # Python enums (synced with frontend) (✅)
│   │   │   └── schemas.py             # Pydantic models (✅)
│   │   │
│   │   ├── config.py                  # Configuration management (✅)
│   │   ├── main.py                    # FastAPI app entry point (✅)
│   │   └── __init__.py
│   │
│   ├── tests/                         # Python tests (✅)
│   │   ├── __init__.py
│   │   ├── test_health.py             # Health endpoint tests (✅)
│   │   ├── test_enums.py              # Enum tests (✅)
│   │   └── test_schemas.py            # Schema validation tests (✅)
│   │
│   ├── .env                           # Environment variables (gitignored)
│   ├── .python-version                # Python version spec (✅)
│   ├── pyproject.toml                 # Python project config (uv) (✅)
│   ├── uv.lock                        # uv lockfile (✅)
│   ├── Dockerfile                     # Docker image definition (✅)
│   ├── dev.sh                         # Development startup script (✅)
│   └── .gitignore                     # Git ignore rules (✅)
│
│   # 📋 PLANNED (Future Phases):
│   # ├── src/agents/                  # AI Agent Modules (Phase 2+)
│   # ├── src/services/                # Business Logic Layer (Phase 2+)
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

### Frontend (`orchestratai_client/`) - ✅ MVP Ready
- **Next.js 15 + React 19** application with App Router
- **Server Components First** architecture
- Uses **shadcn/ui** for UI primitives (8 components implemented)
- **Tailwind CSS v4** with custom 7-token system
  - colors, typography, spacing, layout, animation, effects, opacity
- **3-panel responsive layout** (desktop) + **tabbed mobile layout**
- **Vitest** for unit tests with 90%+ coverage requirement
- **Bun** as package manager and runtime
- **ESLint flat config** with custom local rules
- **Prettier** for code formatting

### Backend (`orchestratai_api/`) - ✅ MVP Ready
- **FastAPI** Python backend (minimal implementation)
- **Health check endpoint** operational
- **Pydantic models** for data validation
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
- **PRD** (Product Requirements Document) (✅)
- **Stories** (User stories for development) (✅)
- **QA** (Quality assurance documentation) (✅)
- **Architecture** (18 separate docs + source tree) (✅)

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

### Frontend (`orchestratai_client`) - Current Implementation
```typescript
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Layout Components
import { ThreePanelLayout } from '@/components/layout/three-panel-layout';
import { MobileLayout } from '@/components/layout/mobile-layout';

// Panel Components
import { CollapsiblePanel } from '@/components/panels/collapsible-panel';

// Utilities
import { cn } from '@/lib/utils';

// Types & Schemas
import type { Agent, Message, RetrievalLog } from '@/lib/types';
import { AgentId, AgentStatus, MessageRole } from '@/lib/enums';
import { chatRequestSchema } from '@/lib/schemas';
```

### Backend (`orchestratai_api`) - Current Implementation
```python
from src.models.schemas import Agent, Message, ChatRequest  # Pydantic models
from src.models.enums import AgentId, AgentStatus, MessageRole  # Enums
from src.api.health import health_check  # API routes
from src.config import get_settings  # Configuration
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

---

## Current Implementation Notes

1. **Monorepo Management:**
   - Uses **Bun** (v1.1.43+) for JavaScript/TypeScript dependencies
   - Uses **uv** for Python dependency management
   - No workspaces configured yet (planned for packages/shared)

2. **Docker Development:**
   - Frontend runs on port **3000** (Bun dev server)
   - Backend runs on port **8000** (FastAPI with uvicorn)
   - All development can happen in containers or locally

3. **Type Safety:**
   - TypeScript **strict mode** enabled
   - Pydantic models for backend validation
   - Enums synchronized between frontend/backend
   - Zod schemas for runtime validation

4. **Quality Gates:**
   - **90%+ test coverage** requirement (both frontend and backend)
   - **Pre-commit hooks** for linting, formatting, type checking
   - **Pre-push hooks** for test validation
   - **CI/CD validation** on all PRs

5. **Design System:**
   - **7-layer CSS token system** (colors, typography, spacing, etc.)
   - **shadcn/ui** components (8 implemented)
   - **Tailwind CSS v4** with custom configuration
   - **Responsive design** (3-panel desktop, tabbed mobile)

6. **Future Expansion Ready:**
   - Agent structure prepared for LangGraph (Phase 2+)
   - Modular design enables microservice extraction
   - Shared package infrastructure planned

---

**Document Maintained By:** Winston (Architect Agent)
**Reference:** See `docs/architecture/11-unified-project-structure.md` for architectural context
