# API Filtering

## Query Parameters

Filter results using query parameters:

```
GET /executions?status=completed&agent_type=rag
```

## Supported Operators

- `eq`: Equals
- `ne`: Not equals
- `gt`: Greater than
- `lt`: Less than
- `in`: In list
- `contains`: Contains string

## Date Filtering

```
GET /executions?created_after=2025-01-01&created_before=2025-12-31
```

## Complex Filters

Use JSON filter syntax for complex queries:

```json
{
  "filter": {
    "and": [
      {"status": "completed"},
      {"duration_ms": {"gt": 1000}}
    ]
  }
}
```
