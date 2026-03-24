#!/bin/bash
# V.E.D.A. — Double-click to start
cd "$(dirname "$0")"
echo "Starting V.E.D.A...."
node serve.js &
sleep 2
xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null
echo "V.E.D.A. running at http://localhost:8080"
echo "Press Ctrl+C to stop"
wait
