# Configuration Guide

## Agent Configuration

### Model Selection

```python
config = {
    "model": "gpt-4",  # or "claude-3-opus", "gpt-4-turbo"
    "temperature": 0.7,
    "max_tokens": 2000
}
```

### Temperature Settings
- **0.0-0.3**: Deterministic, factual
- **0.4-0.7**: Balanced
- **0.8-1.0**: Creative, diverse

## RAG Configuration

```python
rag_config = {
    "retrieval_k": 5,
    "score_threshold": 0.5,
    "search_mode": "semantic",  # or "keyword", "hybrid"
    "rerank": True,
    "metadata_filter": {
        "category": "technical"
    }
}
```

## CAG Configuration

```python
cag_config = {
    "allow_code_execution": True,
    "timeout_seconds": 30,
    "allowed_packages": ["numpy", "pandas", "requests"],
    "max_iterations": 5
}
```

## Streaming Configuration

```python
stream_config = {
    "stream": True,
    "chunk_size": 50,  # Characters per chunk
    "include_metadata": True
}
```

## Retry Configuration

```python
retry_config = {
    "max_retries": 3,
    "retry_delay": 1.0,  # Seconds
    "exponential_backoff": True
}
```

## Timeout Configuration

```python
timeout_config = {
    "request_timeout": 30,  # Seconds
    "read_timeout": 60,
    "connect_timeout": 10
}
```

## Environment Variables

```bash
# Core settings
ORCHESTRATAI_API_KEY=your_key
ORCHESTRATAI_BASE_URL=https://api.orchestratai.com/v1

# Optional settings
ORCHESTRATAI_TIMEOUT=30
ORCHESTRATAI_MAX_RETRIES=3
ORCHESTRATAI_LOG_LEVEL=INFO
```

## Client Initialization

```python
from orchestratai import OrchestratAI

client = OrchestratAI(
    api_key="your_key",
    base_url="https://api.orchestratai.com/v1",
    timeout=30,
    max_retries=3,
    default_config={
        "model": "gpt-4",
        "temperature": 0.7
    }
)
```

## Global Defaults

Set defaults for all requests:

```python
client.set_defaults({
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
})
```

Override per request:

```python
client.agents.execute(
    ...,
    config={"temperature": 0.9}  # Overrides default
)
```
