#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" && ./veda-mac &
sleep 2
open -na "Google Chrome" --args --app=http://localhost:8080 2>/dev/null || open http://localhost:8080
wait
