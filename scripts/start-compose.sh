#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENV_FILE="$ROOT_DIR/.env"

if ! command -v op >/dev/null 2>&1; then
  echo "[error] 1Password CLI 'op' not found. Install it from https://developer.1password.com/docs/cli/get-started/" >&2
  exit 1
fi

if ! op account list >/dev/null 2>&1; then
  echo "[error] You must sign in to 1Password CLI before running this script (op signin)." >&2
  exit 1
fi

echo "[info] Starting Docker Compose with secrets resolved via 1Password..."

OP_ARGS=("op" "run" "--env-file" "$ENV_FILE")
COMPOSE_ARGS=("docker" "compose" "up" "-d")

"${OP_ARGS[@]}" -- "${COMPOSE_ARGS[@]}"

echo "[info] Docker Compose services are starting. Use 'docker compose ps' to check status."
