#!/bin/bash
# V.E.D.A. — Double-click to start
cd "$(dirname "$0")/web/public"
echo "=============================="
echo "  V.E.D.A."
echo "  Vedic Education & Data Archive"
echo "=============================="
echo ""
echo "  Opening http://localhost:8080"
echo "  Press Ctrl+C to stop"
echo ""

# Open browser after 1 second
(sleep 1 && (xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null)) &

# Start server — Python is available on every OS
python3 -m http.server 8080 2>/dev/null || python -m http.server 8080 2>/dev/null || python -m SimpleHTTPServer 8080
