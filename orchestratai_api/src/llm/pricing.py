"""Cost calculation helpers for LLM provider token usage."""


def dollar_cost(
    model_pricing: dict[str, float],
    *,
    tokens_prompt: int,
    tokens_completion: int,
) -> float:
    """Calculate dollar cost for an LLM call based on token usage.

    Pricing is per 1000 tokens. This function handles both regular completions
    and embeddings (which have completion = 0).

    Args:
        model_pricing: Dict with 'prompt' and 'completion' prices per 1K tokens
        tokens_prompt: Number of input/prompt tokens
        tokens_completion: Number of output/completion tokens (0 for embeddings)

    Returns:
        Total cost in dollars (e.g., 0.0001 for $0.0001)

    Examples:
        >>> pricing = {"prompt": 0.01, "completion": 0.03}  # GPT-4 Turbo
        >>> cost = dollar_cost(pricing, tokens_prompt=1000, tokens_completion=500)
        >>> assert cost == 0.025  # $0.01 + $0.015

        >>> embedding_pricing = {"prompt": 0.00013, "completion": 0.0}
        >>> cost = dollar_cost(embedding_pricing, tokens_prompt=1000, tokens_completion=0)
        >>> assert cost == 0.00013  # Only prompt cost
    """
    prompt_cost = (tokens_prompt / 1000) * model_pricing["prompt"]
    completion_cost = (tokens_completion / 1000) * model_pricing.get("completion", 0.0)

    return prompt_cost + completion_cost


def format_cost(cost: float) -> str:
    """Format a dollar cost for human-readable display.

    Args:
        cost: Cost in dollars (e.g., 0.0001)

    Returns:
        Formatted string with dollar sign and appropriate precision

    Examples:
        >>> format_cost(0.0001)
        '$0.0001'
        >>> format_cost(0.15)
        '$0.15'
        >>> format_cost(1.5)
        '$1.50'
    """
    if cost == 0.0:
        # Special case for zero cost
        return "$0.00"
    elif cost < 0.001:
        # Show 4 decimal places for very small costs
        return f"${cost:.4f}"
    elif cost < 1.0:
        # Show 2-4 decimal places for costs under $1
        return f"${cost:.4f}".rstrip("0").rstrip(".")
    else:
        # Show 2 decimal places for costs $1 and above
        return f"${cost:.2f}"
