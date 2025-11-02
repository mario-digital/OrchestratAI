# Troubleshooting FAQ

## Why am I getting a 401 Unauthorized error?

Check that your API key is correct and hasn't expired. Keys should be passed in the Authorization header.

## My requests are timing out. What should I do?

Increase your timeout settings. Complex queries may take up to 30 seconds.

## How do I handle rate limits?

Implement exponential backoff. Rate limit headers tell you when to retry.

## What does error code 429 mean?

You've exceeded your rate limit. Wait before making additional requests.

## Can I test in a sandbox environment?

Yes, use the `test_` prefix on your API key to use sandbox mode.

## Where can I find error code documentation?

See our API reference for a complete list of error codes and solutions.
