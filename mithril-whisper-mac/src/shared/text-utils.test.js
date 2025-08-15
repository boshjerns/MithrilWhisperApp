import { describe, it, expect } from 'vitest';

import { countWords, estimateWordsFromChars } from './text-utils.js';

describe('countWords', () => {
  it('returns 0 for empty, null, undefined', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });

  it('counts words separated by single spaces', () => {
    expect(countWords('one two three')).toBe(3);
  });

  it('counts words separated by multiple spaces and newlines', () => {
    expect(countWords(' one\n\n two   three\tfour ')).toBe(4);
  });

  it('ignores extra whitespace around punctuation', () => {
    expect(countWords('Hello, world!')).toBe(2);
  });
});

describe('estimateWordsFromChars', () => {
  it('returns 0 for non-positive or invalid numbers', () => {
    expect(estimateWordsFromChars(0)).toBe(0);
    expect(estimateWordsFromChars(-10)).toBe(0);
    expect(estimateWordsFromChars('not-a-number')).toBe(0);
  });

  it('estimates words as roughly chars/5', () => {
    expect(estimateWordsFromChars(10)).toBe(2);
    expect(estimateWordsFromChars(25)).toBe(5);
    expect(estimateWordsFromChars(26)).toBe(5);
  });
});


