#!/bin/bash
echo "=============================="
echo "  Installing V.E.D.A."
echo "=============================="
DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/Applications/VEDA"

mkdir -p "$INSTALL_DIR"
if [ "$(uname -m)" = "arm64" ]; then
    cp "$DIR/veda-mac" "$INSTALL_DIR/veda"
else
    cp "$DIR/veda-mac-intel" "$INSTALL_DIR/veda" 2>/dev/null || cp "$DIR/veda-mac" "$INSTALL_DIR/veda"
fi
cp -r "$DIR/web" "$INSTALL_DIR/web"
chmod +x "$INSTALL_DIR/veda"

cat > "$INSTALL_DIR/VEDA.command" << LEOF
#!/bin/bash
cd "$INSTALL_DIR" && ./veda &
sleep 2
open -na "Google Chrome" --args --app=http://localhost:8080 2>/dev/null || open http://localhost:8080
wait
LEOF
chmod +x "$INSTALL_DIR/VEDA.command"
ln -sf "$INSTALL_DIR/VEDA.command" "$HOME/Desktop/VEDA"

echo ""
echo "  Installed to $INSTALL_DIR"
echo "  Shortcut on Desktop"
echo "  You can remove the USB now."
echo "=============================="
