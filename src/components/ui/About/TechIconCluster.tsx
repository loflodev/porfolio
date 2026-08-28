import { useEffect, useRef } from 'react';
import type { IconType } from 'react-icons';
import {
  SiClaude,
  SiCss,
  SiExpress,
  SiFigma,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPhp,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiVuedotjs,
  SiWordpress,
} from 'react-icons/si';

import useTranslation from '../../../hooks/useTransalation';

type TechIcon = {
  Icon: IconType;
  name: string;
  bg: string;
  fg: string;
};

const TECH_ICONS: TechIcon[] = [
  { Icon: SiTypescript, name: 'TypeScript', bg: '#3178c6', fg: '#ffffff' },
  { Icon: SiJavascript, name: 'JavaScript', bg: '#f7df1e', fg: '#1e1e1e' },
  { Icon: SiPython, name: 'Python', bg: '#3776ab', fg: '#ffffff' },
  { Icon: SiPhp, name: 'PHP', bg: '#787cb5', fg: '#ffffff' },
  { Icon: SiHtml5, name: 'HTML5', bg: '#e34f26', fg: '#ffffff' },
  { Icon: SiCss, name: 'CSS3', bg: '#1572b6', fg: '#ffffff' },
  { Icon: SiMongodb, name: 'MongoDB', bg: '#47a248', fg: '#ffffff' },
  { Icon: SiExpress, name: 'Express', bg: '#2d2d2d', fg: '#ffffff' },
  { Icon: SiReact, name: 'React', bg: '#20232a', fg: '#61dafb' },
  { Icon: SiNodedotjs, name: 'NodeJS', bg: '#339933', fg: '#ffffff' },
  { Icon: SiWordpress, name: 'WordPress', bg: '#21759b', fg: '#ffffff' },
  { Icon: SiFigma, name: 'Figma', bg: '#f24e1e', fg: '#ffffff' },
  { Icon: SiClaude, name: 'Claude', bg: '#d97757', fg: '#ffffff' },
  { Icon: SiTailwindcss, name: 'Tailwind CSS', bg: '#06b6d4', fg: '#ffffff' },
  { Icon: SiGit, name: 'Git', bg: '#f05032', fg: '#ffffff' },
  { Icon: SiVite, name: 'Vite', bg: '#646cff', fg: '#ffffff' },
  { Icon: SiVuedotjs, name: 'Vue.js', bg: '#4fc08d', fg: '#ffffff' },
];

// Columns hold 2 icons each (the list length may be odd, so the last column
// gets the remainder); alternating columns are vertically offset in CSS so
// the stacks interlock like a honeycomb grid.
const COLUMN_SIZE = 2;
const EMPTY = 0;
const COLUMN_PATTERN: number[] = [];
for (let remaining = TECH_ICONS.length; remaining > EMPTY; remaining -= COLUMN_SIZE) {
  COLUMN_PATTERN.push(Math.min(COLUMN_SIZE, remaining));
}

const COLUMNS: { items: TechIcon[]; startIndex: number }[] = [];
let cursor = 0;
for (const size of COLUMN_PATTERN) {
  COLUMNS.push({ items: TECH_ICONS.slice(cursor, cursor + size), startIndex: cursor });
  cursor += size;
}

const ATTRACT_RADIUS = 60;
const MAX_PULL = 12;
const FULL_STRENGTH = 1;
const CENTER_RATIO = 0.5;
const NO_DISTANCE = 0;

type TechIconClusterProps = {
  popIn?: boolean;
};

const TechIconCluster = ({ popIn = true }: TechIconClusterProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const magneticRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resetBubbles = () => {
      magneticRefs.current.forEach((el) => {
        if (el) el.style.transform = 'translate(0px, 0px)';
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      magneticRefs.current.forEach((el) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width * CENTER_RATIO;
        const centerY = rect.top + rect.height * CENTER_RATIO;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance < ATTRACT_RADIUS) {
          const pull = (FULL_STRENGTH - distance / ATTRACT_RADIUS) * MAX_PULL;
          const offsetX = distance === NO_DISTANCE ? NO_DISTANCE : (dx / distance) * pull;
          const offsetY = distance === NO_DISTANCE ? NO_DISTANCE : (dy / distance) * pull;
          el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        } else {
          el.style.transform = 'translate(0px, 0px)';
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', resetBubbles);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', resetBubbles);
    };
  }, []);

  return (
    <div className="tech-bubbles-wrap">
      <div
        className={`tech-bubbles${popIn ? ' is-visible' : ''}`}
        ref={containerRef}
        aria-hidden="true"
      >
        {COLUMNS.map(({ items, startIndex }, colIndex) => (
          <ul className="tech-bubble-col" key={`col-${colIndex}`}>
            {items.map(({ Icon, name, bg, fg }, itemIndex) => {
              const index = startIndex + itemIndex;
              return (
                <li
                  key={name}
                  className="tech-bubble"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <span
                    className="tech-magnetic"
                    ref={(el) => {
                      magneticRefs.current[index] = el;
                    }}
                  >
                    <span className="tech-bubble-circle" style={{ background: bg, color: fg }}>
                      <Icon title={name} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      <span className="sr-only">{t('aboutPage.description2')}</span>
    </div>
  );
};

export default TechIconCluster;
