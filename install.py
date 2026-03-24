#!/usr/bin/env python3
"""V.E.D.A. Installer — works on any Linux/Mac"""
import os, shutil, sys, platform

home = os.path.expanduser("~")
src = os.path.dirname(os.path.abspath(__file__))
dest = os.path.join(home, ".veda")

print("==============================")
print("  Installing V.E.D.A.")
print("==============================")
print()

# Copy files
os.makedirs(dest, exist_ok=True)

system = platform.system()
machine = platform.machine()

if system == "Linux":
    binary = os.path.join(src, "veda-linux")
elif system == "Darwin" and machine == "arm64":
    binary = os.path.join(src, "veda-mac")
elif system == "Darwin":
    binary = os.path.join(src, "veda-mac-intel")
else:
    print("  Use INSTALL ON WINDOWS.bat for Windows")
    sys.exit(1)

print("  Copying binary...")
shutil.copy2(binary, os.path.join(dest, "veda"))

print("  Copying web files...")
web_dest = os.path.join(dest, "web")
if os.path.exists(web_dest):
    shutil.rmtree(web_dest)
shutil.copytree(os.path.join(src, "web"), web_dest)

# Make executable
os.chmod(os.path.join(dest, "veda"), 0o755)

# Create launcher script
launcher = os.path.join(dest, "start.sh")
with open(launcher, "w") as f:
    f.write("#!/bin/bash\n")
    f.write("cp ~/.veda/veda /tmp/veda-run && chmod +x /tmp/veda-run\n")
    f.write("cd ~/.veda && /tmp/veda-run &\n")
    f.write("sleep 3\n")
    f.write('google-chrome --app=http://localhost:8080 2>/dev/null || ')
    f.write('chromium-browser --app=http://localhost:8080 2>/dev/null || ')
    f.write('xdg-open http://localhost:8080 2>/dev/null || ')
    f.write('open http://localhost:8080 2>/dev/null\n')
    f.write("wait\n")
os.chmod(launcher, 0o755)

if system == "Linux":
    # Desktop shortcut
    desktop_dir = os.path.join(home, "Desktop")
    os.makedirs(desktop_dir, exist_ok=True)
    desktop_file = os.path.join(desktop_dir, "VEDA.desktop")
    with open(desktop_file, "w") as f:
        f.write("[Desktop Entry]\n")
        f.write("Type=Application\n")
        f.write("Name=V.E.D.A.\n")
        f.write("Comment=Vedic Education & Data Archive\n")
        f.write(f"Exec=bash {launcher}\n")
        f.write("Icon=applications-education\n")
        f.write("Terminal=false\n")
    os.chmod(desktop_file, 0o755)

    # App menu
    apps_dir = os.path.join(home, ".local", "share", "applications")
    os.makedirs(apps_dir, exist_ok=True)
    shutil.copy2(desktop_file, apps_dir)

    # Autostart
    autostart_dir = os.path.join(home, ".config", "autostart")
    os.makedirs(autostart_dir, exist_ok=True)
    shutil.copy2(desktop_file, autostart_dir)

elif system == "Darwin":
    # Mac Desktop shortcut
    mac_launcher = os.path.join(home, "Desktop", "VEDA.command")
    shutil.copy2(launcher, mac_launcher)

print()
print(f"  Installed to {dest}")
print("  Shortcut on Desktop")
if system == "Linux":
    print("  Added to app menu (Super key > VEDA)")
    print("  Auto-starts on boot")
print("  You can remove the USB now.")
print("==============================")
