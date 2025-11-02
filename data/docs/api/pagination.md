# API Pagination

## List Endpoints

All list endpoints support pagination using `limit` and `offset`:

```
GET /executions?limit=20&offset=40
```

## Response Format

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "has_more": true
  }
}
```

## Cursor-Based Pagination

For large datasets, use cursor-based pagination:

```
GET /executions?limit=20&cursor=abc123
```

## Best Practices

- Use reasonable page sizes (20-100)
- Cache results when possible
- Handle pagination links from response headers
