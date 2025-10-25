# 1. Introduction

## 1.1 Starter Template or Existing Project

**Status:** Partially Bootstrapped Project

OrchestratAI is built on an existing foundation with the following components already in place:

✅ **Infrastructure:**
- Docker + Docker Compose (development & production)
- Bun monorepo workspace structure
- Next.js 15 + React 19 frontend (`orchestratai_client/`)
- FastAPI + Python 3.12 backend (`orchestratai_api/`)
- ESLint 9, Prettier, Vitest, Husky pre-configured

❌ **NOT using a complete fullstack starter template** (e.g., T3 Stack, create-t3-app)

**Architectural Constraints:**
1. **Monorepo structure is fixed** - Must maintain `orchestratai_client/` and `orchestratai_api/` separation
2. **Package managers are fixed** - Bun (frontend), uv (backend)
3. **Docker-first development** - All development through containers
4. **Tailwind CSS v4** - Already configured with custom token system
5. **Next.js App Router** - Using React Server Components First approach

**What CAN be modified:**
- Internal directory structure within `src/` folders
- Additional shared packages in `packages/`
- Testing frameworks and tooling
- CI/CD pipeline configuration
- Deployment targets

**Recommendation:** Proceed with architecture design within these constraints. The existing setup follows modern best practices and should be enhanced rather than replaced.

---

## 1.2 Document Purpose

This document outlines the complete fullstack architecture for **OrchestratAI**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for a modern fullstack application where these concerns are increasingly intertwined.

**Key Goals:**
- Provide detailed technical guidance for implementing PRD v2.0
- Define integration patterns between Next.js frontend and FastAPI backend
- Establish data models shared between frontend (TypeScript) and backend (Python)
- Specify API contracts and communication protocols
- Guide Docker-based development and deployment workflows

---
