# 10. Backend Architecture

## 10.1 Service Organization

```
orchestratai_api/src/
├── api/routes/          # FastAPI routers
│   ├── health.py
│   ├── chat.py
│   └── session.py
├── agents/              # Agent modules (loosely coupled)
│   ├── __init__.py
│   ├── base_agent.py         # Abstract base class
│   ├── orchestrator.py       # Router agent
│   ├── billing_agent.py      # Billing support
│   ├── technical_agent.py    # Technical support
│   └── policy_agent.py       # Policy & compliance
├── services/            # Business logic
│   ├── mock_data.py
│   └── session_manager.py
├── models/              # Pydantic models
│   ├── enums.py         # Mirror frontend!
│   └── schemas.py
├── middleware/          # Middleware
│   ├── error_handler.py
│   └── logging.py
└── main.py              # App entry
```

---

## 10.2 Controller Pattern

```python
# api/routes/chat.py
from fastapi import APIRouter
from src.models.schemas import ChatRequest, ChatResponse
from src.services.mock_data import generate_mock_response

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Process chat message"""
    response = generate_mock_response(request.message)
    return response
```

---
