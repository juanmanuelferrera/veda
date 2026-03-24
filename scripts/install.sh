#!/bin/bash
# V.E.D.A. Installation Script
# Installs on a fresh Ubuntu 22.04+ system

set -e

echo "=============================="
echo "  V.E.D.A. Installer"
echo "  Vedic Education & Data Archive"
echo "=============================="

# Check root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root: sudo bash install.sh"
    exit 1
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# Install Node.js 22
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

# Create app directory
echo "Setting up V.E.D.A...."
mkdir -p /opt/veda
cp -r . /opt/veda/

# Install web dependencies
cd /opt/veda/web
npm install --production

# Install script dependencies
cd /opt/veda/scripts
npm install @qdrant/js-client-rest

# Pull Docker images
echo "Pulling Docker images (this may take a while)..."
cd /opt/veda
docker compose -f docker/docker-compose.yml pull

# Build web container
docker compose -f docker/docker-compose.yml build web

# Create systemd service for auto-start
cat > /etc/systemd/system/veda.service << 'EOF'
[Unit]
Description=V.E.D.A. - Vedic Education & Data Archive
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash /opt/veda/scripts/start.sh
ExecStop=/usr/bin/docker compose -f /opt/veda/docker/docker-compose.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable veda.service

echo ""
echo "=============================="
echo "  V.E.D.A. installed!"
echo "  Run: sudo systemctl start veda"
echo "  Then open http://localhost:8080"
echo "=============================="
