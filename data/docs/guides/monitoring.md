# Monitoring and Observability

## Metrics to Track

### API Metrics
- Request count
- Error rate
- Latency (p50, p95, p99)
- Rate limit hits

### Agent Metrics
- Execution time
- Success rate
- Token usage
- Retrieval quality (for RAG)

## Logging

### Structured Logging

```python
import logging
import json

logger = logging.getLogger("orchestratai")

logger.info(json.dumps({
    "event": "agent_execution",
    "agent_type": "rag",
    "duration_ms": 1234,
    "status": "success"
}))
```

### Log Levels
- `DEBUG`: Detailed information
- `INFO`: General events
- `WARNING`: Unusual events
- `ERROR`: Error events
- `CRITICAL`: Critical failures

## Custom Metrics

```python
from prometheus_client import Counter, Histogram

request_counter = Counter(
    'orchestratai_requests_total',
    'Total requests'
)

latency_histogram = Histogram(
    'orchestratai_latency_seconds',
    'Request latency'
)
```

## Distributed Tracing

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("agent_execution"):
    response = client.agents.execute(...)
```

## Error Tracking

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your_sentry_dsn",
    traces_sample_rate=1.0
)

try:
    response = client.agents.execute(...)
except Exception as e:
    sentry_sdk.capture_exception(e)
```

## Dashboard Setup

### Grafana Dashboards

Track key metrics:
- Request rate
- Error rate
- Latency percentiles
- Token usage
- Cost tracking

### Alerts

Set up alerts for:
- Error rate > 5%
- p95 latency > 2 seconds
- Rate limit approaching
- Cost exceeding budget

## Performance Profiling

```python
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code
response = client.agents.execute(...)

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats()
```
