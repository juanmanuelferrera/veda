#!/bin/bash
echo "=============================="
echo "  Installing V.E.D.A."
echo "=============================="
DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/.veda"

mkdir -p "$INSTALL_DIR"
cp "$DIR/veda-linux" "$INSTALL_DIR/veda"
cp -r "$DIR/web" "$INSTALL_DIR/web"

mkdir -p "$HOME/.local/share/applications"
mkdir -p "$HOME/.config/autostart"
mkdir -p "$HOME/Desktop"

cat > "$HOME/Desktop/VEDA.desktop" << 'DEOF'
[Desktop Entry]
Type=Application
Name=V.E.D.A.
Comment=Vedic Education & Data Archive
Exec=bash -c 'cp ~/.veda/veda /tmp/veda; chmod +x /tmp/veda; cd ~/.veda && /tmp/veda & sleep 3; google-chrome --app=http://localhost:8080 2>/dev/null || chromium-browser --app=http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080'
Icon=applications-education
Terminal=false
DEOF

chmod +x "$HOME/Desktop/VEDA.desktop"
cp "$HOME/Desktop/VEDA.desktop" "$HOME/.local/share/applications/"
cp "$HOME/Desktop/VEDA.desktop" "$HOME/.config/autostart/"

echo ""
echo "  Installed to $INSTALL_DIR"
echo "  Shortcut on Desktop"
echo "  Added to app menu"
echo "  Auto-starts on boot"
echo "  You can remove the USB now."
echo "=============================="
