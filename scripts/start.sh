#!/bin/bash
# V.E.D.A. Start Script — runs on boot

set -e

echo "=============================="
echo "  V.E.D.A. Starting..."
echo "  Vedic Education & Data Archive"
echo "=============================="

cd /opt/veda

# Start Docker services
echo "Starting services..."
docker compose -f docker/docker-compose.yml up -d

# Wait for Ollama
echo "Waiting for Ollama..."
until curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; do
    sleep 2
done

# Pull models if not present
echo "Checking AI models..."
docker exec veda-ollama ollama pull llama3.1:8b 2>/dev/null || true
docker exec veda-ollama ollama pull nomic-embed-text 2>/dev/null || true

# Run ingestion if needed
echo "Checking Vedabase data..."
cd /opt/veda/scripts
node ingest.js

echo ""
echo "=============================="
echo "  V.E.D.A. is ready!"
echo "  Open http://localhost:8080"
echo "=============================="
