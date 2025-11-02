# API Authentication

## API Keys

All API requests require authentication using API keys.

### Getting Your API Key

1. Log in to your dashboard
2. Navigate to Settings > API Keys
3. Click "Create New Key"
4. Copy and store securely

### Using API Keys

Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.orchestratai.com/v1/agents
```

## Key Types

### Production Keys
- Format: `sk_live_...`
- Access to production environment
- Rate limits apply

### Test Keys
- Format: `sk_test_...`
- Access to sandbox environment
- No charges incurred

## Security Best Practices

1. Never commit keys to version control
2. Rotate keys every 90 days
3. Use environment variables
4. Implement key rotation procedures
5. Monitor key usage for anomalies

## Key Rotation

```python
# Example: Rotating API keys
client = OrchestratAI(api_key=os.environ["NEW_API_KEY"])
```

## Revoking Keys

Revoke compromised keys immediately:
1. Go to Settings > API Keys
2. Click "Revoke" next to the key
3. Update applications with new key

## Rate Limits

Keys are subject to rate limits based on your plan:
- Free: 10 requests/minute
- Pro: 100 requests/minute
- Enterprise: Custom limits
