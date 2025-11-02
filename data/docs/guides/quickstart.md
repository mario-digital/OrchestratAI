# Quickstart Guide

## Installation

```bash
pip install orchestratai
```

## Your First Request

```python
from orchestratai import OrchestratAI

# Initialize client
client = OrchestratAI(api_key="your_api_key")

# Execute a RAG agent
response = client.agents.execute(
    agent_type="rag",
    query="What is retrieval-augmented generation?",
    config={
        "model": "gpt-4",
        "temperature": 0.7
    }
)

print(response.result)
```

## Streaming Responses

```python
# Stream agent responses
for chunk in client.agents.stream(
    agent_type="rag",
    query="Explain vector databases"
):
    print(chunk.content, end="", flush=True)
```

## Document Upload

```python
# Upload documents for RAG
with open("document.pdf", "rb") as f:
    document = client.documents.upload(
        file=f,
        metadata={"category": "technical"}
    )
```

## Error Handling

```python
from orchestratai.exceptions import (
    OrchestratAIError,
    RateLimitError,
    AuthenticationError
)

try:
    response = client.agents.execute(...)
except RateLimitError:
    print("Rate limit exceeded. Wait before retrying.")
except AuthenticationError:
    print("Invalid API key.")
except OrchestratAIError as e:
    print(f"Error: {e}")
```

## Next Steps

- Explore [agent types](agent-types.md)
- Learn about [configuration options](configuration.md)
- Check out [example projects](examples.md)
