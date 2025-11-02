# Batch Operations

## Batch Document Upload

Upload multiple documents in one request:

```python
client.documents.upload_batch([
    {"file": file1, "metadata": {...}},
    {"file": file2, "metadata": {...}},
])
```

## Batch Execution

Execute multiple agent queries:

```python
client.agents.execute_batch([
    {"agent_type": "rag", "query": "..."},
    {"agent_type": "cag", "query": "..."},
])
```

## Batch Limits

- Maximum 100 operations per batch
- Total payload size: 10MB
- Timeout: 60 seconds

## Error Handling

Batch operations return partial results:

```json
{
  "results": [...],
  "errors": [
    {"index": 2, "error": "..."}
  ]
}
```
