# 3. Tech Stack

This is the **DEFINITIVE** technology selection for OrchestratAI. All development must use these exact versions and tools.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.6+ | Type-safe JavaScript for frontend | Industry standard, excellent IDE support, catches errors at compile-time |
| **Frontend Framework** | Next.js | 15.5 | React meta-framework with SSR/SSG | Latest stable, App Router, React Server Components, Turbopack, server actions |
| **React** | React | 19.2 | UI library | Latest stable, React Compiler, Actions API, enhanced Suspense |
| **UI Component Library** | shadcn/ui | 3.5.0 | Accessible component primitives | Radix UI based, fully customizable, copy-paste approach, Tailwind compatible |
| **CSS Framework** | Tailwind CSS | 4.0 | Utility-first styling | Latest v4, 3-layer token system, proven in my_flow_app, optimal DX |
| **State Management** | React Context + TanStack Query | React 19 + v5 | Client state + server cache | Server Components reduce client state needs, TanStack for API caching (Phase 5) |
| **Icons** | Lucide React | Latest | Icon library | Consistent with shadcn/ui, tree-shakeable, modern design |
| **Runtime Validation** | Zod | 3.23+ | Schema validation | Type inference, runtime safety, API contract validation |
| **Backend Language** | Python | 3.12 | Backend programming language | Latest stable, excellent AI/ML libraries for future LangGraph integration |
| **Backend Framework** | FastAPI | 0.115+ | Modern Python web framework | Auto OpenAPI docs, async support, Pydantic validation, fast performance |
| **Package Manager (BE)** | uv | Latest | Python package manager | 10-100x faster than pip, modern replacement, excellent DX |
| **API Style** | REST JSON | OpenAPI 3.0 | HTTP API protocol | Simple, well-understood, auto-documented via FastAPI, sufficient for MVP |
| **Database** | PostgreSQL (Future) / Mock (MVP) | 16+ / N/A | Relational database | Industry standard, Railway addon when ready, MVP uses mocks |
| **Cache** | Redis | 7-alpine | Session store & caching | Fast in-memory store, configured in docker-compose |
| **File Storage** | Local/S3 (Future) | N/A | Static asset storage | MVP uses local, migrate to S3 when deploying |
| **Authentication** | Custom JWT (MVP) / NextAuth.js (Future) | N/A / v5 | User authentication | MVP skip auth, add NextAuth.js when needed |
| **Frontend Testing** | Vitest | Latest | Unit/integration testing | Fast, Vite-based, already configured |
| **Backend Testing** | pytest | 8.0+ | Python testing framework | Industry standard, already configured |
| **E2E Testing** | Playwright | 1.55+ | Browser automation | Cross-browser support, excellent DX |
| **Package Manager (FE)** | Bun | 1.1+ | JavaScript runtime & package manager | 10x faster than npm, native TypeScript support |
| **Build Tool** | Next.js (FE) / Docker (BE) | 15.5 / 27+ | Build systems | Next.js handles frontend, Docker multi-stage for backend |
| **Bundler** | Turbopack | Beta (Next.js 15) | JavaScript bundler | Faster than Webpack, native to Next.js 15 |
| **IaC Tool** | Docker Compose | 2.29+ | Infrastructure definition | Simple, already configured |
| **CI/CD** | GitHub Actions | N/A | Continuous integration | Free for public repos |
| **Monitoring** | Vercel Analytics / Railway Logs | Platform native | Performance monitoring | Built-in to platforms |
| **Logging** | Console (MVP) / Structured (Future) | N/A / Pino | Application logging | Migrate to structured logging later |
| **Linting** | ESLint | 9.x | Code quality | Latest flat config, custom rules |
| **Formatting** | Prettier | Latest | Code formatting | Consistent style |
| **Git Hooks** | Husky | 9.1+ | Pre-commit automation | Runs enum validation and linting |

---
