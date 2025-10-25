# 13. Deployment Architecture

## 13.1 Deployment Strategy

**Frontend (Vercel):**
- Platform: Vercel
- Build: `cd orchestratai_client && bun run build`
- CDN: Global edge network
- Env: `NEXT_PUBLIC_API_URL=https://api.railway.app`

**Backend (Railway):**
- Platform: Railway
- Build: Docker (uses Dockerfile)
- Services: FastAPI + Redis addon
- Env: `CORS_ORIGINS=https://orchestratai.vercel.app`

---

## 13.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  validate-enums:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun run validate:enums

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: cd orchestratai_client && bun test

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: astral-sh/setup-uv@v1
      - run: cd orchestratai_api && uv run pytest
```

---

## 13.3 Environments

| Environment | Frontend | Backend | Purpose |
|-------------|----------|---------|---------|
| Development | http://localhost:3000 | http://localhost:8000 | Local dev |
| Staging | staging.vercel.app | staging.railway.app | Testing |
| Production | orchestratai.vercel.app | api.railway.app | Live |

---
