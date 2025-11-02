# Python SDK Guide

## Installation

```bash
pip install orchestratai
```

## Client Initialization

```python
from orchestratai import OrchestratAI

client = OrchestratAI(api_key="your_api_key")
```

## Async Support

```python
import asyncio
from orchestratai import AsyncOrchestratAI

async def main():
    client = AsyncOrchestratAI(api_key="your_api_key")
    response = await client.agents.execute(
        agent_type="rag",
        query="What is RAG?"
    )
    print(response.result)

asyncio.run(main())
```

## Context Manager

```python
with OrchestratAI(api_key="your_api_key") as client:
    response = client.agents.execute(...)
```

## Type Hints

The SDK is fully typed for IDE autocomplete:

```python
from orchestratai.types import AgentType, AgentConfig, AgentResponse

config: AgentConfig = {
    "model": "gpt-4",
    "temperature": 0.7
}

response: AgentResponse = client.agents.execute(
    agent_type=AgentType.RAG,
    query="...",
    config=config
)
```

## Error Handling

```python
from orchestratai.exceptions import (
    OrchestratAIError,
    APIError,
    AuthenticationError,
    RateLimitError,
    TimeoutError
)
```

## Pagination

```python
# Paginate through executions
for page in client.executions.list_paginated(limit=100):
    for execution in page:
        print(execution.id)
```

## Logging

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("orchestratai")
```
