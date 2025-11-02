# JavaScript/TypeScript SDK Guide

## Installation

```bash
npm install @orchestratai/sdk
```

## Initialization

```typescript
import { OrchestratAI } from '@orchestratai/sdk';

const client = new OrchestratAI({
  apiKey: process.env.ORCHESTRATAI_API_KEY
});
```

## Basic Usage

```typescript
const response = await client.agents.execute({
  agentType: 'rag',
  query: 'What is RAG?',
  config: {
    model: 'gpt-4',
    temperature: 0.7
  }
});

console.log(response.result);
```

## Streaming

```typescript
const stream = await client.agents.stream({
  agentType: 'rag',
  query: 'Explain vector databases'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

## Error Handling

```typescript
try {
  const response = await client.agents.execute({...});
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  }
}
```

## TypeScript Types

```typescript
import { AgentType, AgentConfig, AgentResponse } from '@orchestratai/sdk';

const config: AgentConfig = {
  model: 'gpt-4',
  temperature: 0.7
};

const response: AgentResponse = await client.agents.execute({
  agentType: AgentType.RAG,
  query: '...',
  config
});
```

## React Integration

```tsx
import { useOrchestratAI } from '@orchestratai/react';

function MyComponent() {
  const { execute, loading, error } = useOrchestratAI();

  const handleSubmit = async () => {
    const result = await execute({
      agentType: 'rag',
      query: 'What is RAG?'
    });
  };

  return <div>{/* UI */}</div>;
}
```
