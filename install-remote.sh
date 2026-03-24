#!/bin/bash
echo "=============================="
echo "  Installing V.E.D.A."
echo "  Vedic Education & Data Archive"
echo "=============================="
echo ""

INSTALL_DIR="$HOME/.veda"
REPO="https://github.com/juanmanuelferrera/veda"
TAG="v1.0.0"

mkdir -p "$INSTALL_DIR"

# Download binary
echo "  Downloading V.E.D.A...."
ARCH=$(uname -m)
OS=$(uname -s)

if [ "$OS" = "Linux" ]; then
    BIN_URL="$REPO/raw/main/veda-linux"
elif [ "$OS" = "Darwin" ] && [ "$ARCH" = "arm64" ]; then
    BIN_URL="$REPO/raw/main/veda-mac"
elif [ "$OS" = "Darwin" ]; then
    BIN_URL="$REPO/raw/main/veda-mac-intel"
else
    echo "  Unsupported OS. Use Windows installer."
    exit 1
fi

curl -sL "$BIN_URL" -o "$INSTALL_DIR/veda"
chmod +x "$INSTALL_DIR/veda"

# Download web files
echo "  Downloading web files..."
curl -sL "$REPO/archive/refs/heads/main.zip" -o /tmp/veda-repo.zip
cd /tmp && unzip -qo veda-repo.zip
rm -rf "$INSTALL_DIR/web"
cp -r /tmp/veda-main/web "$INSTALL_DIR/web"
rm -rf /tmp/veda-main /tmp/veda-repo.zip

# Download Vedabase index from GitHub release
echo "  Downloading Vedabase search index (~45MB compressed)..."
mkdir -p "$INSTALL_DIR/web/public"
curl -sL "$REPO/releases/download/$TAG/vedabase-index.json.gz" -o /tmp/vedabase-index.json.gz
gunzip -f /tmp/vedabase-index.json.gz
mv /tmp/vedabase-index.json "$INSTALL_DIR/web/public/"
echo "  Index downloaded."

# Create launcher
LAUNCHER="$INSTALL_DIR/start.sh"
cat > "$LAUNCHER" << 'LEOF'
#!/bin/bash
cp ~/.veda/veda /tmp/veda-run 2>/dev/null
chmod +x /tmp/veda-run
cd ~/.veda && /tmp/veda-run &
sleep 3
google-chrome --app=http://localhost:8080 2>/dev/null || \
chromium-browser --app=http://localhost:8080 2>/dev/null || \
xdg-open http://localhost:8080 2>/dev/null || \
open http://localhost:8080 2>/dev/null
wait
LEOF
chmod +x "$LAUNCHER"

# Create desktop shortcut (Linux)
if [ "$OS" = "Linux" ]; then
    mkdir -p "$HOME/Desktop" "$HOME/.local/share/applications" "$HOME/.config/autostart"
    cat > "$HOME/Desktop/VEDA.desktop" << DEOF
[Desktop Entry]
Type=Application
Name=V.E.D.A.
Comment=Vedic Education & Data Archive
Exec=bash $LAUNCHER
Icon=applications-education
Terminal=false
DEOF
    chmod +x "$HOME/Desktop/VEDA.desktop"
    cp "$HOME/Desktop/VEDA.desktop" "$HOME/.local/share/applications/"
    cp "$HOME/Desktop/VEDA.desktop" "$HOME/.config/autostart/"
fi

# Mac shortcut
if [ "$OS" = "Darwin" ]; then
    cp "$LAUNCHER" "$HOME/Desktop/VEDA.command"
    chmod +x "$HOME/Desktop/VEDA.command"
fi

echo ""
echo "=============================="
echo "  V.E.D.A. installed!"
echo ""
echo "  Run: bash $LAUNCHER"
echo ""
if [ "$OS" = "Linux" ]; then
    echo "  Desktop shortcut created"
    echo "  App menu: press Super key, type VEDA"
    echo "  Auto-starts on boot"
fi
echo "=============================="
