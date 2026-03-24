#!/bin/bash
# V.E.D.A. — Auto-detect OS and run
cd "$(dirname "$0")"

case "$(uname -s)" in
    Linux*)  ./veda-linux ;;
    Darwin*)
        if [ "$(uname -m)" = "arm64" ]; then
            ./veda-mac
        else
            ./veda-mac-intel
        fi
        ;;
    *)       echo "Use veda.exe on Windows" ;;
esac
