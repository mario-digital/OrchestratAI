# 8. Database Schema

## 8.1 MVP Approach: Redis-Only

OrchestratAI MVP uses **Redis exclusively** for session storage. No PostgreSQL needed yet.

**Redis Session Storage:**

```redis
# Key: session:{uuid}
# Type: Hash
# TTL: 86400 seconds (24 hours)

HSET session:550e8400-...
  id "550e8400-..."
  start_time "2025-10-24T14:30:00Z"
  total_tokens "1243"
  total_cost "0.0034"
  message_count "2"
```

---

## 8.2 Future PostgreSQL Schema (Phase 4+)

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0.0,
    message_count INTEGER DEFAULT 0
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    agent VARCHAR(50),
    confidence DECIMAL(3, 2),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE retrieval_logs (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    message_id UUID REFERENCES messages(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL
);
```

---
