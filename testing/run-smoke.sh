#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="$ROOT_DIR/testing"
PORT="${SMOKE_PORT:-4173}"
HOST="127.0.0.1"
NODE_BIN="${NODE_BIN:-node}"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "Node.js is required to run smoke tests." >&2
  exit 1
fi

if [ ! -d "$TEST_DIR/node_modules/playwright" ]; then
  echo "Missing testing dependencies. Install with: (cd testing && npm install)" >&2
  exit 1
fi

"$NODE_BIN" "$TEST_DIR/static-server.mjs" --host="$HOST" --port="$PORT" --root="$ROOT_DIR" >/tmp/mental-maths-smoke-server.log 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

sleep 0.5

cd "$TEST_DIR"
SMOKE_BASE_URL="http://$HOST:$PORT" "$NODE_BIN" smoke.mjs
