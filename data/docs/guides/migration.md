# Migration Guide

## From LangChain

### Old Code
```python
from langchain import OpenAI

llm = OpenAI()
result = llm("What is RAG?")
```

### New Code
```python
from orchestratai import OrchestratAI

client = OrchestratAI(api_key="...")
result = client.agents.execute(
    agent_type="direct",
    query="What is RAG?"
)
```

## From OpenAI SDK

### Old Code
```python
import openai

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "..."}]
)
```

### New Code
```python
from orchestratai import OrchestratAI

client = OrchestratAI(api_key="...")
response = client.agents.execute(
    agent_type="direct",
    query="...",
    config={"model": "gpt-4"}
)
```

## Migration Checklist

- [ ] Update dependencies
- [ ] Replace API calls
- [ ] Update error handling
- [ ] Test thoroughly
- [ ] Update documentation
- [ ] Deploy gradually
