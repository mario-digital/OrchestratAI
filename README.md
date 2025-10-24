# OrchestratAI

> ⚠️ **Status:** Under active development

OrchestratAI is an advanced customer service AI application featuring a multi-agent architecture with intelligent routing and specialized support capabilities. The application showcases a modular monolith architecture - a single deployable unit with clearly separated, loosely-coupled modules that can be easily extracted into microservices in the future.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend:** FastAPI, Python 3.12, uv
- **Infrastructure:** Docker, Redis
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Bun (for local development)

### Running with Docker

**Development mode (with hot reload):**
```bash
docker compose up
```

**Run in background:**
```bash
docker compose up -d
```

**View logs:**
```bash
docker compose logs -f
```

**Stop containers:**
```bash
docker compose down
```

**Production mode:**
```bash
docker compose -f docker-compose.prod.yml up
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs