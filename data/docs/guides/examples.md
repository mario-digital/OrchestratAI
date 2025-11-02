# Code Examples

## Customer Support Bot

```python
def handle_support_query(query: str):
    response = client.agents.execute(
        agent_type="rag",
        query=query,
        config={
            "model": "gpt-4",
            "retrieval_k": 5,
            "metadata_filter": {"category": "support"}
        }
    )
    return response.result
```

## Data Analysis Agent

```python
def analyze_data(data: dict):
    response = client.agents.execute(
        agent_type="cag",
        query=f"Analyze this data: {data}",
        config={
            "model": "gpt-4",
            "allow_code_execution": True
        }
    )
    return response.result
```

## Document Summarization

```python
def summarize_document(doc_id: str):
    # Retrieve document
    docs = client.documents.retrieve(
        doc_id=doc_id,
        k=10
    )

    # Summarize
    response = client.agents.execute(
        agent_type="direct",
        query=f"Summarize: {docs}",
        config={"model": "gpt-4"}
    )
    return response.result
```

## Multi-Agent Workflow

```python
async def complex_workflow(query: str):
    # Step 1: RAG for context
    context = await client.agents.execute(
        agent_type="rag",
        query=query
    )

    # Step 2: CAG for computation
    result = await client.agents.execute(
        agent_type="cag",
        query=f"Using {context}, calculate..."
    )

    return result
```
