import { SYSTEM_PROMPT, parseDetectorResponse } from '../src/utils/detector.ts';

function getOpenRouterModelList(): string[] {
  const envModels =
    process.env.OPENROUTER_MODELS ||
    process.env.VITE_OPENROUTER_MODELS;

  if (envModels && typeof envModels === 'string') {
    const parsed = envModels
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  return [];
}

/**
 * Vercel Serverless Function & Express Proxy Endpoint: POST /api/detect
 *
 * Securely proxies AI detection requests to OpenRouter.
 * The OPENROUTER_API_KEY is retrieved exclusively on the server side,
 * keeping it completely private from the client application.
 */
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Only POST requests are supported.' });
    return;
  }

  // Parse body if it was passed as string
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON body payload.' });
      return;
    }
  }

  const { text, model } = body || {};

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Missing required "text" parameter in request body.' });
    return;
  }

  const cleanText = text.trim();
  if (cleanText.length < 25) {
    res.status(400).json({ error: 'Text must be at least 25 characters for forensic analysis.' });
    return;
  }

  // Retrieve OpenRouter API Key strictly from server-side environment
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openrouter_api_key_here') {
    res.status(500).json({
      error: 'MISSING_OPENROUTER_KEY',
      message: 'Server environment variable OPENROUTER_API_KEY is not configured. Please add OPENROUTER_API_KEY in your Vercel Project Settings > Environment Variables or .env.',
    });
    return;
  }

  const configuredModels = getOpenRouterModelList();
  const selectedModel =
    model ||
    process.env.VITE_OPENROUTER_DEFAULT_MODEL ||
    configuredModels[0];

  if (!selectedModel) {
    res.status(400).json({
      error: 'MISSING_OPENROUTER_MODELS',
      message: 'No OpenRouter model configured. Set VITE_OPENROUTER_MODELS (comma-separated) or VITE_OPENROUTER_DEFAULT_MODEL in the environment.',
    });
    return;
  }

  const modelsList = [
    selectedModel,
    ...configuredModels.filter((m) => m !== selectedModel),
  ];

  try {
    const payload = {
      model: selectedModel,
      models: modelsList,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze the following text for AI generation markers:\n\n"""\n${cleanText}\n"""`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': req.headers?.referer || 'https://vercel.app',
        'X-Title': 'AI Text Detector Vercel Proxy',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {}

      const message =
        errorJson?.error?.message ||
        errorJson?.message ||
        `OpenRouter API returned status ${response.status}: ${errorText.slice(0, 150)}`;

      res.status(response.status >= 500 ? 502 : response.status).json({
        error: message,
      });
      return;
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      res.status(502).json({ error: 'Received empty response content from OpenRouter.' });
      return;
    }

    const parsed = parseDetectorResponse(content);
    parsed.modelUsed = data.model || selectedModel;
    parsed.analyzedAt = new Date().toLocaleTimeString();

    res.status(200).json(parsed);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'An unexpected error occurred during detection processing.',
    });
  }
}
