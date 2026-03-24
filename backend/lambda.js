/* ============================================
   lambda.js — AWS Lambda Handler
   PathFinder Career Guidance Platform

   Deploy this to AWS Lambda for production.
   Set ANTHROPIC_API_KEY as Lambda Environment Variable.
   Connect to API Gateway with POST /analyze route.
   ============================================ */

const https = require('https');

// ── CORS Headers ────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',       // Change to your CloudFront URL in production
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

// ── Lambda Handler ──────────────────────────
exports.handler = async (event) => {

  // Handle preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Parse request body
  let prompt;
  try {
    const body = JSON.parse(event.body || '{}');
    prompt = body.prompt;
  } catch (e) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing prompt field' }),
    };
  }

  // Check API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY environment variable not set' }),
    };
  }

  // Call Claude
  try {
    const content = await callClaudeAPI(prompt);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ content }),
    };
  } catch (err) {
    console.error('Lambda error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// ── Claude API Call ─────────────────────────
function callClaudeAPI(prompt) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers:  {
        'Content-Type':     'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'Claude API error'));
          } else {
            const text = parsed.content.map(b => b.text || '').join('');
            resolve(text);
          }
        } catch (e) {
          reject(new Error('Failed to parse Claude API response'));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(requestBody);
    req.end();
  });
}
