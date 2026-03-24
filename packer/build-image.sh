#!/bin/bash
# Build a bootable Ubuntu image with V.E.D.A. pre-installed
# This runs inside GitHub Actions (Ubuntu runner)

set -e

IMAGE="veda.img"
IMAGE_SIZE="15G"
MOUNT="/mnt/veda"

echo "=== Building V.E.D.A. Bootable Image ==="

# Create image file
echo "Creating ${IMAGE_SIZE} image..."
fallocate -l ${IMAGE_SIZE} ${IMAGE}

# Partition: EFI (512MB) + root (rest)
parted ${IMAGE} --script mklabel gpt
parted ${IMAGE} --script mkpart EFI fat32 1MiB 513MiB
parted ${IMAGE} --script set 1 esp on
parted ${IMAGE} --script mkpart root ext4 513MiB 100%

# Setup loop device
LOOP=$(sudo losetup --find --show --partscan ${IMAGE})
echo "Loop device: ${LOOP}"

# Format partitions
sudo mkfs.fat -F32 ${LOOP}p1
sudo mkfs.ext4 -L veda-root ${LOOP}p2

# Mount
sudo mkdir -p ${MOUNT}
sudo mount ${LOOP}p2 ${MOUNT}
sudo mkdir -p ${MOUNT}/boot/efi
sudo mount ${LOOP}p1 ${MOUNT}/boot/efi

# Bootstrap Ubuntu 22.04 minimal
echo "Bootstrapping Ubuntu..."
sudo debootstrap --arch=amd64 jammy ${MOUNT} http://archive.ubuntu.com/ubuntu

# Mount system dirs for chroot
sudo mount --bind /dev ${MOUNT}/dev
sudo mount --bind /proc ${MOUNT}/proc
sudo mount --bind /sys ${MOUNT}/sys

# Copy V.E.D.A. files
echo "Copying V.E.D.A. files..."
sudo mkdir -p ${MOUNT}/opt/veda
sudo cp -r docker web scripts data ${MOUNT}/opt/veda/ 2>/dev/null || true
sudo cp -r docker web scripts ${MOUNT}/opt/veda/

# Configure inside chroot
echo "Configuring system..."
sudo chroot ${MOUNT} /bin/bash << 'CHROOT'
set -e

# Set hostname
echo "veda" > /etc/hostname

# Configure apt sources
cat > /etc/apt/sources.list << 'APT'
deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-security main restricted universe multiverse
APT

apt-get update

# Install essentials
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    linux-image-generic grub-efi-amd64 \
    systemd systemd-sysv \
    docker.io docker-compose-v2 \
    nodejs npm curl wget \
    network-manager openssh-server \
    --no-install-recommends

# Install GRUB
grub-install --target=x86_64-efi --efi-directory=/boot/efi --removable --no-nvram
update-grub

# Enable services
systemctl enable docker
systemctl enable NetworkManager
systemctl enable ssh

# Install V.E.D.A. dependencies
cd /opt/veda/web && npm install --production
cd /opt/veda/scripts && npm install @qdrant/js-client-rest

# Create V.E.D.A. systemd service
cat > /etc/systemd/system/veda.service << 'SVC'
[Unit]
Description=V.E.D.A. - Vedic Education & Data Archive
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash /opt/veda/scripts/start.sh
ExecStop=/usr/bin/docker compose -f /opt/veda/docker/docker-compose.yml down
TimeoutStartSec=600

[Install]
WantedBy=multi-user.target
SVC

systemctl enable veda.service

# Create user
useradd -m -s /bin/bash -G docker veda
echo "veda:veda" | chpasswd

# Auto-login to console
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/override.conf << 'GETTY'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin veda --noclear %I $TERM
GETTY

# Show URL on login
cat > /home/veda/.bash_profile << 'PROFILE'
echo ""
echo "=============================="
echo "  V.E.D.A."
echo "  Vedic Education & Data Archive"
echo ""
IP=$(hostname -I | awk '{print $1}')
echo "  Open in browser:"
echo "  http://${IP}:8080"
echo "=============================="
echo ""
PROFILE

# Clean up
apt-get clean
rm -rf /var/lib/apt/lists/*

CHROOT

# Unmount
echo "Cleaning up..."
sudo umount ${MOUNT}/dev ${MOUNT}/proc ${MOUNT}/sys
sudo umount ${MOUNT}/boot/efi
sudo umount ${MOUNT}
sudo losetup -d ${LOOP}

echo ""
echo "=== Image built: ${IMAGE} ==="
ls -lh ${IMAGE}
