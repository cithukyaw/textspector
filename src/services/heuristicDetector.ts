import { DetectorResult, VerdictType, LevelScore } from '../types/detector';

const AI_MARKER_PHRASES = [
  'delve into', 'in today\'s fast-paced', 'testament to', 'delicate tapestry',
  'tapestry of', 'furthermore', 'moreover', 'in conclusion', 'multifaceted',
  'pivotal role', 'vital role', 'holistic approach', 'fostering a', 'intertwining',
  'it is important to note', 'beacon of hope', 'navigating the', 'transformative potential',
  'stands as a', 'undeniably', 'paramount importance', 'spearheading'
];

/**
 * Client-side heuristic linguistic analyzer
 * Used as an immediate offline preview mode when external LLM API credentials are not yet configured.
 */
export function runForensicHeuristic(text: string): DetectorResult {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const lowerText = text.toLowerCase();
  const flaggedPhrases: string[] = [];

  for (const phrase of AI_MARKER_PHRASES) {
    if (lowerText.includes(phrase)) {
      flaggedPhrases.push(phrase);
    }
  }

  // Sentence length variance (Burstiness)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) / (sentenceLengths.length || 1);
  const stdDev = Math.sqrt(variance);

  // Burstiness: Human writing has high stdDev (mix of 3-word and 35-word sentences). AI is uniform (~15-22 words each).
  let burstinessScore: LevelScore = 'Medium';
  if (stdDev > 10) {
    burstinessScore = 'High'; // Indicates human variation
  } else if (stdDev < 5) {
    burstinessScore = 'Low'; // Indicates AI robotic uniformity
  }

  // Vocabulary diversity (Type-Token Ratio) -> Perplexity proxy
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const uniqueWords = new Set(words);
  const ttr = words.length > 0 ? uniqueWords.size / words.length : 0.5;

  let perplexityScore: LevelScore = 'Medium';
  if (ttr > 0.65) perplexityScore = 'High'; // High unpredictability / human
  else if (ttr < 0.45) perplexityScore = 'Low'; // Formulaic / repetitive

  // Scoring calculation
  let baseScore = 40;

  // Heavy marker presence boosts AI score
  baseScore += Math.min(45, flaggedPhrases.length * 15);

  // Low burstiness (monotonous pacing) boosts AI score
  if (burstinessScore === 'Low') baseScore += 20;
  if (burstinessScore === 'High') baseScore -= 20;

  // Low perplexity boosts AI score
  if (perplexityScore === 'Low') baseScore += 15;
  if (perplexityScore === 'High') baseScore -= 15;

  // Clamp 5 to 98
  const overallScore = Math.max(5, Math.min(98, Math.round(baseScore)));

  let verdict: VerdictType = 'Mixed / Edited';
  if (overallScore >= 70) verdict = 'Likely AI';
  else if (overallScore <= 35) verdict = 'Likely Human';

  const repetitivePhrasing = flaggedPhrases.length >= 2 || (ttr < 0.45);

  const paragraphAnalysis = paragraphs.map((para, idx) => {
    const paraLower = para.toLowerCase();
    const paraFlags = AI_MARKER_PHRASES.filter(p => paraLower.includes(p));
    let paraScore = overallScore + (paraFlags.length > 0 ? 15 : -10);
    paraScore = Math.max(10, Math.min(99, paraScore));

    let note = 'Natural mix of sentence lengths and varied word choice.';
    if (paraScore >= 75) {
      note = paraFlags.length > 0
        ? `Contains repetitive AI phrases (${paraFlags.slice(0, 2).map(f => `"${f}"`).join(', ')}) with rigid sentences.`
        : 'Sentences are very similar in length and sound repetitive.';
    } else if (paraScore >= 45) {
      note = 'Mix of natural writing and formulaic sentences.';
    }

    return {
      paragraphIndex: idx + 1,
      score: paraScore,
      note,
    };
  });

  const reasoning = verdict === 'Likely AI'
    ? `This text sounds like it was written by AI. It uses very even sentence lengths and familiar AI phrases (${flaggedPhrases.slice(0, 3).map(p => `"${p}"`).join(', ')}).`
    : verdict === 'Likely Human'
    ? 'This text reads naturally like a human wrote it. It mixes short and long sentences, uses varied words, and avoids common AI cliché phrases.'
    : 'This text has a mix of styles. Some parts read naturally, while other parts use repetitive phrasing and uniform sentence structures.';

  return {
    overallScore,
    verdict,
    reasoning,
    metrics: {
      perplexityScore,
      burstinessScore,
      repetitivePhrasing,
    },
    flaggedPhrases,
    paragraphAnalysis,
    analyzedAt: new Date().toLocaleTimeString(),
    modelUsed: 'Instant Offline Checker',
  };
}
