import { useEffect, useRef, useState } from 'react';

const DEFAULT_SPEED_MS = 28;
const EMPTY_LENGTH = 0;
const STEP = 1;

const useTypewriter = (text: string, speed: number = DEFAULT_SPEED_MS) => {
  const [length, setLength] = useState(EMPTY_LENGTH);
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(EMPTY_LENGTH);

  useEffect(() => {
    indexRef.current = EMPTY_LENGTH;
    setLength(EMPTY_LENGTH);
    setIsDone(false);

    if (text.length === EMPTY_LENGTH) {
      setIsDone(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setLength(text.length);
      setIsDone(true);
      return;
    }

    const intervalId = window.setInterval(() => {
      indexRef.current += STEP;
      setLength(indexRef.current);

      if (indexRef.current >= text.length) {
        window.clearInterval(intervalId);
        setIsDone(true);
      }
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [text, speed]);

  return { typedLength: length, isDone };
};

export default useTypewriter;
