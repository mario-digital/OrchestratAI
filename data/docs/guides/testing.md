# Testing Guide

## Unit Testing

```python
import unittest
from orchestratai import OrchestratAI

class TestOrchestratAI(unittest.TestCase):
    def setUp(self):
        self.client = OrchestratAI(api_key="test_key")

    def test_rag_agent(self):
        response = self.client.agents.execute(
            agent_type="rag",
            query="test query"
        )
        self.assertIsNotNone(response.result)
```

## Mocking

```python
from unittest.mock import Mock, patch

@patch('orchestratai.client.OrchestratAI')
def test_with_mock(mock_client):
    mock_client.agents.execute.return_value = Mock(
        result="mocked response"
    )
    # Test your code
```

## Integration Testing

```python
@pytest.mark.integration
def test_end_to_end():
    client = OrchestratAI(api_key=os.environ["TEST_API_KEY"])
    response = client.agents.execute(
        agent_type="rag",
        query="What is RAG?"
    )
    assert len(response.result) > 0
```

## Test Environment

Use test API keys for testing:
```python
ORCHESTRATAI_API_KEY=sk_test_...
```
