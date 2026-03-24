# V.E.D.A.

**Vedic Education & Data Archive**

Offline search over Srila Prabhupada's complete works + Bhakti Yoga course. Runs on Mac, Windows, and Linux. No internet needed for search.

---

### Quick Install — Mac / Linux (one command):

```bash
curl -sL https://raw.githubusercontent.com/juanmanuelferrera/veda/main/install-remote.sh | bash
```

### Quick Install — Windows:

> Download **[VEDA.zip](https://github.com/juanmanuelferrera/veda/releases/latest)**, unzip, double-click `OPEN ON WINDOWS.exe`

---

## Features

- **Vedabase Search** — 58,437 passages from 29 books, conversations, lectures, and letters
- **Bhakta Course** — 10 units with lessons and 183 quiz questions, progress tracking
- **Book filter** — search within a specific book
- **AI answers** (optional) — connect your own Gemini, OpenAI, or Claude API key
- **Cross-platform** — Mac, Windows, Linux from the same USB or download

## Use from USB

### Mac
Double-click **`OPEN ON MAC.command`**

### Windows
Double-click **`OPEN ON WINDOWS.exe`**

### Linux
Open a terminal in the USB folder and run:
```bash
bash "OPEN ON LINUX.sh"
```

## Install from USB

Copies V.E.D.A. to your local disk. After install, remove the USB.

| Platform | Action |
|----------|--------|
| Mac | Double-click `INSTALL ON MAC.command` |
| Windows | Double-click `INSTALL ON WINDOWS.bat` |
| Linux | Run `python3 install.py` in terminal |

After install: desktop shortcut, app menu entry, auto-starts on boot.

## Bhakta Course

10 units covering the foundations of Bhakti Yoga:

1. El Maestro Espiritual y el Discípulo
2. Sadhana Bhakti, la Práctica
3. Conocimiento Védico
4. Predicación
5. Filosofía Védica
6. Devotos del Señor
7. Grandes Maestros Espirituales
8. Servicio Devocional
9. Las Creaciones Materiales y Espirituales
10. Cultura Védica

Each unit includes reading material and a multiple-choice quiz. Progress is saved locally.

## AI Answers (optional)

Click **Settings** in the app to configure:

1. Choose provider: **Gemini**, **OpenAI**, or **Claude**
2. Enter your API key
3. Click **AI Answer** after searching

Keys stored locally in your browser only. Internet required for AI answers only.

## Specs

- **Download**: ~45 MB compressed
- **Installed**: ~150 MB
- **USB**: any drive 256 MB or larger
- **Internet**: not needed for search or course, only for AI answers

## Data source

Vedabase Original Edition (with diacritics) from https://vedabase.vedicvault.org/

## Build the index from source

```bash
curl -L -o data/vedabase.md "https://pub-9ebe02965a9f4aeb9c5d3d9741790d2d.r2.dev/original_vedabase_2026.md"
node scripts/build-index.js
```

## License

Apache 2.0
