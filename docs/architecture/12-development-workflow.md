# 12. Development Workflow

## 12.1 Prerequisites

```bash
# Required
- Docker Desktop 27+
- Bun 1.1+
- uv (Python package manager)
- Git
```

---

## 12.2 Local Setup

```bash
# Clone repository
git clone https://github.com/mario-digital/OrchestratAI.git
cd OrchestratAI

# Start all services
docker compose up

# View logs
docker compose logs -f
```

---

## 12.3 Development Commands

```bash
# Start all (frontend + backend + Redis)
docker compose up

# Run tests
bun run test

# Validate enums
bun run validate:enums

# Lint
bun run lint

# Format
bun run format
```

---

## 12.4 Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=OrchestratAI

# Backend (.env)
REDIS_URL=redis://redis:6379
CORS_ORIGINS=http://localhost:3000
DEBUG=true
```

---
