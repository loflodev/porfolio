// Pure helpers for the hero code rain (CodeRain.tsx): word list, glyphs, placement and the
// letter-by-letter timeline of a formed word. Nothing here touches the DOM.

export const STACK_NAMES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'PHP',
  'HTML5',
  'CSS3',
  'MongoDB',
  'Express',
  'React',
  'Node.js',
  'WordPress',
  'Figma',
  'Claude',
  'Tailwind CSS',
  'Git',
  'Vite',
  'Vue.js',
];

// Half-width katakana (the film's look) mixed with digits and code punctuation.
export const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789{}<>/;=()';

// Each letter rides its own falling drop; drops leave one after another, left to right.
export const LETTER_DELAY_MS = 110;
export const FALL_MS = 650;
export const HOLD_MS = 1800;
export const DISSOLVE_MS = 700;

const ZERO = 0;
const ONE = 1;
const HALF = 0.5;

type Random = () => number;

export type Rect = { x: number; y: number; width: number; height: number };

export type LetterPhase =
  | { phase: 'waiting' }
  | { phase: 'falling'; progress: number }
  | { phase: 'landed' }
  | { phase: 'dissolving'; progress: number };

export const wordDuration = (letters: number) =>
  Math.max(ZERO, letters - ONE) * LETTER_DELAY_MS + FALL_MS + HOLD_MS + DISSOLVE_MS;

// Where letter `index` of a `letters`-long word is at `elapsed` ms; null once the word is gone.
export const letterPhase = (
  elapsed: number,
  index: number,
  letters: number
): LetterPhase | null => {
  const dissolveAt = wordDuration(letters) - DISSOLVE_MS;
  if (elapsed >= dissolveAt + DISSOLVE_MS) return null;
  if (elapsed >= dissolveAt)
    return { phase: 'dissolving', progress: (elapsed - dissolveAt) / DISSOLVE_MS };

  const leaveAt = index * LETTER_DELAY_MS;
  if (elapsed < leaveAt) return { phase: 'waiting' };
  if (elapsed < leaveAt + FALL_MS)
    return { phase: 'falling', progress: (elapsed - leaveAt) / FALL_MS };
  return { phase: 'landed' };
};

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

// Top-left corner for a word of `size` inside `area`: random, or centred on `near` (the
// cursor), always clamped so the whole word stays inside.
export const placeWord = (
  area: Rect,
  size: { width: number; height: number },
  rand: Random,
  near?: { x: number; y: number }
) => {
  const maxX = area.x + area.width - size.width;
  const maxY = area.y + area.height - size.height;

  if (near) {
    return {
      x: clamp(near.x - size.width * HALF, area.x, maxX),
      y: clamp(near.y - size.height * HALF, area.y, maxY),
    };
  }

  return {
    x: clamp(area.x + rand() * (maxX - area.x), area.x, maxX),
    y: clamp(area.y + rand() * (maxY - area.y), area.y, maxY),
  };
};

export const rectsOverlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const shuffle = <T>(items: readonly T[], rand: Random) => {
  const copy = [...items];
  for (let i = copy.length - ONE; i > ZERO; i--) {
    const j = Math.floor(rand() * (i + ONE));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Draws items in shuffled rounds; the first item of a new round never repeats the last one.
export const createBag = <T>(items: readonly T[], rand: Random) => {
  let queue: T[] = [];
  let last: T | undefined;

  return () => {
    if (queue.length === ZERO) {
      queue = shuffle(items, rand);
      if (queue.length > ONE && queue[ZERO] === last) {
        queue.push(queue.shift() as T);
      }
    }
    last = queue.shift() as T;
    return last;
  };
};
