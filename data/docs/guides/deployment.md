# Deployment Guide

## Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV ORCHESTRATAI_API_KEY=your_key

CMD ["python", "app.py"]
```

### Docker Compose

```yaml
version: '3.9'

services:
  app:
    build: .
    environment:
      - ORCHESTRATAI_API_KEY=${ORCHESTRATAI_API_KEY}
    ports:
      - "8000:8000"
```

## Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestratai-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orchestratai
  template:
    metadata:
      labels:
        app: orchestratai
    spec:
      containers:
      - name: app
        image: your-registry/app:latest
        env:
        - name: ORCHESTRATAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: orchestratai-secrets
              key: api-key
```

## Environment Variables

```bash
ORCHESTRATAI_API_KEY=your_key
ORCHESTRATAI_BASE_URL=https://api.orchestratai.com/v1
ORCHESTRATAI_TIMEOUT=30
ORCHESTRATAI_MAX_RETRIES=3
```

## Security Best Practices

1. Use secrets management (AWS Secrets Manager, HashiCorp Vault)
2. Rotate API keys regularly
3. Implement rate limiting
4. Use HTTPS for all communications
5. Monitor API usage

## Monitoring

```python
# Add monitoring middleware
import logging

logger = logging.getLogger("orchestratai")
logger.setLevel(logging.INFO)

# Log all API calls
client.add_middleware(LoggingMiddleware())
```

## Load Balancing

For high-traffic applications, use multiple workers:

```python
# Gunicorn with multiple workers
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## Caching

Implement caching for repeated queries:

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_query(query: str):
    return client.agents.execute(...)
```

## Health Checks

```python
@app.get("/health")
async def health_check():
    try:
        # Test API connection
        client.health.check()
        return {"status": "healthy"}
    except Exception:
        return {"status": "unhealthy"}, 503
```
