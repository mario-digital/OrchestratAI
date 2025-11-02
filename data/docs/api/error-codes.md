# API Error Codes

## HTTP Status Codes

### 2xx Success
- `200 OK`: Request succeeded
- `201 Created`: Resource created
- `204 No Content`: Success with no response body

### 4xx Client Errors
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Valid key but insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Valid format but semantic errors
- `429 Too Many Requests`: Rate limit exceeded

### 5xx Server Errors
- `500 Internal Server Error`: Server error occurred
- `502 Bad Gateway`: Upstream service unavailable
- `503 Service Unavailable`: Temporary service outage
- `504 Gateway Timeout`: Request timeout

## Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required field: agent_type",
    "details": {
      "field": "agent_type",
      "reason": "required"
    }
  }
}
```

## Error Codes

### Authentication Errors
- `invalid_api_key`: API key is invalid
- `expired_api_key`: API key has expired
- `missing_api_key`: No API key provided

### Request Errors
- `invalid_request`: Malformed request
- `invalid_parameter`: Parameter validation failed
- `missing_parameter`: Required parameter missing

### Rate Limiting
- `rate_limit_exceeded`: Too many requests

### Resource Errors
- `resource_not_found`: Requested resource doesn't exist
- `resource_conflict`: Resource already exists

### Processing Errors
- `processing_error`: Error during request processing
- `timeout_error`: Request processing timeout

## Handling Errors

```python
try:
    response = client.agents.execute(...)
except OrchestratAIError as e:
    print(f"Error: {e.code} - {e.message}")
```
