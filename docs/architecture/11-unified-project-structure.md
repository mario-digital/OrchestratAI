# 11. Unified Project Structure

```
orchestratai/                          # Monorepo root
├── orchestratai_client/               # Frontend
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   ├── components/                # React components
│   │   ├── lib/                       # Utilities
│   │   └── hooks/                     # Custom hooks
│   ├── public/                        # Static assets
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── orchestratai_api/                  # Backend
│   ├── src/
│   │   ├── api/routes/
│   │   ├── agents/                    # Agent modules (loosely coupled)
│   │   │   ├── __init__.py
│   │   │   ├── base_agent.py         # Abstract base
│   │   │   ├── orchestrator.py       # Router agent
│   │   │   ├── billing_agent.py      # Billing support
│   │   │   ├── technical_agent.py    # Technical support
│   │   │   └── policy_agent.py       # Policy & compliance
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── tests/
│   └── pyproject.toml
│
├── packages/shared/                   # Shared types
│   ├── src/
│   │   ├── types/
│   │   ├── enums/
│   │   └── schemas/
│   └── package.json
│
├── scripts/
│   └── validate-enums.ts              # Enum validator
│
├── docs/
│   ├── prd/
│   └── architecture.md                # This document
│
├── docker-compose.yml
├── package.json                       # Workspace root
└── README.md
```

---
