#!/bin/bash

ROOT="$HOME/Projects/player"
SERVICE="$ROOT/service"
AI="$ROOT/ai"

start_if_needed() {
    local port="$1"
    local label="$2"
    shift 2

    if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "$label is already running on port $port"
    else
        echo "Starting $label on port $port..."
        ( "$@" ) &
    fi
}

start_if_needed 8080 "Frontend" \
    python3 -m http.server 8080 --directory "$ROOT"

start_if_needed 3003 "Metadata proxy" \
    npm --prefix "$SERVICE" run start:proxy

start_if_needed 3002 "Stream server" \
    node "$SERVICE/stream-server.js"

start_if_needed 5001 "Python AI" \
    "$AI/venv/bin/python" "$AI/app.py"

echo ""
echo "Radio Lahze startup check complete."
echo "Open http://localhost:8080/ in Safari"
