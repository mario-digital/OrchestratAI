# Webhooks

## Overview

Webhooks allow you to receive real-time notifications about events in your OrchestratAI account.

## Setting Up Webhooks

1. Navigate to Settings > Webhooks
2. Click "Add Webhook"
3. Enter your endpoint URL
4. Select events to subscribe to
5. Save configuration

## Webhook Events

### Agent Events
- `agent.execution.started`
- `agent.execution.completed`
- `agent.execution.failed`

### Document Events
- `document.uploaded`
- `document.processed`
- `document.deleted`

### Account Events
- `account.limit.warning`
- `account.limit.exceeded`

## Webhook Payload

```json
{
  "event": "agent.execution.completed",
  "timestamp": "2025-11-02T20:30:00Z",
  "data": {
    "execution_id": "exec_123",
    "agent_type": "rag",
    "status": "completed",
    "duration_ms": 1234
  }
}
```

## Security

### Signature Verification

Verify webhook signatures to ensure authenticity:

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    computed = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed, signature)
```

### Headers
- `X-Webhook-Signature`: HMAC SHA256 signature
- `X-Webhook-Event`: Event type
- `X-Webhook-ID`: Unique webhook delivery ID

## Retry Policy

Failed deliveries are retried with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 minute
- Attempt 3: 5 minutes
- Attempt 4: 15 minutes
- Attempt 5: 1 hour

After 5 failed attempts, delivery is abandoned.

## Testing Webhooks

Use the webhook tester in your dashboard to send test events.
