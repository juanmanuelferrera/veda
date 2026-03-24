# V.E.D.A.

**Vedic Education & Data Archive**

Bootable USB with offline AI search over Srila Prabhupada's complete works. Plug into any PC, boot, ask questions — no internet needed.

## Architecture

```
┌──────────────────────────────────┐
│  Browser → localhost:8080        │
│  Simple search UI                │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│  Web Server (Node.js)            │
│  Handles queries, serves UI      │
└──────┬───────────────┬───────────┘
       │               │
┌──────▼──────┐ ┌──────▼──────┐
│  Qdrant     │ │  Ollama     │
│  Vector DB  │ │  Llama 8B   │
│  (search)   │ │  (answers)  │
└─────────────┘ └─────────────┘
       │
┌──────▼──────────────────────────┐
│  Vedabase Original Edition      │
│  137 MB — all books embedded    │
└─────────────────────────────────┘
```

## What's inside

- **Ollama** + Llama 3.1 8B — local AI, no cloud
- **Qdrant** — vector search over all of Prabhupada's books
- **Vedabase** — 137MB complete works with diacritics, pre-embedded
- **Web UI** — clean, simple search interface

## Specs

- **Image size**: ~12 GB
- **RAM required**: 16 GB (host PC)
- **USB**: 32 GB SSD recommended
- **Internet**: Not needed after flashing

## Usage

1. Download `.img` from GitHub Releases
2. Flash to USB SSD with [balenaEtcher](https://etcher.balena.io/)
3. Plug into any PC, boot from USB
4. Open `http://localhost:8080`
5. Ask anything about Prabhupada's books

## Data source

Vedabase Original Edition (with diacritics) from https://vedabase.vedicvault.org/

## Build

The image is built automatically via GitHub Actions. Push to main triggers a new build.

## License

Apache 2.0
