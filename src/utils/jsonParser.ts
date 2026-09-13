import { DetectorResult, VerdictType, LevelScore } from '../types/detector';

/**
 * Robust JSON parser with fallback extraction for LLM responses.
 * Handles backticks (```json ... ```), raw unformatted strings, and leading/trailing artifacts.
 */
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
          paragraphIndex: typeof p.paragraphIndex === 'number' ? p.paragraphIndex : idx,
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
