import type { DetectorResult, LevelScore, VerdictType } from '../types/detector.ts';

/**
 * Shared detector logic used by BOTH the browser (src/services/ollama.ts) and the
 * server (api/detect.ts, bundled as a Vercel serverless function and dist/server.cjs).
 * Keep this file universal: no import.meta, no DOM, no Node-only APIs.
 */
export const SYSTEM_PROMPT = `You are an AI text detection assistant. Analyze the provided text to see if it was written by an AI or a human.
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

export function parseDetectorResponse(raw: string): DetectorResult {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // If there's still text around the JSON object, extract between first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);

    const overallScore = typeof parsed.overallScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.overallScore)))
      : 50;

    let verdict: VerdictType = 'Mixed / Edited';
    if (parsed.verdict === 'Likely Human' || parsed.verdict === 'Likely AI' || parsed.verdict === 'Mixed / Edited') {
      verdict = parsed.verdict;
    } else {
      if (overallScore < 35) verdict = 'Likely Human';
      else if (overallScore > 65) verdict = 'Likely AI';
      else verdict = 'Mixed / Edited';
    }

    const perplexityScore: LevelScore = ['Low', 'Medium', 'High'].includes(parsed.metrics?.perplexityScore)
      ? parsed.metrics.perplexityScore
      : 'Medium';

    const burstinessScore: LevelScore = ['Low', 'Medium', 'High'].includes(parsed.metrics?.burstinessScore)
      ? parsed.metrics.burstinessScore
      : 'Medium';

    const repetitivePhrasing: boolean = Boolean(parsed.metrics?.repetitivePhrasing);

    const flaggedPhrases: string[] = Array.isArray(parsed.flaggedPhrases)
      ? parsed.flaggedPhrases.filter((p: unknown) => typeof p === 'string' && p.trim().length > 0)
      : [];

    const paragraphAnalysis = Array.isArray(parsed.paragraphAnalysis)
      ? parsed.paragraphAnalysis.map((p: any, idx: number) => ({
          paragraphIndex: typeof p.paragraphIndex === 'number' ? p.paragraphIndex : idx + 1,
          score: typeof p.score === 'number' ? Math.max(0, Math.min(100, Math.round(p.score))) : overallScore,
          note: typeof p.note === 'string' ? p.note : 'Forensic evaluation evaluated.'
        }))
      : [];

    return {
      overallScore,
      verdict,
      reasoning: typeof parsed.reasoning === 'string' && parsed.reasoning.length > 0
        ? parsed.reasoning
        : 'Forensic linguistic analysis evaluated vocabulary variance, sentence length regularity, and structural markers.',
      metrics: {
        perplexityScore,
        burstinessScore,
        repetitivePhrasing,
      },
      flaggedPhrases,
      paragraphAnalysis,
    };
  } catch (err) {
    throw new Error(`Failed to parse model response into valid JSON: ${(err as Error).message}. Response snippet: ${raw.slice(0, 150)}...`);
  }
}
