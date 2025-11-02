# Architecture Patterns

## Microservices Pattern

```python
# Service 1: Document Service
class DocumentService:
    def upload(self, file):
        return client.documents.upload(file)

# Service 2: Query Service
class QueryService:
    def execute(self, query):
        return client.agents.execute(
            agent_type="rag",
            query=query
        )
```

## Event-Driven Architecture

```python
# Publisher
def publish_event(event_type, data):
    webhook.send(event_type, data)

# Subscriber
@app.webhook("/events")
def handle_event(event):
    if event.type == "agent.completed":
        process_result(event.data)
```

## Layered Architecture

- **Presentation Layer**: UI/API
- **Business Logic**: Agent orchestration
- **Data Layer**: Vector store

## CQRS Pattern

Separate read and write operations:
```python
# Command
def create_execution(query):
    return client.agents.execute(...)

# Query
def get_execution(id):
    return client.executions.get(id)
```
