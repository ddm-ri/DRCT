#!/usr/bin/env bash
# Start the DRCT dev server and open the browser

PORT=8080
URL="http://localhost:${PORT}/"

# Kill any process already using the port
lsof -ti tcp:${PORT} | xargs kill -9 2>/dev/null || true

echo "Starting DRCT server at ${URL}"
node server.js &
SERVER_PID=$!

# Wait for the server to be ready
sleep 1

# Open browser (macOS / Linux)
if command -v open &>/dev/null; then
  open "${URL}"
elif command -v xdg-open &>/dev/null; then
  xdg-open "${URL}"
else
  echo "Open your browser at ${URL}"
fi

echo "Server PID: ${SERVER_PID} — press Ctrl+C to stop."
wait ${SERVER_PID}
