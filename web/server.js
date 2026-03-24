const express = require('express');
const { QdrantClient } = require('@qdrant/js-client-rest');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const KIWIX_URL = process.env.KIWIX_URL || 'http://localhost:8888';
const KOLIBRI_URL = process.env.KOLIBRI_URL || 'http://localhost:8889';
const COLLECTION = process.env.COLLECTION_NAME || 'vedabase';
let currentModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';

const qdrant = new QdrantClient({ url: QDRANT_URL });

// Generate embedding via Ollama
async function getEmbedding(text) {
    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: EMBED_MODEL, input: text })
    });
    const data = await res.json();
    return data.embeddings[0];
}

// Search Qdrant for relevant passages
async function searchVedabase(query, limit = 5) {
    const embedding = await getEmbedding(query);
    const results = await qdrant.search(COLLECTION, {
        vector: embedding,
        limit: limit,
        with_payload: true
    });
    return results.map(r => ({
        text: r.payload.text,
        source: r.payload.source || '',
        book: r.payload.book || '',
        score: r.score
    }));
}

// Generate answer with Ollama using RAG context
async function generateAnswer(query, context) {
    const contextText = context.map((c, i) =>
        `[${i + 1}] ${c.book ? c.book + ': ' : ''}${c.text}`
    ).join('\n\n');

    const systemPrompt = `You are V.E.D.A., an AI assistant specialized in the teachings of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada. You answer questions based ONLY on the provided context from Prabhupada's original books. Always cite the source book and reference when possible. If the context doesn't contain enough information to answer, say so honestly. Be respectful and accurate. Answer in the same language as the question.`;

    const userPrompt = `Context from Srila Prabhupada's books:\n\n${contextText}\n\nQuestion: ${query}\n\nAnswer based on the context above:`;

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: currentModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            stream: false
        })
    });
    const data = await res.json();
    return data.message.content;
}

// API: Search and answer
app.post('/api/ask', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });

        const context = await searchVedabase(query);
        const answer = await generateAnswer(query, context);

        res.json({
            answer,
            sources: context.map(c => ({
                text: c.text.substring(0, 200) + '...',
                book: c.book,
                source: c.source,
                score: c.score
            }))
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// API: Simple search (no AI, just vector search)
app.post('/api/search', async (req, res) => {
    try {
        const { query, limit } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });

        const results = await searchVedabase(query, limit || 10);
        res.json({ results });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// API: Service status
app.get('/api/status', async (req, res) => {
    const status = { ollama: false, qdrant: false, kiwix: false, kolibri: false };

    try { await fetch(`${OLLAMA_URL}/api/tags`); status.ollama = true; } catch {}
    try { await fetch(`${QDRANT_URL}/collections`); status.qdrant = true; } catch {}
    try { await fetch(KIWIX_URL); status.kiwix = true; } catch {}
    try { await fetch(KOLIBRI_URL); status.kolibri = true; } catch {}

    res.json(status);
});

// API: List available models
app.get('/api/models', async (req, res) => {
    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`);
        const data = await r.json();
        const models = (data.models || []).map(m => ({
            name: m.name,
            size: m.size,
            modified: m.modified_at,
            active: m.name === currentModel
        }));
        res.json({ models, current: currentModel });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Switch active model
app.post('/api/models/switch', async (req, res) => {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'Model name required' });
    currentModel = model;
    res.json({ current: currentModel });
});

// API: Pull (download) a new model
app.post('/api/models/pull', async (req, res) => {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'Model name required' });

    try {
        const r = await fetch(`${OLLAMA_URL}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: false })
        });
        const data = await r.json();
        res.json({ status: 'downloaded', model, details: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Delete a model
app.delete('/api/models/:name', async (req, res) => {
    try {
        await fetch(`${OLLAMA_URL}/api/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: req.params.name })
        });
        if (currentModel === req.params.name) currentModel = '';
        res.json({ deleted: req.params.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Collection info
app.get('/api/collection', async (req, res) => {
    try {
        const info = await qdrant.getCollection(COLLECTION);
        res.json({
            name: COLLECTION,
            points: info.points_count,
            status: info.status
        });
    } catch (err) {
        res.json({ name: COLLECTION, points: 0, status: 'not_found' });
    }
});

// Service proxy routes
app.get('/kiwix', (req, res) => res.redirect(KIWIX_URL));
app.get('/courses', (req, res) => res.redirect(KOLIBRI_URL));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`V.E.D.A. running at http://localhost:${PORT}`);
});
