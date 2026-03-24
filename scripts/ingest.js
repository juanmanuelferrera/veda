#!/usr/bin/env node
/**
 * V.E.D.A. Ingestion Script
 * Downloads the Vedabase markdown, chunks it, embeds it, and loads into Qdrant.
 * Run once during image build or first boot.
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const fs = require('fs');
const path = require('path');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION = process.env.COLLECTION_NAME || 'vedabase';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';
const VEDABASE_URL = 'https://pub-9ebe02965a9f4aeb9c5d3d9741790d2d.r2.dev/original_vedabase_2026.md';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 50;
const VECTOR_SIZE = 768; // nomic-embed-text dimension

const qdrant = new QdrantClient({ url: QDRANT_URL });

// Download Vedabase if not present
async function downloadVedabase() {
    const filePath = path.join(DATA_DIR, 'vedabase.md');
    if (fs.existsSync(filePath)) {
        console.log('Vedabase file already exists, skipping download.');
        return filePath;
    }

    console.log('Downloading Vedabase (137 MB)...');
    const res = await fetch(VEDABASE_URL);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
    return filePath;
}

// Parse markdown into chunks with metadata
function chunkVedabase(filePath) {
    console.log('Chunking Vedabase...');
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');

    let currentBook = '';
    let currentChapter = '';
    let currentSection = '';
    const chunks = [];
    let buffer = '';

    for (const line of lines) {
        // Track book/chapter/section from headers
        if (line.startsWith('# ')) {
            currentBook = line.replace('# ', '').trim();
            currentChapter = '';
            currentSection = '';
        } else if (line.startsWith('## ')) {
            currentChapter = line.replace('## ', '').trim();
            currentSection = '';
        } else if (line.startsWith('### ')) {
            currentSection = line.replace('### ', '').trim();
        }

        buffer += line + '\n';

        if (buffer.length >= CHUNK_SIZE) {
            chunks.push({
                text: buffer.trim(),
                book: currentBook,
                chapter: currentChapter,
                section: currentSection,
                source: [currentBook, currentChapter, currentSection].filter(Boolean).join(' > ')
            });

            // Keep overlap
            const words = buffer.split(' ');
            const overlapWords = Math.floor(words.length * (CHUNK_OVERLAP / CHUNK_SIZE));
            buffer = words.slice(-overlapWords).join(' ') + '\n';
        }
    }

    // Last chunk
    if (buffer.trim()) {
        chunks.push({
            text: buffer.trim(),
            book: currentBook,
            chapter: currentChapter,
            section: currentSection,
            source: [currentBook, currentChapter, currentSection].filter(Boolean).join(' > ')
        });
    }

    console.log(`Created ${chunks.length} chunks`);
    return chunks;
}

// Get embedding from Ollama
async function getEmbedding(text) {
    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, input: text })
    });
    if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
    const data = await res.json();
    return data.embeddings[0];
}

// Create Qdrant collection
async function createCollection() {
    try {
        const collections = await qdrant.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION);

        if (exists) {
            console.log(`Collection '${COLLECTION}' already exists.`);
            const info = await qdrant.getCollection(COLLECTION);
            console.log(`  Points: ${info.points_count}`);
            if (info.points_count > 0) {
                console.log('Collection already has data. Skipping ingestion.');
                return false;
            }
        } else {
            await qdrant.createCollection(COLLECTION, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine'
                }
            });
            console.log(`Created collection '${COLLECTION}'`);
        }
        return true;
    } catch (err) {
        console.error('Error creating collection:', err.message);
        throw err;
    }
}

// Ingest chunks into Qdrant
async function ingestChunks(chunks) {
    console.log(`Ingesting ${chunks.length} chunks in batches of ${BATCH_SIZE}...`);
    let ingested = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const points = [];

        for (let j = 0; j < batch.length; j++) {
            const chunk = batch[j];
            try {
                const vector = await getEmbedding(chunk.text);
                points.push({
                    id: i + j,
                    vector: vector,
                    payload: {
                        text: chunk.text,
                        book: chunk.book,
                        chapter: chunk.chapter,
                        section: chunk.section,
                        source: chunk.source
                    }
                });
            } catch (err) {
                console.error(`  Error embedding chunk ${i + j}: ${err.message}`);
            }
        }

        if (points.length > 0) {
            await qdrant.upsert(COLLECTION, { points });
            ingested += points.length;
        }

        const pct = ((i + batch.length) / chunks.length * 100).toFixed(1);
        console.log(`  Progress: ${pct}% (${ingested} chunks ingested)`);
    }

    console.log(`\nIngestion complete: ${ingested} chunks in '${COLLECTION}'`);
}

// Main
async function main() {
    console.log('=== V.E.D.A. Ingestion ===\n');

    // Wait for services
    console.log('Waiting for services...');
    for (let i = 0; i < 30; i++) {
        try {
            await fetch(`${OLLAMA_URL}/api/tags`);
            await fetch(`${QDRANT_URL}/collections`);
            console.log('Services ready.\n');
            break;
        } catch {
            if (i === 29) throw new Error('Services not available after 30 attempts');
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // Ensure embedding model is pulled
    console.log(`Pulling embedding model '${EMBED_MODEL}'...`);
    await fetch(`${OLLAMA_URL}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: EMBED_MODEL })
    });

    // Create collection (returns false if already populated)
    const needsIngestion = await createCollection();
    if (!needsIngestion) return;

    // Download and chunk
    const filePath = await downloadVedabase();
    const chunks = chunkVedabase(filePath);

    // Ingest
    await ingestChunks(chunks);

    console.log('\n=== V.E.D.A. Ready ===');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
