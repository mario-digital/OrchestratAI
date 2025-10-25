# 15. Testing Strategy

## 15.1 Test Pyramid

```
     E2E (10%)
    Integration (20%)
   Unit Tests (70%)
```

---

## 15.2 Test Examples

**Frontend Component Test:**
```typescript
describe('MessageBubble', () => {
  it('renders user messages', () => {
    const message = {
      role: MessageRole.USER,
      content: 'Hello',
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Backend API Test:**
```python
async def test_chat_endpoint():
    async with AsyncClient(app=app) as client:
        response = await client.post("/api/chat", json={
            "message": "test",
            "session_id": "550e8400-..."
        })
    assert response.status_code == 200
```

---
