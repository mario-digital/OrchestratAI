# OrchestratAI - Source Tree Structure

**Last Updated:** November 2, 2025
**Status:** ✅ Active Development (Epic 1-3 Complete, Epic 4 Mostly Complete, Epic 5 In Progress)
**Current Branch:** main

This document provides the definitive project structure for the OrchestratAI monorepo, showing both implemented components and planned architecture.

---

## Quick Statistics

| Metric | Count |
|--------|-------|
| Backend Files (Python) | 23 source files |
| Backend Test Files | 9 test files |
| Frontend Files (TypeScript/React) | 109 files |
| Frontend Source (non-test) | 58 files |
| Frontend Test Files | 30+ files |
| Documentation Files | 184 files |
| BMAD Framework Files | 74 files |
| QA Gates | 30 gates (Epic 1-5) |
| Total Lines of Code | ~13,500+ lines |
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
├── docs/                              # Project documentation (184 files)
│   ├── architecture/                  # Architecture docs (25 files, sharded)
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
│   ├── prd/                           # Product Requirements (2 files)
│   │   └── orchestratai_prd_v2.md     # PRD v2
│   ├── qa/                            # Quality assurance docs
│   │   ├── gates/                     # QA Gate Definitions (30 files - Epic 1-5)
│   │   │   ├── Epic 1 Gates (10):
│   │   │   │   ├── 1.1-setup-dependencies.yml
│   │   │   │   ├── 1.2-create-token-file-structure.yml
│   │   │   │   ├── 1.3-create-typescript-enums-zod-schemas.yml
│   │   │   │   ├── 1.4-python-enums-pydantic-schemas.yml
│   │   │   │   ├── 1.5-enum-validation.yml
│   │   │   │   ├── 1.6-install-shadcn-ui-components.yml
│   │   │   │   ├── 1.7-create-desktop-three-panel-layout.yml
│   │   │   │   ├── 1.8-implement-collapsible-panel-functionality.yml
│   │   │   │   ├── 1.9-create-header-footer-components.yml
│   │   │   │   └── 1.10-create-mobile-responsive-layout.yml
│   │   │   ├── Epic 2 Gates (8):
│   │   │   │   ├── 2.1-backend-pydantic-models-mock-service.yml
│   │   │   │   ├── 2.2-backend-chat-endpoint.yml
│   │   │   │   ├── 2.3-frontend-api-client.yml
│   │   │   │   ├── 2.4-chat-api-functions-zod-validation.yml
│   │   │   │   ├── 2.5-message-components.yml
│   │   │   │   ├── 2.6-message-input-area.yml
│   │   │   │   ├── 2.7-chat-provider-state-management.yml
│   │   │   │   └── 2.8-optimistic-ui-error-handling.yml
│   │   │   ├── Epic 3 Gates (6):
│   │   │   │   ├── 3.1-extend-chatresponse-agent-status-logs.yml
│   │   │   │   ├── 3.2-enhance-mock-service-agent-metrics-logs.yml
│   │   │   │   ├── 3.3-build-agent-card-status-badges.yml
│   │   │   │   ├── 3.4-implement-agent-metrics-display.yml
│   │   │   │   ├── 3.5-connect-agent-panel-chatprovider.yml
│   │   │   │   └── 3.7-implement-document-modal.yml
│   │   │   ├── Epic 4 Gates (4):
│   │   │   │   ├── 4.3-backend-sse-streaming.yml
│   │   │   │   ├── 4.4-frontend-streaming-hook.yml
│   │   │   │   ├── 4.5-integrate-streaming-chat.yml
│   │   │   │   └── 4.6-mobile-tab-navigation.yml
│   │   │   └── Epic 5 Gates (2):
│   │   │       ├── 5.1-message-panel-animations.yml
│   │   │       └── 5.2-agent-card-hover.yml
│   │   └── assessments/               # QA Assessments (inline)
│   ├── stories/                       # User stories (62 files - all epics)
│   │   ├── README.md                  # Stories overview
│   │   │
│   │   ├── Epic Summaries (6):
│   │   │   ├── epic-1-foundation-design-system.md
│   │   │   ├── epic-2-chat-interface.md
│   │   │   ├── epic-3-agent-log-panels.md
│   │   │   ├── epic-4-mobile-realtime.md
│   │   │   ├── epic-5-polish-enhancement.md
│   │   │   └── epic-6-documentation-deployment.md
│   │   │
│   │   ├── Epic 1 Stories (10): ✅ ALL COMPLETE
│   │   │   ├── 1.1.setup-dependencies.story.md
│   │   │   ├── 1.2.create-token-file-structure.story.md
│   │   │   ├── 1.3.create-typescript-enums-zod-schemas.story.md
│   │   │   ├── 1.4.create-python-enums-pydantic-schemas.story.md
│   │   │   ├── 1.5.create-enum-validation-script.story.md
│   │   │   ├── 1.6.install-shadcn-ui-components.story.md
│   │   │   ├── 1.7.create-desktop-three-panel-layout.story.md
│   │   │   ├── 1.8.implement-collapsible-panel-functionality.story.md
│   │   │   ├── 1.9.create-header-footer-components.story.md
│   │   │   └── 1.10.create-mobile-responsive-layout.story.md
│   │   │
│   │   ├── Epic 2 Stories (8): ✅ ALL COMPLETE
│   │   │   ├── 2.1.backend-pydantic-models-mock-service.story.md
│   │   │   ├── 2.2.backend-chat-endpoint.story.md
│   │   │   ├── 2.3.frontend-api-client.story.md
│   │   │   ├── 2.4.chat-api-functions-zod-validation.story.md
│   │   │   ├── 2.5.message-components.story.md
│   │   │   ├── 2.6.message-input-area.story.md
│   │   │   ├── 2.7.chat-provider-state-management.story.md
│   │   │   └── 2.8.optimistic-ui-error-handling.story.md
│   │   │
│   │   ├── Epic 3 Stories (7): ✅ ALL COMPLETE
│   │   │   ├── 3.1.extend-chatresponse-agent-status-logs.story.md
│   │   │   ├── 3.2.enhance-mock-service-agent-metrics-logs.story.md
│   │   │   ├── 3.3.build-agent-card-status-badges.story.md
│   │   │   ├── 3.4.implement-agent-metrics-display.story.md
│   │   │   ├── 3.5.connect-agent-panel-chatprovider.story.md
│   │   │   ├── 3.6.build-log-entry-components.story.md
│   │   │   └── 3.7.implement-document-modal.story.md
│   │   │
│   │   ├── Epic 4 Stories (6): ✅ MOSTLY COMPLETE (4-5 done)
│   │   │   ├── 4.1.session-persistence-backend.story.md
│   │   │   ├── 4.2.session-persistence-frontend.story.md
│   │   │   ├── 4.3.backend-sse-streaming.story.md          ✅
│   │   │   ├── 4.4.frontend-streaming-hook.story.md        ✅
│   │   │   ├── 4.5.integrate-streaming-chat.story.md       ✅
│   │   │   └── 4.6.mobile-tab-navigation.story.md          ✅
│   │   │
│   │   ├── Epic 5 Stories (9): 🚧 IN PROGRESS (2 done)
│   │   │   ├── 5.1.message-panel-animations.story.md       ✅
│   │   │   ├── 5.2.agent-card-hover.story.md               ✅
│   │   │   ├── 5.3.reduced-motion-support.story.md         🚧
│   │   │   ├── 5.4.keyboard-shortcuts-system.story.md      🚧
│   │   │   ├── 5.5.redis-session-persistence.story.md      🚧
│   │   │   ├── 5.6.performance-optimization.story.md       🚧
│   │   │   ├── 5.7.virtual-scrolling-logs.story.md         🚧
│   │   │   ├── 5.8.loading-states-skeleton.story.md        📋
│   │   │   └── 5.9.accessibility-enhancements.story.md     📋
│   │   │
│   │   └── Epic 6 Stories (5): 📋 ALL PLANNED
│   │       ├── 6.1.professional-readme.story.md
│   │       ├── 6.2.component-api-docs.story.md
│   │       ├── 6.3.demo-video.story.md
│   │       ├── 6.4.frontend-deployment.story.md
│   │       └── 6.5.production-testing-qa.story.md
│   │
│   └── ux-design-tokens/              # UX Design Token Guides (10 files)
│       ├── component-styling-guide.md
│       ├── css-tokens-usage.md
│       ├── shadcn-migration-quick-reference.md
│       ├── shadcn-ui-token-mappings.md
│       └── story-1-1-completion-summary.md
│       └── [5 additional UX guides]
│
├── orchestratai_client/               # ⚛️ Frontend Application (✅ Epic 1-3 Complete, 4-5 In Progress)
│   ├── public/                        # Static assets (empty currently)
│   │
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── api/chat/stream/       # SSE Streaming Routes (✅ Epic 4)
│   │   │   │   ├── initiate/route.ts  # Initiate stream endpoint (119 lines)
│   │   │   │   └── [stream_id]/route.ts # Stream by ID endpoint (119 lines)
│   │   │   │
│   │   │   ├── layout.tsx             # Root layout (✅)
│   │   │   ├── page.tsx               # Home page - main chat interface (✅)
│   │   │   ├── globals.css            # Global styles + Tailwind (991 lines) (✅)
│   │   │   └── styles/                # Design token system (✅)
│   │   │       └── tokens/            # CSS custom properties (7 files)
│   │   │           ├── colors.css     # Color palette tokens
│   │   │           ├── typography.css # Font & text tokens
│   │   │           ├── spacing.css    # Spacing scale tokens
│   │   │           ├── layout.css     # Layout tokens
│   │   │           ├── animation.css  # Animation tokens
│   │   │           ├── effects.css    # Shadow & effect tokens
│   │   │           └── opacity.css    # Opacity tokens
│   │   │
│   │   ├── components/                # React Components
│   │   │   ├── ui/                    # shadcn/ui primitives (13 components) (✅)
│   │   │   │   ├── badge.tsx          # Badge component
│   │   │   │   ├── button.tsx         # Button component
│   │   │   │   ├── card.tsx           # Card component
│   │   │   │   ├── collapsible.tsx    # Collapsible component
│   │   │   │   ├── dialog.tsx         # Dialog component (155 lines)
│   │   │   │   ├── input.tsx          # Input component
│   │   │   │   ├── progress.tsx       # Progress bar
│   │   │   │   ├── scroll-area.tsx    # Scroll area component
│   │   │   │   ├── separator.tsx      # Separator component
│   │   │   │   ├── skeleton.tsx       # Skeleton loading (✅ Epic 5)
│   │   │   │   ├── sonner.tsx         # Toast notifications (✅)
│   │   │   │   ├── tabs.tsx           # Tabs component
│   │   │   │   └── textarea.tsx       # Textarea component (✅)
│   │   │   │
│   │   │   ├── chat/                  # Chat Components (8 files) (✅ Epic 2)
│   │   │   │   ├── chat-interface.tsx # Main chat container
│   │   │   │   ├── chat-error-boundary.tsx # Error boundary wrapper
│   │   │   │   ├── input-area.tsx     # Message input with validation
│   │   │   │   ├── message-bubble.tsx # Individual message display (145 lines)
│   │   │   │   ├── message-list.tsx   # Message list container
│   │   │   │   ├── typing-indicator.tsx # Typing animation
│   │   │   │   ├── types.ts           # Chat component types
│   │   │   │   └── __tests__/         # Component tests (5 files)
│   │   │   │       ├── chat-interface-integration.test.tsx
│   │   │   │       ├── input-area.test.tsx
│   │   │   │       ├── message-bubble.test.tsx
│   │   │   │       ├── message-list.test.tsx
│   │   │   │       └── typing-indicator.test.tsx
│   │   │   │
│   │   │   ├── panels/                # Panel Components (14 files) (✅ Epic 3)
│   │   │   │   ├── agent-card.tsx     # Agent card UI (232 lines)
│   │   │   │   ├── agent-card-skeleton.tsx # Skeleton loading (✅ Epic 5)
│   │   │   │   ├── agent-metrics.tsx  # Metrics display (121 lines)
│   │   │   │   ├── agent-panel.tsx    # Agent status panel (138 lines)
│   │   │   │   ├── agent-status-badge.tsx # Status indicators
│   │   │   │   ├── cache-operation-card.tsx # Cache operations
│   │   │   │   ├── collapsible-panel.tsx # Reusable collapsible panel
│   │   │   │   ├── document-modal.tsx # Document preview modal (119 lines)
│   │   │   │   ├── document-preview.tsx # Document viewer
│   │   │   │   ├── execution-graph.tsx # Graph visualization (219 lines)
│   │   │   │   ├── log-entry.tsx      # Individual log entry
│   │   │   │   ├── query-analysis-card.tsx # Query breakdown
│   │   │   │   ├── retrieval-panel.tsx # Log panel (385 lines)
│   │   │   │   └── vector-search-card.tsx # Search results (118 lines)
│   │   │   │
│   │   │   ├── providers/             # React Context Providers (✅)
│   │   │   │   ├── chat-provider.tsx  # Chat state management (1,040 lines - expanded)
│   │   │   │   └── __tests__/
│   │   │   │       └── chat-provider.test.tsx
│   │   │   │
│   │   │   └── layout/                # Layout components (4 files) (✅)
│   │   │       ├── header.tsx         # App header
│   │   │       ├── footer.tsx         # App footer
│   │   │       ├── three-panel-layout.tsx  # Desktop 3-panel layout (228 lines)
│   │   │       └── mobile-layout.tsx  # Mobile responsive layout
│   │   │
│   │   ├── hooks/                     # React Hooks (4 files) (✅ Epic 3-4)
│   │   │   ├── use-chat-agents.ts     # Agent state management (✅ Epic 3)
│   │   │   ├── use-chat-logs.ts       # Log state management (✅ Epic 3)
│   │   │   ├── use-is-touch-device.ts # Touch detection (✅ Epic 5)
│   │   │   └── use-streaming.ts       # Streaming hook (524 lines) (✅ Epic 4)
│   │   │
│   │   ├── lib/                       # Utilities & Types
│   │   │   ├── api/                   # API Client Layer (✅)
│   │   │   │   ├── chat.ts            # Chat API functions (125 lines)
│   │   │   │   └── __tests__/
│   │   │   │       └── chat.test.ts
│   │   │   │
│   │   │   ├── utils/                 # Utility Functions (✅)
│   │   │   │   ├── agent-colors.ts    # Agent color mappings
│   │   │   │   ├── error-messages.ts  # User-friendly error messages (115 lines)
│   │   │   │   └── format-metrics.ts  # Metric formatting (✅ Epic 3)
│   │   │   │
│   │   │   ├── animations.ts          # Animation system (207 lines) (✅ Epic 5)
│   │   │   ├── api-client.ts          # Base API client (214 lines) (✅)
│   │   │   ├── enums.ts               # Shared enums (✅)
│   │   │   ├── errors.ts              # Custom error classes (126 lines) (✅)
│   │   │   ├── schemas.ts             # Zod validation schemas (263 lines) (✅)
│   │   │   ├── types.ts               # TypeScript interfaces (✅)
│   │   │   ├── utils.ts               # Utility functions (cn helper) (✅)
│   │   │   └── __tests__/             # Library tests (6 files)
│   │   │       ├── api-client.test.ts
│   │   │       ├── enums.test.ts
│   │   │       ├── errors.test.ts
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
├── orchestratai_api/                  # 🐍 Backend Application (✅ Epic 1-3 Complete, 4 In Progress)
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point (38 lines) (✅)
│   │   ├── config.py                  # Configuration management (36 lines) (✅)
│   │   │
│   │   ├── api/                       # API Layer (✅)
│   │   │   ├── __init__.py
│   │   │   ├── health.py              # Health check endpoint (38 lines) (✅)
│   │   │   └── routes/                # API Routes (✅)
│   │   │       ├── __init__.py
│   │   │       └── chat.py            # Chat + SSE endpoints (313 lines) (✅ Epic 2-4)
│   │   │
│   │   ├── models/                    # Data Models (✅)
│   │   │   ├── __init__.py
│   │   │   ├── enums.py               # Python enums (69 lines - synced) (✅)
│   │   │   └── schemas.py             # Pydantic models (179 lines - extended) (✅ Epic 2-3)
│   │   │
│   │   └── services/                  # Business Logic (✅ Epic 2-4)
│   │       ├── __init__.py
│   │       ├── mock_data.py           # Mock response generator (464 lines - enhanced) (✅)
│   │       └── sse_utils.py           # SSE utilities (35 lines) (✅ Epic 4)
│   │
│   ├── tests/                         # Python tests (9 files) (✅)
│   │   ├── __init__.py
│   │   ├── test_health.py             # Health endpoint tests (✅)
│   │   ├── test_enums.py              # Enum tests (✅)
│   │   ├── test_schemas.py            # Schema validation tests (✅)
│   │   ├── test_new_schemas.py        # Extended schema tests (✅ Epic 3)
│   │   ├── test_chat_endpoint.py      # Chat endpoint tests (✅)
│   │   ├── test_chat_stream_endpoint.py # SSE endpoint tests (✅ Epic 4)
│   │   ├── test_mock_data.py          # Mock service tests (✅)
│   │   └── test_sse_utils.py          # SSE utility tests (✅ Epic 4)
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

### Frontend (`orchestratai_client/`) - ✅ Epic 1-3 Complete, Epic 4-5 In Progress
- **Next.js 15 + React 19** application with App Router
- **Server Components First** architecture
- Uses **shadcn/ui** for UI primitives (13 components implemented)
- **Tailwind CSS v4** with custom 7-token system (991 lines in globals.css)
  - colors, typography, spacing, layout, animation, effects, opacity
- **Complete Chat Interface** (Epic 2)
  - 8 chat components with comprehensive functionality
  - Message bubbles with user/assistant styling
  - Input area with validation
  - Typing indicator animation
  - Error boundary for resilience
- **Chat State Management** (Epic 2-4)
  - React Context + useReducer (1,040 lines - expanded for streaming)
  - Optimistic UI updates
  - Error recovery and retry logic
  - Message history management
  - Real-time streaming integration
- **Agent & Log Panels** (Epic 3) ✨ NEW
  - 14 panel components (agents + logs)
  - Agent panel with real-time status (138 lines)
  - Log retrieval panel (385 lines)
  - Document preview modal (119 lines)
  - Execution graph visualization (219 lines)
  - 2 specialized hooks for agent/log state
- **Real-time Streaming** (Epic 4) ✨ NEW
  - SSE streaming infrastructure
  - 2 Next.js API routes (238 lines combined)
  - Streaming hook with connection management (524 lines)
  - Real-time message updates
- **Animation System** (Epic 5) ✨ NEW
  - Framer Motion integration (207 lines)
  - Message and panel transitions
  - Agent card hover effects
  - Skeleton loading states
  - Touch device detection
- **API Client Layer** (Epic 2-3)
  - Base API client with error handling (214 lines)
  - Chat-specific API functions (125 lines)
  - Zod validation integration (263 lines)
  - User-friendly error messages (115 lines)
- **3-panel responsive layout** (desktop) + **tabbed mobile layout** (228 lines)
- **Vitest** for unit tests with 90%+ coverage requirement
- **Bun** as package manager and runtime
- **ESLint flat config** with custom local rules
- **Prettier** for code formatting
- **Total Frontend Source:** ~7,227 lines (non-test code)

### Backend (`orchestratai_api/`) - ✅ Epic 1-3 Complete, Epic 4 In Progress
- **FastAPI** Python backend with comprehensive API implementation
- **Health check endpoint** operational (`/health` - 38 lines)
- **Chat endpoint** operational (`/api/chat` - 313 lines total)
- **SSE Streaming** (Epic 4) ✨ NEW
  - Server-Sent Events infrastructure (35 lines sse_utils.py)
  - Streaming endpoints in chat.py
  - Real-time message delivery
  - Connection management and error handling
- **Enhanced Mock Data Service** (Epic 2-3)
  - Keyword-based routing (464 lines - enhanced)
  - Generates realistic chat responses
  - Simulates agent behavior with metrics
  - Includes logs, documents, and execution graphs
  - Enhanced with agent status and retrieval logs
- **Extended Pydantic models** (Epic 2-3)
  - ChatRequest, ChatResponse
  - Agent, Message, RetrievalLog (extended)
  - ChatMetrics with timing data
  - Document, QueryAnalysis, VectorSearchResult
  - CacheOperation, ExecutionStep
  - 179 lines of comprehensive schemas
- **Enum synchronization** with frontend (69 lines, validated in CI/CD)
  - 5 enums: AgentId, AgentStatus, MessageRole, LogType, LogStatus
- **uv** for Python dependency management
- **pytest** for testing with 90%+ coverage requirement
  - 9 comprehensive test files
  - Tests for all endpoints, schemas, services, and utilities
- **Total Backend Source:** ~1,184 lines
- **Future expansion** planned for real agents, LangGraph integration, middleware

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

### Epic 3: Agent & Log Panels ✅ COMPLETE
**Stories:** 3.1 - 3.7 | **Status:** All 7 stories completed

| Story | Description | Status |
|-------|-------------|--------|
| 3.1 | Extend ChatResponse with Agent Status & Logs | ✅ Complete |
| 3.2 | Enhance Mock Service with Agent Metrics | ✅ Complete |
| 3.3 | Build Agent Card with Status Badges | ✅ Complete |
| 3.4 | Implement Agent Metrics Display | ✅ Complete |
| 3.5 | Connect Agent Panel to ChatProvider | ✅ Complete |
| 3.6 | Build Log Entry Components | ✅ Complete |
| 3.7 | Implement Document Modal | ✅ Complete |

**Key Deliverables:**
- 14 new panel components (agent + log visualization)
- Agent status panel with real-time updates (138 lines)
- Log retrieval panel with filtering (385 lines)
- Document preview modal (119 lines)
- Execution graph visualization (219 lines)
- Enhanced mock service with agent metrics (464 lines)
- Extended Pydantic schemas for agents and logs (179 lines)
- 2 new hooks for agent and log state management
- Comprehensive test coverage for all components

### Epic 4: Mobile & Real-time ✅ LARGELY COMPLETE
**Stories:** 4.1 - 4.6 | **Status:** 4-5 of 6 stories completed (4.3-4.6 confirmed complete)

| Story | Description | Status |
|-------|-------------|--------|
| 4.1 | Session Persistence Backend | 📋 Planned |
| 4.2 | Session Persistence Frontend | 📋 Planned |
| 4.3 | Backend SSE Streaming | ✅ Complete |
| 4.4 | Frontend Streaming Hook | ✅ Complete |
| 4.5 | Integrate Streaming with Chat | ✅ Complete |
| 4.6 | Mobile Tab Navigation | ✅ Complete |

**Key Deliverables:**
- Server-Sent Events (SSE) infrastructure implemented
- Backend SSE utilities (35 lines)
- SSE endpoints in chat.py (313 lines total)
- 2 Next.js API routes for streaming (238 lines combined)
- Streaming hook with connection management (524 lines)
- Real-time message updates in chat provider (1,040 lines)
- Error handling and reconnection logic
- Mobile tab navigation (likely complete)

### Epic 5: Polish & Enhancement 🚧 IN PROGRESS
**Stories:** 5.1 - 5.9 | **Status:** 2 complete, 4 in progress, 3 planned

| Story | Description | Status |
|-------|-------------|--------|
| 5.1 | Message Panel Animations | ✅ Complete |
| 5.2 | Agent Card Hover Effects | ✅ Complete |
| 5.3 | Reduced Motion Support | 🚧 In Progress |
| 5.4 | Keyboard Shortcuts System | 🚧 In Progress |
| 5.5 | Redis Session Persistence | 🚧 In Progress |
| 5.6 | Performance Optimization | 🚧 In Progress |
| 5.7 | Virtual Scrolling for Logs | 🚧 In Progress |
| 5.8 | Loading States & Skeleton | 📋 Planned |
| 5.9 | Accessibility Enhancements | 📋 Planned |

**Completed Deliverables:**
- Animation system with Framer Motion (207 lines)
- Smooth message and panel transitions
- Agent card hover effects and interactions
- Touch device detection hook
- Skeleton loading for agent cards

**In Progress:**
- Reduced motion support for accessibility
- Keyboard shortcuts system
- Redis session persistence
- Performance optimizations
- Virtual scrolling for log panels

### Epic 6: Documentation & Deployment 📋 PLANNED
**Stories:** 6.1 - 6.5 | **Status:** All planned

| Story | Description | Status |
|-------|-------------|--------|
| 6.1 | Professional README Documentation | 📋 Planned |
| 6.2 | Component API Documentation | 📋 Planned |
| 6.3 | Demo Video Production | 📋 Planned |
| 6.4 | Frontend Deployment (Vercel) | 📋 Planned |
| 6.5 | Production Testing & QA | 📋 Planned |

**Planned Deliverables:**
- Comprehensive README with setup instructions
- API documentation for all components
- Professional demo video
- Production deployment to Vercel
- Final QA and testing before release

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Chat Components (Epic 2)
import { ChatInterface } from '@/components/chat/chat-interface';
import { MessageBubble } from '@/components/chat/message-bubble';
import { InputArea } from '@/components/chat/input-area';
import { TypingIndicator } from '@/components/chat/typing-indicator';

// Panel Components (Epic 3)
import { AgentPanel } from '@/components/panels/agent-panel';
import { AgentCard } from '@/components/panels/agent-card';
import { AgentCardSkeleton } from '@/components/panels/agent-card-skeleton';
import { AgentMetrics } from '@/components/panels/agent-metrics';
import { AgentStatusBadge } from '@/components/panels/agent-status-badge';
import { RetrievalPanel } from '@/components/panels/retrieval-panel';
import { LogEntry } from '@/components/panels/log-entry';
import { DocumentModal } from '@/components/panels/document-modal';
import { DocumentPreview } from '@/components/panels/document-preview';
import { ExecutionGraph } from '@/components/panels/execution-graph';
import { QueryAnalysisCard } from '@/components/panels/query-analysis-card';
import { VectorSearchCard } from '@/components/panels/vector-search-card';
import { CacheOperationCard } from '@/components/panels/cache-operation-card';
import { CollapsiblePanel } from '@/components/panels/collapsible-panel';

// Providers (Epic 2-4)
import { ChatProvider, useChatContext } from '@/components/providers/chat-provider';

// Layout Components (Epic 1)
import { ThreePanelLayout } from '@/components/layout/three-panel-layout';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Hooks (Epic 3-5)
import { useChatAgents } from '@/hooks/use-chat-agents';
import { useChatLogs } from '@/hooks/use-chat-logs';
import { useStreaming } from '@/hooks/use-streaming';
import { useIsTouchDevice } from '@/hooks/use-is-touch-device';

// API Layer (Epic 2-4)
import { sendChatMessage } from '@/lib/api/chat';
import { apiClient } from '@/lib/api-client';

// Utilities (Epic 2-5)
import { cn } from '@/lib/utils';
import { getAgentColor } from '@/lib/utils/agent-colors';
import { getUserFriendlyErrorMessage } from '@/lib/utils/error-messages';
import { formatMetrics } from '@/lib/utils/format-metrics';

// Animation System (Epic 5)
import {
  messageVariants,
  panelVariants,
  fadeInVariants
} from '@/lib/animations';

// Types, Schemas, Errors (Epic 2-3)
import type {
  Agent,
  Message,
  RetrievalLog,
  ChatRequest,
  ChatResponse,
  Document,
  QueryAnalysis,
  VectorSearchResult,
  CacheOperation,
  ExecutionStep
} from '@/lib/types';
import { AgentId, AgentStatus, MessageRole, LogType, LogStatus } from '@/lib/enums';
import { chatRequestSchema, chatResponseSchema } from '@/lib/schemas';
import { APIError, NetworkError, ValidationError } from '@/lib/errors';
```

### Backend (`orchestratai_api`) - Current Implementation
```python
# Pydantic models (Epic 2-3)
from src.models.schemas import (
    Agent,
    Message,
    RetrievalLog,
    ChatMetrics,
    ChatRequest,
    ChatResponse,
    Document,
    QueryAnalysis,
    VectorSearchResult,
    CacheOperation,
    ExecutionStep,
)

# Enums (Epic 1-3)
from src.models.enums import AgentId, AgentStatus, MessageRole, LogType, LogStatus

# API routes (Epic 2-4)
from src.api.health import health_check
from src.api.routes.chat import chat_endpoint, stream_chat_endpoint

# Services (Epic 2-4)
from src.services.mock_data import generate_mock_response
from src.services.sse_utils import create_sse_message, sse_generator

# Configuration (Epic 1)
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

## Recent Changes (Epic 3-5 Implementation)

### Epic 3: Agent & Log Panels (Complete)
**Backend:**
- **Enhanced:** `src/services/mock_data.py` - Expanded from 258 to 464 lines
- **Enhanced:** `src/models/schemas.py` - Extended to 179 lines with agent/log models
- **New Tests:** `test_new_schemas.py` - Tests for extended schemas

**Frontend:**
- **New Directory:** `src/components/panels/` - 14 panel components
  - Agent components: `agent-panel.tsx` (138 lines), `agent-card.tsx` (232 lines), `agent-metrics.tsx` (121 lines), `agent-status-badge.tsx`, `agent-card-skeleton.tsx`
  - Log components: `retrieval-panel.tsx` (385 lines), `log-entry.tsx`, `document-modal.tsx` (119 lines), `document-preview.tsx`
  - Visualization: `execution-graph.tsx` (219 lines), `query-analysis-card.tsx`, `vector-search-card.tsx` (118 lines), `cache-operation-card.tsx`
- **New Directory:** `src/hooks/` - 4 React hooks
  - `use-chat-agents.ts` - Agent state management
  - `use-chat-logs.ts` - Log state management
  - `use-streaming.ts` (524 lines) - Streaming hook
  - `use-is-touch-device.ts` - Touch detection
- **New Utility:** `src/lib/utils/format-metrics.ts` - Metric formatting

### Epic 4: Real-time Streaming (Mostly Complete)
**Backend:**
- **New File:** `src/services/sse_utils.py` - SSE utilities (35 lines)
- **Enhanced:** `src/api/routes/chat.py` - Expanded to 313 lines with SSE endpoints
- **New Test:** `test_chat_stream_endpoint.py` - SSE endpoint tests
- **New Test:** `test_sse_utils.py` - SSE utility tests

**Frontend:**
- **New Directory:** `src/app/api/chat/stream/` - SSE API routes
  - `initiate/route.ts` (119 lines) - Initiate streaming
  - `[stream_id]/route.ts` (119 lines) - Stream by ID
- **New Hook:** `use-streaming.ts` (524 lines) - Streaming with connection management
- **Enhanced:** `chat-provider.tsx` - Expanded from 395 to 1,040 lines

### Epic 5: Polish & Enhancement (In Progress - 2 Complete)
**Frontend:**
- **New File:** `src/lib/animations.ts` - Animation system (207 lines)
- **New UI Component:** `skeleton.tsx` - Skeleton loading
- **New Component:** `agent-card-skeleton.tsx` - Agent card skeleton
- **New Hook:** `use-is-touch-device.ts` - Touch device detection
- **Enhanced:** `agent-card.tsx` - Added hover effects and interactions

### Documentation Additions
- **Epic 3-4 Stories:** 13 story files (3.1-3.7, 4.1-4.6)
- **Epic 5 Stories:** 9 story files (5.1-5.9)
- **QA Gates:** 12 new gates (Epic 3: 6, Epic 4: 4, Epic 5: 2)
- **Git Commits:** 20+ commits documenting Epic 3-5 implementation

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
- **Backend Source:** ~1,184 lines
  - `src/services/mock_data.py`: 464 lines (enhanced)
  - `src/api/routes/chat.py`: 313 lines (with SSE)
  - `src/models/schemas.py`: 179 lines (extended)
  - `src/models/enums.py`: 69 lines
  - `src/services/sse_utils.py`: 35 lines (NEW)
  - `src/api/health.py`: 38 lines
  - `src/main.py`: 38 lines
  - `src/config.py`: 36 lines

- **Frontend Source:** ~7,227 lines (non-test)
  - **Chat System:** ~1,300 lines
    - `chat-provider.tsx`: 1,040 lines (expanded)
    - Chat components: ~260 lines
  - **Panel Components:** ~1,500+ lines
    - `retrieval-panel.tsx`: 385 lines
    - `agent-card.tsx`: 232 lines
    - `execution-graph.tsx`: 219 lines
    - `agent-panel.tsx`: 138 lines
    - `agent-metrics.tsx`: 121 lines
    - `document-modal.tsx`: 119 lines
    - `vector-search-card.tsx`: 118 lines
    - Other panel components: ~170 lines
  - **Hooks:** ~600+ lines
    - `use-streaming.ts`: 524 lines
    - Other hooks: ~80 lines
  - **Core Libraries:** ~1,100+ lines
    - `globals.css`: 991 lines (design tokens + Tailwind)
    - `schemas.ts`: 263 lines
    - `three-panel-layout.tsx`: 228 lines
    - `api-client.ts`: 214 lines
    - `animations.ts`: 207 lines
    - `dialog.tsx`: 155 lines
    - `message-bubble.tsx`: 145 lines
    - `errors.ts`: 126 lines
    - `chat.ts` (API): 125 lines
    - Other utilities: ~200+ lines
  - **API Routes:** ~240 lines
    - `initiate/route.ts`: 119 lines
    - `[stream_id]/route.ts`: 119 lines
  - **UI Components (shadcn):** ~600 lines (13 components)
  - **Layout Components:** ~400 lines (4 components)
  - **Other Source Files:** ~1,500+ lines

- **Total Project Lines:** ~13,500+ lines
  - Backend: ~1,184 lines
  - Frontend: ~7,227 lines
  - Tests: ~3,000+ lines
  - Documentation: ~2,000+ lines (markdown)

### Test Coverage
- **Backend:** 90%+ (enforced by pre-push hook and CI)
  - 9 test files covering all modules
- **Frontend:** 90%+ (enforced by pre-push hook and CI)
  - 30+ test files with comprehensive coverage

---

**Document Maintained By:** Winston (Architect Agent)
**Last Review:** November 2, 2025
**Previous Review:** October 26, 2025
**Next Review:** After Epic 5 completion or Epic 6 start
**Reference:** See `docs/architecture/11-unified-project-structure.md` for architectural context

---

## Changelog

### November 2, 2025 - Major Update
- **Updated Status:** Epic 1-3 Complete, Epic 4 Mostly Complete, Epic 5 In Progress
- **Added Epic 3 Implementation:** 14 panel components, 2 hooks, enhanced backend
- **Added Epic 4 Implementation:** SSE streaming infrastructure, streaming hook, API routes
- **Added Epic 5 Implementation:** Animation system, skeleton loading, hover effects
- **Updated File Counts:** Frontend 58 → 109 files, Backend 26 → 23 files (accurate count)
- **Updated Lines of Code:** Total ~6,500 → ~13,500 lines (107% growth)
- **Updated QA Gates:** 18 → 30 gates (Epic 3-5 added)
- **Updated Documentation:** Added 25+ new story files, 12 new QA gates
- **Enhanced Metrics:** Comprehensive breakdown by Epic and component type
- **Updated Import Aliases:** Added all Epic 3-5 components and hooks

### October 26, 2025 - Initial Comprehensive Documentation
- Created comprehensive source tree documentation
- Documented Epic 1-2 completion
- Established baseline metrics and structure
