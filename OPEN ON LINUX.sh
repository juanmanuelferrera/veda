#!/bin/bash
echo "=============================="
echo "  V.E.D.A."
echo "=============================="
DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$DIR/veda-linux" /tmp/veda-linux
chmod +x /tmp/veda-linux
cd "$DIR" && /tmp/veda-linux &
sleep 3
google-chrome --app=http://localhost:8080 2>/dev/null || chromium-browser --app=http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080
echo "  Press Ctrl+C to stop"
wait
