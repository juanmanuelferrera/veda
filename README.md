# V.E.D.A.

**Vedic Education & Data Archive**

Offline search over Srila Prabhupada's complete works. Plug a USB into any computer, run, and search — no internet needed for search. Optional AI answers with your own API key (needs internet).

## What's inside

- **58,437 passages** from Prabhupada's complete Vedabase (29 books + conversations + lectures + letters)
- **Fuse.js** instant fuzzy search in the browser
- **Book filter** — search within a specific book
- **AI answers** (optional) — connect your own Gemini, OpenAI, or Claude API key
- **Cross-platform** — runs on Mac, Windows, and Linux from the same USB

## How to use from USB

### Mac
Double-click **`OPEN ON MAC.command`**

### Windows
Double-click **`OPEN ON WINDOWS.exe`**

### Linux
Open a terminal in the USB folder and run:
```bash
bash "OPEN ON LINUX.sh"
```
> Note: Linux mounts FAT32 USB drives with `noexec`, so you cannot double-click to run. This is a one-time terminal command.

## Install on your computer

Copies V.E.D.A. to your local disk so you can run it without the USB.

### Mac
Double-click **`INSTALL ON MAC.command`**

### Windows
Double-click **`INSTALL ON WINDOWS.bat`**

### Linux
Open a terminal in the USB folder and run:
```bash
python3 install.py
```
After install:
- Desktop shortcut created
- Added to app menu (Super key → search "VEDA")
- Auto-starts on boot
- USB can be removed

## AI Answers (optional)

V.E.D.A. can generate AI answers based on search results. Click **Settings** in the app to configure:

1. Choose a provider: **Gemini**, **OpenAI**, or **Claude**
2. Enter your API key
3. Click **AI Answer** after searching

Keys are stored locally in your browser only. Internet is required for AI answers.

## Specs

- **USB size**: ~150 MB (any USB drive works)
- **No installation required** to run from USB
- **No internet required** for search
- **Internet required** only for AI answers

## Data source

Vedabase Original Edition (with diacritics) from https://vedabase.vedicvault.org/

## Build the index

If you want to rebuild the search index from source:

```bash
# Download Vedabase
curl -L -o data/vedabase.md "https://pub-9ebe02965a9f4aeb9c5d3d9741790d2d.r2.dev/original_vedabase_2026.md"

# Build index
node scripts/build-index.js
```

## License

Apache 2.0
