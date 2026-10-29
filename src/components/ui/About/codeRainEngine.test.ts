import { describe, expect, it } from 'vitest';

import {
  createBag,
  DISSOLVE_MS,
  FALL_MS,
  HOLD_MS,
  LETTER_DELAY_MS,
  letterPhase,
  placeWord,
  rectsOverlap,
  STACK_NAMES,
  wordDuration,
} from './codeRainEngine';

// Deterministic PRNG so the random-placement assertions are repeatable.
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe('letterPhase', () => {
  const letters = 5;
  const lastLanded = (letters - 1) * LETTER_DELAY_MS + FALL_MS;

  it('drops letters one after another, left to right', () => {
    expect(letterPhase(0, 0, letters)).toEqual({ phase: 'falling', progress: 0 });
    expect(letterPhase(0, 1, letters)).toEqual({ phase: 'waiting' });
    expect(letterPhase(LETTER_DELAY_MS + FALL_MS / 2, 1, letters)).toEqual({
      phase: 'falling',
      progress: 0.5,
    });
    expect(letterPhase(FALL_MS, 0, letters)).toEqual({ phase: 'landed' });
  });

  it('holds the whole word, then dissolves every letter together and ends', () => {
    expect(letterPhase(lastLanded, letters - 1, letters)).toEqual({ phase: 'landed' });
    expect(letterPhase(lastLanded + HOLD_MS + DISSOLVE_MS / 2, 0, letters)).toEqual({
      phase: 'dissolving',
      progress: 0.5,
    });
    expect(letterPhase(wordDuration(letters), 0, letters)).toBeNull();
  });
});

describe('placeWord', () => {
  const area = { x: 8, y: 40, width: 300, height: 80 };
  const size = { width: 90, height: 20 };

  it('keeps random positions inside the area', () => {
    const rand = seeded(42);
    for (let i = 0; i < 500; i++) {
      const { x, y } = placeWord(area, size, rand);
      expect(x).toBeGreaterThanOrEqual(area.x);
      expect(x + size.width).toBeLessThanOrEqual(area.x + area.width);
      expect(y).toBeGreaterThanOrEqual(area.y);
      expect(y + size.height).toBeLessThanOrEqual(area.y + area.height);
    }
  });

  it('centres on the cursor but clamps at the edges', () => {
    expect(placeWord(area, size, Math.random, { x: 150, y: 80 })).toEqual({ x: 105, y: 70 });
    expect(placeWord(area, size, Math.random, { x: 999, y: 999 })).toEqual({ x: 218, y: 100 });
    expect(placeWord(area, size, Math.random, { x: -50, y: -50 })).toEqual({ x: 8, y: 40 });
  });
});

describe('rectsOverlap', () => {
  it('detects overlap and allows touching edges', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    expect(rectsOverlap(a, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    expect(rectsOverlap(a, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });
});

describe('createBag', () => {
  it('serves every name once per round and never repeats back to back', () => {
    const next = createBag(STACK_NAMES, seeded(7));
    const drawn = Array.from({ length: STACK_NAMES.length * 20 }, next);

    for (let i = 1; i < drawn.length; i++) expect(drawn[i]).not.toBe(drawn[i - 1]);
    expect(new Set(drawn.slice(0, STACK_NAMES.length)).size).toBe(STACK_NAMES.length);
  });
});
