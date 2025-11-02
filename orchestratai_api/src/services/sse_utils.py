"""
Server-Sent Events (SSE) Utility Functions

Provides utility functions for formatting Server-Sent Events (SSE) according
to the W3C EventSource specification.
"""

import json
from typing import Any


def create_sse_event(event: str, data: dict[str, Any]) -> str:
    """
    Create a Server-Sent Event formatted string.

    Server-Sent Events follow the W3C EventSource specification format:
    - Each event starts with "event: {type}\\n"
    - Data line: "data: {json_string}\\n"
    - Empty line "\\n" marks end of event

    Args:
        event: Event type (e.g., 'message_chunk', 'agent_status', 'done')
        data: Event data dictionary (will be JSON serialized)

    Returns:
        SSE formatted string: "event: {type}\\ndata: {json}\\n\\n"

    Example:
        >>> create_sse_event("message_chunk", {"content": "Hello"})
        'event: message_chunk\\ndata: {"content": "Hello"}\\n\\n'

        >>> create_sse_event("done", {"session_id": "123"})
        'event: done\\ndata: {"session_id": "123"}\\n\\n'
    """
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
