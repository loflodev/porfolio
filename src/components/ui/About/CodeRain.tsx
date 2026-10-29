import { useEffect, useRef } from 'react';

import {
  createBag,
  FALL_MS,
  GLYPHS,
  LETTER_DELAY_MS,
  letterPhase,
  placeWord,
  type Rect,
  rectsOverlap,
  STACK_NAMES,
} from './codeRainEngine';
import useTranslation from '../../../hooks/useTransalation';

const CELL_PX = 11;
const CELL_PX_NARROW = 9;
const NARROW_WIDTH = 520;
// Columns sit a little apart, like the film; cell width = font size × this ratio.
const CELL_WIDTH_RATIO = 0.8;
const MONO_FONT = 'ui-monospace, Menlo, monospace';
// Formed letters match the hero's "Louis" highlight (--font-size-base, bold).
const WORD_FONT_PX = 15;
const WORD_FONT_WEIGHT = 700;
const WORD_LINE_HEIGHT = 1.3;
const MAX_DPR = 2;
const FRAME_MS = 33;
const TRAIL_DECAY = 0.9;
const MIN_VISIBLE = 0.04;
const HEAD_BRIGHTNESS = 0.97;
const MIN_SPEED = 0.12;
const SPEED_RANGE = 0.22;
const FLICKER_CHANCE = 0.02;
const TRAIL_ALPHA = 0.85;
// How much the rain behind a formed word is muted, so the word reads clearly.
const BACKDROP_DIM = 0.85;
const BACKDROP_PAD_PX = 6;
// Words land inside the middle band; the edges fade out under the CSS mask.
const SAFE_EDGE_RATIO = 0.25;
const SIDE_PAD_PX = 8;
const BOTH_SIDES = 2;
// Glyphs trailing above a letter's falling drop.
const DROP_TRAIL = 5;
const DROP_TRAIL_FADE = 0.16;
const DISSOLVE_DRIFT_PX = 18;
const AUTO_MIN_MS = 3000;
const AUTO_RANGE_MS = 3000;
const FIRST_WORD_MS = 900;
const RESUME_AFTER_HOVER_MS = 1500;
const HOVER_COOLDOWN_MS = 1200;
const MAX_WORDS = 2;
const PLACEMENT_TRIES = 6;
const STATIC_DENSITY = 0.35;
const ZERO = 0;
const ONE = 1;
const FALLBACK_GOLD = 'hsl(45, 100%, 72%)';
const WORD_COLOR = '#ffffff';
const HEAD_COLOR = '#fffbe6';

type Letter = { char: string; x: number };

type Word = {
  letters: Letter[];
  box: Rect;
  start: number;
};

type Point = { x: number; y: number };

type CodeRainProps = {
  popIn?: boolean;
};

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

const CodeRain = ({ popIn = true }: CodeRainProps) => {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gold =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-orange-yellow-crayola')
        .trim() || FALLBACK_GOLD;
    const wordFont = `${WORD_FONT_WEIGHT} ${WORD_FONT_PX}px ${
      getComputedStyle(document.body).fontFamily || 'sans-serif'
    }`;
    const wordHeight = Math.ceil(WORD_FONT_PX * WORD_LINE_HEIGHT);
    const nextWord = createBag(STACK_NAMES, Math.random);

    let width = ZERO;
    let height = ZERO;
    let cell = CELL_PX;
    let cellWidth = CELL_PX;
    let cols = ZERO;
    let rows = ZERO;
    let glyphs: string[] = [];
    let bright = new Float32Array(ZERO);
    let backdrop = new Float32Array(ZERO);
    let drops = new Float32Array(ZERO);
    let speeds = new Float32Array(ZERO);
    let words: Word[] = [];
    let frameId = ZERO;
    let lastFrame = ZERO;
    let nextAutoAt = ZERO;
    let lastHoverAt = -HOVER_COOLDOWN_MS;
    let hovering = false;
    let onScreen = true;

    // Lays the word out letter by letter in the site font, so it reads like real text.
    const layoutWord = (text: string, start: number, near?: Point): Word | null => {
      ctx.font = wordFont;
      const wordWidth = ctx.measureText(text).width;
      const safeTop = height * SAFE_EDGE_RATIO;
      const area = {
        x: SIDE_PAD_PX,
        y: safeTop,
        width: width - SIDE_PAD_PX * BOTH_SIDES,
        height: height - safeTop * BOTH_SIDES,
      };
      if (wordWidth > area.width) return null;

      const tries = near ? ONE : PLACEMENT_TRIES;
      for (let attempt = ZERO; attempt < tries; attempt++) {
        const size = { width: wordWidth, height: wordHeight };
        const { x, y } = placeWord(area, size, Math.random, near);
        const box = { x, y, ...size };
        if (words.some((word) => rectsOverlap(word.box, box))) continue;

        const letters = [...text].map((char, index) => ({
          char,
          x: x + ctx.measureText(text.slice(ZERO, index)).width,
        }));
        return { letters, box, start };
      }
      return null;
    };

    const spawn = (now: number, near?: Point) => {
      if (words.length >= MAX_WORDS) return;
      const word = layoutWord(nextWord(), now, near);
      if (word) words.push(word);
    };

    const setup = () => {
      ({ width, height } = wrap.getBoundingClientRect());
      const dpr = Math.min(window.devicePixelRatio || ONE, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, ZERO, ZERO, dpr, ZERO, ZERO);

      cell = width < NARROW_WIDTH ? CELL_PX_NARROW : CELL_PX;
      cellWidth = Math.round(cell * CELL_WIDTH_RATIO);
      cols = Math.floor(width / cellWidth);
      rows = Math.ceil(height / cell);
      glyphs = Array.from({ length: cols * rows }, randomGlyph);
      bright = new Float32Array(cols * rows);
      backdrop = new Float32Array(cols * rows);
      drops = Float32Array.from({ length: cols }, () => -Math.random() * rows);
      speeds = Float32Array.from({ length: cols }, () => MIN_SPEED + Math.random() * SPEED_RANGE);
      words = [];
    };

    const step = (now: number) => {
      for (let c = ZERO; c < cols; c++) {
        const before = Math.floor(drops[c]);
        drops[c] += speeds[c];
        const head = Math.floor(drops[c]);
        if (head !== before && head >= ZERO && head < rows) {
          const index = head * cols + c;
          bright[index] = ONE;
          glyphs[index] = randomGlyph();
        }
        if (head > rows && Math.random() < speeds[c]) {
          drops[c] = -Math.random() * rows;
        }
      }

      for (let i = ZERO; i < bright.length; i++) {
        bright[i] *= TRAIL_DECAY;
        if (Math.random() < FLICKER_CHANCE) glyphs[i] = randomGlyph();
      }

      // Hovering pauses the random words entirely; only the cursor forms them then.
      if (!hovering && now >= nextAutoAt) {
        spawn(now);
        nextAutoAt = now + AUTO_MIN_MS + Math.random() * AUTO_RANGE_MS;
      }
    };

    // Drops finished words and mutes the rain behind the live ones.
    const updateWords = (now: number) => {
      backdrop.fill(ZERO);
      words = words.filter((word) => {
        const state = letterPhase(now - word.start, ZERO, word.letters.length);
        if (state === null) return false;

        const strength = state.phase === 'dissolving' ? ONE - state.progress : ONE;
        const { x, y, width: w, height: h } = word.box;
        const firstCol = Math.max(ZERO, Math.floor((x - BACKDROP_PAD_PX) / cellWidth));
        const lastCol = Math.min(cols, Math.ceil((x + w + BACKDROP_PAD_PX) / cellWidth));
        const firstRow = Math.max(ZERO, Math.floor((y - BACKDROP_PAD_PX) / cell));
        const lastRow = Math.min(rows, Math.ceil((y + h + BACKDROP_PAD_PX) / cell));
        for (let row = firstRow; row < lastRow; row++) {
          for (let col = firstCol; col < lastCol; col++) {
            const index = row * cols + col;
            backdrop[index] = Math.max(backdrop[index], strength);
          }
        }
        return true;
      });
    };

    const drawRain = () => {
      ctx.font = `${cell}px ${MONO_FONT}`;
      ctx.textBaseline = 'top';

      const pass = (color: string, pick: (index: number) => number) => {
        ctx.fillStyle = color;
        for (let i = ZERO; i < bright.length; i++) {
          const alpha = pick(i);
          if (alpha < MIN_VISIBLE) continue;
          ctx.globalAlpha = alpha;
          ctx.fillText(glyphs[i], (i % cols) * cellWidth, Math.floor(i / cols) * cell);
        }
      };

      pass(gold, (i) =>
        bright[i] >= HEAD_BRIGHTNESS
          ? ZERO
          : bright[i] * TRAIL_ALPHA * (ONE - backdrop[i] * BACKDROP_DIM)
      );
      pass(HEAD_COLOR, (i) =>
        bright[i] >= HEAD_BRIGHTNESS ? ONE - backdrop[i] * BACKDROP_DIM : ZERO
      );
    };

    // Each letter falls as its own drop (random glyphs with a short trail), then locks into
    // the real letter; at the end every letter scrambles, drifts down and fades.
    const drawWords = (now: number) => {
      ctx.font = wordFont;
      ctx.textBaseline = 'top';

      for (const { letters, box, start } of words) {
        letters.forEach(({ char, x }, index) => {
          const state = letterPhase(now - start, index, letters.length);
          if (!state || state.phase === 'waiting' || char === ' ') return;

          if (state.phase === 'falling') {
            const headY = state.progress * box.y;
            for (let trail = DROP_TRAIL; trail >= ZERO; trail--) {
              ctx.globalAlpha = ONE - trail * DROP_TRAIL_FADE;
              ctx.fillStyle = trail === ZERO ? HEAD_COLOR : gold;
              ctx.fillText(randomGlyph(), x, headY - trail * wordHeight);
            }
            return;
          }

          ctx.fillStyle = WORD_COLOR;
          if (state.phase === 'landed') {
            ctx.globalAlpha = ONE;
            ctx.fillText(char, x, box.y);
            return;
          }

          ctx.globalAlpha = ONE - state.progress;
          ctx.fillText(randomGlyph(), x, box.y + state.progress * DISSOLVE_DRIFT_PX);
        });
      }
      ctx.globalAlpha = ONE;
    };

    const draw = (now: number) => {
      ctx.clearRect(ZERO, ZERO, width, height);
      drawRain();
      drawWords(now);
    };

    const paintStatic = () => {
      setup();
      for (let i = ZERO; i < bright.length; i++) {
        bright[i] = Math.random() < STATIC_DENSITY ? Math.random() * HEAD_BRIGHTNESS : ZERO;
      }
      const text = nextWord();
      // Started just as its last letter lands: fully formed at t = 0.
      const landedAfter = ([...text].length - ONE) * LETTER_DELAY_MS + FALL_MS;
      const word = layoutWord(text, -landedAfter);
      words = word ? [word] : [];
      updateWords(ZERO);
      draw(ZERO);
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      step(now);
      updateWords(now);
      draw(now);
    };

    const running = () => frameId !== ZERO;
    const start = () => {
      if (reducedMotion || running() || !onScreen || document.hidden) return;
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = ZERO;
    };

    const handleResize = () => {
      if (reducedMotion) {
        paintStatic();
        return;
      }
      setup();
      nextAutoAt = performance.now() + FIRST_WORD_MS;
    };

    const handlePointerLeave = () => {
      hovering = false;
      nextAutoAt = performance.now() + RESUME_AFTER_HOVER_MS;
    };

    const handlePointerMove = (event: PointerEvent) => {
      hovering = true;
      if (reducedMotion || !running()) return;
      const now = performance.now();
      if (now - lastHoverAt < HOVER_COOLDOWN_MS) return;
      lastHoverAt = now;
      const rect = wrap.getBoundingClientRect();
      spawn(now, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const handleVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(wrap);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    intersectionObserver.observe(wrap);
    wrap.addEventListener('pointermove', handlePointerMove);
    wrap.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);

    handleResize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      wrap.removeEventListener('pointermove', handlePointerMove);
      wrap.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="code-rain-wrap">
      <div className={`code-rain${popIn ? ' is-visible' : ''}`} ref={wrapRef} aria-hidden="true">
        <canvas className="code-rain-canvas" ref={canvasRef} />
      </div>

      <span className="sr-only">{t('aboutPage.description2')}</span>
    </div>
  );
};

export default CodeRain;
