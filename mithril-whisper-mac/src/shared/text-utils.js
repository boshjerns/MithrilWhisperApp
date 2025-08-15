function countWords(text) {
  if (!text) return 0;
  const trimmed = String(text).trim();
  if (!trimmed) return 0;
  // Split on any whitespace; filter out empty tokens to be robust
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function estimateWordsFromChars(charCount) {
  const n = typeof charCount === 'number' ? charCount : Number(charCount || 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 5);
}

module.exports = {
  countWords,
  estimateWordsFromChars,
};


