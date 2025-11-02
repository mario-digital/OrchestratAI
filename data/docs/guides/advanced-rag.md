# Advanced RAG Techniques

## Query Rewriting

Improve retrieval by rewriting queries:
```python
def rewrite_query(original):
    rewritten = client.agents.execute(
        agent_type="direct",
        query=f"Rewrite for search: {original}",
        config={"model": "gpt-3.5"}
    )
    return rewritten.result
```

## Hypothetical Document Embeddings (HyDE)

Generate hypothetical answer, then search:
```python
def hyde_search(query):
    # Generate hypothetical answer
    hypo = generate_hypothetical_answer(query)
    # Search using hypothetical answer
    return search_with_embedding(hypo)
```

## Multi-Query Retrieval

Use multiple query variations:
```python
def multi_query(original):
    variations = generate_variations(original)
    results = []
    for var in variations:
        results.extend(retrieve(var))
    return deduplicate(results)
```

## Reranking

Rerank results for relevance:
```python
def rerank(query, docs):
    scores = model.predict(
        [(query, doc) for doc in docs]
    )
    return sorted(zip(docs, scores),
                  key=lambda x: x[1],
                  reverse=True)
```

## Contextual Compression

Compress retrieved context:
```python
def compress_context(docs):
    return extract_relevant_parts(docs)
```

## Parent Document Retrieval

Retrieve small chunks, return full documents.
