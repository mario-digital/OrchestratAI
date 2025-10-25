# 5. API Specification

Complete OpenAPI 3.0 specification for OrchestratAI REST API.

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: OrchestratAI API
  version: 1.0.0
  description: |
    Backend API for OrchestratAI multi-agent customer service system.

    Features:
    - Multi-agent chat orchestration
    - Real-time retrieval logging
    - Session management with Redis
    - Type-safe contracts validated with Pydantic

servers:
  - url: http://localhost:8000
    description: Local development
  - url: https://orchestratai-api.railway.app
    description: Production (Railway)

paths:
  /api/health:
    get:
      summary: Health check
      tags: [health]
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [healthy]
                  version:
                    type: string
                  timestamp:
                    type: string
                    format: date-time

  /api/chat:
    post:
      summary: Send chat message
      tags: [chat]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/session:
    post:
      summary: Create new session
      tags: [session]
      responses:
        '201':
          description: Session created
          content:
            application/json:
              schema:
                type: object
                properties:
                  session_id:
                    type: string
                    format: uuid
                  created_at:
                    type: string
                    format: date-time

components:
  schemas:
    ChatRequest:
      type: object
      required:
        - message
        - session_id
      properties:
        message:
          type: string
          minLength: 1
          maxLength: 2000
        session_id:
          type: string
          format: uuid

    ChatResponse:
      type: object
      required:
        - message
        - agent
        - confidence
        - logs
        - metrics
      properties:
        message:
          type: string
        agent:
          $ref: '#/components/schemas/AgentId'
        confidence:
          type: number
          minimum: 0.0
          maximum: 1.0
        logs:
          type: array
          items:
            $ref: '#/components/schemas/RetrievalLog'
        metrics:
          $ref: '#/components/schemas/ChatMetrics'

    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

    AgentId:
      type: string
      enum: [orchestrator, billing, technical, policy]

    LogType:
      type: string
      enum: [routing, vector_search, cache, documents]

    LogStatus:
      type: string
      enum: [success, warning, error]
```

---
