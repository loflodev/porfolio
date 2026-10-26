import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useTypewriter from './useTypewriter';

const mockReducedMotion = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useTypewriter', () => {
  it('types one character per tick and then reports done', () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useTypewriter('abc', 10));

    expect(result.current).toEqual({ typedLength: 0, isDone: false });
    act(() => vi.advanceTimersByTime(10));
    expect(result.current.typedLength).toBe(1);
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toEqual({ typedLength: 3, isDone: true });
  });

  it('shows the full text immediately when reduced motion is preferred', () => {
    mockReducedMotion(true);
    const { result } = renderHook(() => useTypewriter('hello'));

    expect(result.current).toEqual({ typedLength: 5, isDone: true });
  });

  it('is done immediately for empty text', () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useTypewriter(''));

    expect(result.current.isDone).toBe(true);
  });

  it('restarts when the text changes', () => {
    mockReducedMotion(false);
    const { result, rerender } = renderHook(({ text }) => useTypewriter(text, 10), {
      initialProps: { text: 'ab' },
    });
    act(() => vi.advanceTimersByTime(20));
    expect(result.current.isDone).toBe(true);

    rerender({ text: 'xyz' });
    expect(result.current).toEqual({ typedLength: 0, isDone: false });
  });
});
