# API Endpoints

## Base URL

```
https://api.orchestratai.com/v1
```

## Core Endpoints

### Create Agent Execution

```
POST /agents/execute
```

Request body:
```json
{
  "agent_type": "rag",
  "query": "What is RAG?",
  "config": {
    "model": "gpt-4",
    "temperature": 0.7
  }
}
```

### List Agent Types

```
GET /agents/types
```

### Stream Agent Response

```
POST /agents/stream
```

Returns SSE stream.

### Get Execution Status

```
GET /executions/{execution_id}
```

### List Executions

```
GET /executions
```

Query parameters:
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset
- `status`: Filter by status

## Document Management

### Upload Document

```
POST /documents
```

### List Documents

```
GET /documents
```

### Delete Document

```
DELETE /documents/{document_id}
```

## Health Check

```
GET /health
```

Returns service status.

## Rate Limiting

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp
