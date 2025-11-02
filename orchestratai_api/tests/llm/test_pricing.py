"""Tests for cost calculation helpers."""

import pytest

from src.llm.pricing import dollar_cost, format_cost


class TestDollarCost:
    """Test token-to-dollar cost calculations."""

    def test_basic_cost_calculation(self):
        """Should calculate cost correctly for prompt + completion."""
        pricing = {"prompt": 0.01, "completion": 0.03}  # GPT-4 Turbo per 1K
        cost = dollar_cost(
            pricing,
            tokens_prompt=1000,
            tokens_completion=500,
        )
        # (1000/1000 * 0.01) + (500/1000 * 0.03) = 0.01 + 0.015 = 0.025
        assert cost == 0.025

    def test_embedding_cost_zero_completion(self):
        """Should handle embeddings with zero completion tokens."""
        pricing = {"prompt": 0.00013, "completion": 0.0}
        cost = dollar_cost(
            pricing,
            tokens_prompt=1000,
            tokens_completion=0,
        )
        # Only prompt cost: 1000/1000 * 0.00013 = 0.00013
        assert cost == 0.00013

    def test_large_token_counts(self):
        """Should handle large token counts accurately."""
        pricing = {"prompt": 0.003, "completion": 0.015}  # Claude Sonnet
        cost = dollar_cost(
            pricing,
            tokens_prompt=100000,
            tokens_completion=50000,
        )
        # (100000/1000 * 0.003) + (50000/1000 * 0.015) = 0.3 + 0.75 = 1.05
        assert cost == 1.05

    def test_zero_tokens(self):
        """Should return zero cost for zero tokens."""
        pricing = {"prompt": 0.01, "completion": 0.03}
        cost = dollar_cost(
            pricing,
            tokens_prompt=0,
            tokens_completion=0,
        )
        assert cost == 0.0

    def test_missing_completion_price(self):
        """Should handle missing completion price gracefully."""
        pricing = {"prompt": 0.00013}  # No completion key
        cost = dollar_cost(
            pricing,
            tokens_prompt=1000,
            tokens_completion=500,
        )
        # Only prompt cost: 1000/1000 * 0.00013 = 0.00013
        assert cost == 0.00013

    def test_haiku_pricing(self):
        """Should calculate Claude Haiku cost correctly."""
        pricing = {"prompt": 0.00025, "completion": 0.00125}
        cost = dollar_cost(
            pricing,
            tokens_prompt=10000,
            tokens_completion=5000,
        )
        # (10000/1000 * 0.00025) + (5000/1000 * 0.00125) = 0.0025 + 0.00625
        assert cost == pytest.approx(0.00875)


class TestFormatCost:
    """Test cost formatting for display."""

    def test_format_very_small_cost(self):
        """Should show 4 decimals for very small costs."""
        assert format_cost(0.0001) == "$0.0001"
        assert format_cost(0.00025) == "$0.0003"  # Rounded

    def test_format_small_cost(self):
        """Should format costs under $1 appropriately."""
        assert format_cost(0.025) == "$0.025"
        assert format_cost(0.5) == "$0.5"

    def test_format_large_cost(self):
        """Should show 2 decimals for costs $1 and above."""
        assert format_cost(1.5) == "$1.50"
        assert format_cost(100.0) == "$100.00"

    def test_format_zero_cost(self):
        """Should format zero cost."""
        assert format_cost(0.0) == "$0.00"
