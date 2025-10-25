# 17. Error Handling Strategy

## 17.1 Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

---

## 17.2 Frontend Error Handling

```typescript
export class APIError extends Error {
  get userMessage(): string {
    switch (this.statusCode) {
      case 400: return 'Invalid request';
      case 500: return 'Server error. Please retry.';
      default: return 'Unexpected error';
    }
  }

  get shouldRetry(): boolean {
    return this.statusCode >= 500;
  }
}
```

---

## 17.3 Backend Error Handling

```python
# middleware/error_handler.py
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )
```

---
