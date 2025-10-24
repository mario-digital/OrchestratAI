#!/bin/bash

echo "🚀 Starting OrchestratAI API in development mode..."

# Set PYTHONPATH to include the current directory
export PYTHONPATH=.

# Run uvicorn with hot reload
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
