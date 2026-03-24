#!/usr/bin/env node
/**
 * V.E.D.A. Index Builder
 * Chunks the Vedabase markdown into a searchable JSON index for Fuse.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_DIR = path.join(__dirname, '..', 'web', 'public');
const CHUNK_SIZE = 2000; // larger chunks = fewer chunks = smaller index

function chunkVedabase(filePath) {
    console.log('Reading Vedabase...');
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');

    let currentBook = '';
    let currentChapter = '';
    const chunks = [];
    let buffer = '';
    let id = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect book headers: line between ==== separators
        if (line.startsWith('====') && i + 2 < lines.length && lines[i + 2].startsWith('====')) {
            currentBook = lines[i + 1].trim();
            currentChapter = '';
            i += 2; // skip closing ====
            continue;
        }
        if (line.startsWith('====')) continue;

        // Detect chapter headers: "Bg 1:", "SB 1.1:", "CC Adi 1:", etc.
        if (/^(Bg|SB|CC|NOD|TLC|ISO|NOI|KB|TQK|TLK|OWK|PPP|PQA|PQPA|SSR|EJW|LB|MoS|PoY|RV|SC|TYS|LoB) /.test(line)) {
            currentChapter = line.trim();
        }

        buffer += line + '\n';

        if (buffer.length >= CHUNK_SIZE) {
            if (buffer.trim()) {
                chunks.push({
                    id: id++,
                    t: buffer.trim().substring(0, CHUNK_SIZE), // cap text length
                    b: currentBook,
                    c: currentChapter
                });
            }
            buffer = '';
        }
    }

    // Last chunk
    if (buffer.trim()) {
        chunks.push({
            id: id++,
            t: buffer.trim().substring(0, CHUNK_SIZE),
            b: currentBook,
            c: currentChapter
        });
    }

    return chunks;
}

function main() {
    const vedabasePath = path.join(DATA_DIR, 'vedabase.md');
    if (!fs.existsSync(vedabasePath)) {
        console.error('vedabase.md not found in data/. Download it first.');
        process.exit(1);
    }

    const chunks = chunkVedabase(vedabasePath);
    console.log(`Created ${chunks.length} chunks`);

    // Build book index
    const books = {};
    chunks.forEach(c => {
        if (c.b) {
            if (!books[c.b]) books[c.b] = 0;
            books[c.b]++;
        }
    });

    fs.mkdirSync(OUT_DIR, { recursive: true });

    // Save main index — all content, no filtering
    const indexPath = path.join(OUT_DIR, 'vedabase-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(chunks));
    const sizeMB = (fs.statSync(indexPath).size / 1024 / 1024).toFixed(1);
    console.log(`Index: ${sizeMB} MB`);

    // Save book list
    const booksPath = path.join(OUT_DIR, 'vedabase-books.json');
    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
    console.log(`\nBooks (${Object.keys(books).length} titles):`);

    Object.entries(books).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
        console.log(`  ${count} chunks — ${name}`);
    });
}

main();
