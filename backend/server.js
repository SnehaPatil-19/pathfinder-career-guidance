/* ============================================
   server.js — Express Backend Server
   PathFinder Career Guidance Platform

   Run locally: node server.js
   Then open frontend/index.html in browser
   (or use Live Server extension in VS Code)
   ============================================ */

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const https   = require('https');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5500',
           'http://127.0.0.1:5500','http://localhost:8080','null'],
  methods: ['POST', 'GET', 'OPTIONS'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status:  'OK',
    service: 'PathFinder API',
    ai:      'Groq - Llama 3 (Free Cloud AI)',
    time:    new Date().toISOString()
  });
});

// Main route
app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt)
    return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.GROQ_API_KEY)
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env file' });

  try {
    const result = await callGroqAPI(prompt);
    res.json({ content: result });
  } catch (err) {
    console.error('Groq Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Groq Cloud API Call ──────────────────────
function callGroqAPI(prompt) {
  return new Promise((resolve, reject) => {

    const requestBody = JSON.stringify({
      model: 'llama-3.3-70b-versatile',   // free Llama 3 model on Groq cloud
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens:  2000,
    });

    const options = {
      hostname: 'api.groq.com',        // Groq's cloud server
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
            return;
          }
          // Extract text from Groq response
          const text = parsed.choices[0].message.content;
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Groq response'));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(requestBody);
    req.end();
  });
}

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║    PathFinder Backend Server Running     ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  URL   : http://localhost:${PORT}`);
  console.log(`  Cloud : Groq API — Llama 3 (FREE)`);
  console.log(`  Speed : Ultra fast (~2 seconds)`);
  console.log('');

  if (!process.env.GROQ_API_KEY) {
    console.log('  WARNING: GROQ_API_KEY not set in .env!');
    console.log('  Get free key at: https://console.groq.com');
  } else {
    console.log('  Groq API key loaded successfully ✓');
  }
  console.log('');
});