import type { IncomingMessage, ServerResponse } from 'http';

const SYSTEM_PROMPT = `You are an AI text detection assistant. Analyze the provided text to see if it was written by an AI or a human.
Look for:
1. Word choice variety (whether words are predictable or natural).
2. Sentence rhythm (whether sentence lengths vary naturally or are all similar).
3. Common AI habits (repetitive phrases like "delve into", "tapestry", "in conclusion", "furthermore").

Explain your reasoning in plain, easy-to-understand English without using complicated jargon.

Return your final output STRICTLY as a valid JSON object matching this schema:
{
  "overallScore": number (0 to 100, where 100 is definitely AI),
  "verdict": "Likely Human" | "Mixed / Edited" | "Likely AI",
  "reasoning": string (clear, simple explanation for normal readers),
  "metrics": {
    "perplexityScore": "Low" | "Medium" | "High",
    "burstinessScore": "Low" | "Medium" | "High",
    "repetitivePhrasing": boolean
  },
  "flaggedPhrases": [string],
  "paragraphAnalysis": [
    {
      "paragraphIndex": number,
      "score": number,
      "note": string (short plain-English comment)
    }
  ]
}
Do not include markdown code block formatting in your JSON output if possible.`;

const DEFAULT_MODELS = [
  'nvidia/nemotron-3-ultra:free',
  'google/gemma-4-31b:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-4-scout:free',
  'openrouter/free',
];

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

  return DEFAULT_MODELS;
}

function cleanAndParseJSON(raw: string) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
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
    configuredModels[0] ||
    'nvidia/nemotron-3-ultra:free';

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

    const parsed = cleanAndParseJSON(content);

    const overallScore =
      typeof parsed.overallScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
        : 50;

    let verdict = 'Mixed / Edited';
    if (parsed.verdict === 'Likely Human' || parsed.verdict === 'Likely AI' || parsed.verdict === 'Mixed / Edited') {
      verdict = parsed.verdict;
    } else {
      if (overallScore < 35) verdict = 'Likely Human';
      else if (overallScore > 65) verdict = 'Likely AI';
      else verdict = 'Mixed / Edited';
    }

    const result = {
      overallScore,
      verdict,
      reasoning:
        typeof parsed.reasoning === 'string' && parsed.reasoning.length > 0
          ? parsed.reasoning
          : 'Forensic linguistic analysis evaluated vocabulary variance, sentence length regularity, and structural markers.',
      metrics: {
        perplexityScore: ['Low', 'Medium', 'High'].includes(parsed.metrics?.perplexityScore)
          ? parsed.metrics.perplexityScore
          : 'Medium',
        burstinessScore: ['Low', 'Medium', 'High'].includes(parsed.metrics?.burstinessScore)
          ? parsed.metrics.burstinessScore
          : 'Medium',
        repetitivePhrasing: Boolean(parsed.metrics?.repetitivePhrasing),
      },
      flaggedPhrases: Array.isArray(parsed.flaggedPhrases)
        ? parsed.flaggedPhrases.filter((p: unknown) => typeof p === 'string' && p.trim().length > 0)
        : [],
      paragraphAnalysis: Array.isArray(parsed.paragraphAnalysis)
        ? parsed.paragraphAnalysis.map((p: any, idx: number) => ({
            paragraphIndex: typeof p.paragraphIndex === 'number' ? p.paragraphIndex : idx + 1,
            score: typeof p.score === 'number' ? Math.max(0, Math.min(100, Math.round(p.score))) : overallScore,
            note: typeof p.note === 'string' ? p.note : 'Forensic evaluation evaluated.',
          }))
        : [],
      modelUsed: data.model || selectedModel,
      analyzedAt: new Date().toLocaleTimeString(),
    };

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'An unexpected error occurred during detection processing.',
    });
  }
}
