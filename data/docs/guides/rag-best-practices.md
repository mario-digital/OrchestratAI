# RAG Best Practices

## Document Preparation

### Chunk Size
- **Small chunks (256-512 tokens)**: Precise retrieval, more chunks
- **Large chunks (1024-2048 tokens)**: More context, fewer chunks
- **Recommended**: 512 tokens with 80 token overlap

### Metadata

Always include metadata for better filtering:

```python
document.metadata = {
    "source": "pricing-guide.pdf",
    "page": 5,
    "category": "billing",
    "last_updated": "2025-11-02"
}
```

## Retrieval Configuration

### Number of Results (k)
- **Small k (3-5)**: Precise, focused results
- **Large k (10-20)**: More context, potentially noisy

### Similarity Threshold
Filter results by similarity score:

```python
config = {
    "retrieval_k": 10,
    "score_threshold": 0.5  # Only include strong matches
}
```

## Query Optimization

### Good Queries
✅ "What are the refund terms for annual plans?"
✅ "How do I rotate API keys?"
✅ "Explain the rate limiting policy"

### Poor Queries
❌ "billing" (too vague)
❌ "tell me everything" (too broad)
❌ "stuff about keys" (unclear)

## Handling No Results

```python
response = client.agents.execute(
    agent_type="rag",
    query="...",
    config={
        "fallback_to_direct": True  # Use direct agent if no matches
    }
)
```

## Hybrid Search

Combine semantic and keyword search:

```python
config = {
    "search_mode": "hybrid",
    "semantic_weight": 0.7,
    "keyword_weight": 0.3
}
```

## Caching

Enable result caching for repeated queries:

```python
config = {
    "cache_ttl": 3600,  # Cache for 1 hour
    "cache_key": "pricing_faq"
}
```

## Performance Tips

1. **Pre-filter with metadata**: Use metadata filters before semantic search
2. **Batch document uploads**: Upload multiple documents in one request
3. **Monitor retrieval quality**: Track which queries return no results
4. **Update documents regularly**: Keep knowledge base fresh
5. **Use MMR for diversity**: Maximal Marginal Relevance reduces redundancy

## Common Pitfalls

❌ Not including enough context in chunks
❌ Ignoring metadata structure
❌ Using inappropriate chunk sizes
❌ Not monitoring retrieval quality
❌ Forgetting to update stale documents
