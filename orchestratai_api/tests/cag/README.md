# CAG Agent Tests

This directory contains tests for the CAG (Cached-Augmented Generation) agent with Redis semantic caching.

## Test Files

### Unit Tests (Mock Redis)
- **test_redis_cache.py** - Tests for RedisSemanticCache class
  - Cosine similarity calculations
  - Cache hit/miss logic
  - Similarity threshold testing
  - Cache eviction (1000 item limit)
  - TTL settings

- **test_cag_agent.py** - Tests for CAGAgent class
  - Cache miss workflow (embedding → cache check → LLM → cache write)
  - Cache hit workflow (embedding → cache check → return cached)
  - Cache log emission
  - Metrics validation (cache_status, cost, tokens)

### Integration Tests (Real Redis Required)
- **test_cag_integration.py** - End-to-end tests with real Redis instance
  - Cache miss → cache hit flow
  - Semantic similarity matching
  - Cache eviction at 1000 items
  - TTL expiration
  - Latency requirements (<500ms for cache hits)

### Resilience Tests
- **test_cag_resilience.py** - Error handling and failure scenarios
  - Redis connection failures
  - Redis timeouts
  - Cache corruption handling
  - Cache write failures

## Running Tests

### Run All CAG Tests
```bash
cd orchestratai_api
uv run pytest tests/cag/ -v
```

### Run Only Unit Tests (No Redis Required)
```bash
uv run pytest tests/cag/test_redis_cache.py tests/cag/test_cag_agent.py -v
```

### Run Only Integration Tests (Requires Redis)
```bash
# Start Redis first (e.g., docker run -p 6379:6379 redis:7-alpine)
uv run pytest tests/cag/test_cag_integration.py -v -m integration
```

### Run Resilience Tests
```bash
uv run pytest tests/cag/test_cag_resilience.py -v
```

### Run with Coverage
```bash
uv run pytest tests/cag/ -v --cov=src/cache --cov=src/agents/workers/cag_agent --cov-report=term-missing
```

## Prerequisites

### For Unit Tests
- No external dependencies (uses mocks)

### For Integration Tests
- **Redis server running** on localhost:6379 (or set REDIS_HOST env var)
- **Note:** Integration tests will be **skipped automatically** if REDIS_HOST is not set
- Start Redis with Docker:
  ```bash
  docker run -d -p 6379:6379 --name redis-test redis:7-alpine
  ```
- In CI/CD: Integration tests are skipped unless Redis is configured

## Environment Variables

```bash
# Redis connection (for integration tests)
REDIS_HOST=localhost:6379

# 1Password integration (optional, falls back to .env)
USE_ONEPASSWORD=false
```

## Test Coverage Requirements

- **Minimum:** 90% coverage
- **Current:** 100% coverage on cache and agent modules (unit tests)

## Expected Test Results

### Unit Tests
- ✅ All unit tests should pass without Redis
- ✅ Fast execution (<5 seconds)

### Integration Tests
- ✅ Require Redis to be running
- ✅ Test real semantic caching behavior
- ✅ Verify <500ms latency for cache hits
- ⏱️ Slower execution (~10-20 seconds)

### Resilience Tests
- ✅ Document expected failure behaviors
- ⚠️ Some tests expect exceptions (current implementation)
- 📝 Include TODO comments for future enhancements

## Troubleshooting

### "Redis not available" - Integration Tests Skipped
- Ensure Redis is running on localhost:6379
- Check REDIS_HOST environment variable
- Try: `docker run -p 6379:6379 redis:7-alpine`

### Import Errors
- Ensure you're in the `orchestratai_api` directory
- Run `uv sync` to install dependencies

### Test Failures
- Check Redis is accessible: `redis-cli ping` (should return "PONG")
- Clear Redis cache: `redis-cli FLUSHDB`
- Check .env file has correct REDIS_HOST value
