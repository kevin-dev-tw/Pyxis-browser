// Pyxis AI proxy — keeps the Groq API key in Vercel env vars, never in the app.
// POST { messages: [{role, content}] } → streams Groq SSE straight through.
const { Readable } = require('stream');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  // Optional shared secret — set PYXIS_CLIENT_KEY in Vercel to require it.
  if (process.env.PYXIS_CLIENT_KEY &&
      req.headers['x-pyxis-key'] !== process.env.PYXIS_CLIENT_KEY) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: 'messages[] required' });
    return;
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: true,
        reasoning_effort: 'medium',
        tools: [{ type: 'browser_search' }],
        messages
      })
    });

    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status || 502)
         .json({ error: `groq ${upstream.status}` });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
