import { useEffect, useState } from 'react';

import useTranslation from '../../../hooks/useTransalation';
import useTypewriter from '../../../hooks/useTypewriter';
import Section from '../Section';
import TechIconCluster from './TechIconCluster';

const NAME_HIGHLIGHT = 'Louis';
const ICONS_REVEAL_DELAY_MS = 200;
const NOT_FOUND = -1;
const START = 0;
const NEXT_CHAR = 1;
const WHITESPACE_PATTERN = /\s/;

// Swallow punctuation glued to the name (e.g. "Louis,") into the highlight span so the
// DOM boundary always falls on whitespace — otherwise browsers can wrap right before the
// comma even though there's no space to break on.
const extendPastAttachedPunctuation = (text: string, index: number) => {
  let end = index;
  while (end < text.length && !WHITESPACE_PATTERN.test(text[end])) {
    end += NEXT_CHAR;
  }
  return end;
};

const Hero = () => {
  const { t } = useTranslation();
  const fullText = t('aboutPage.description1');
  const { typedLength, isDone } = useTypewriter(fullText);
  const [iconsVisible, setIconsVisible] = useState(false);

  useEffect(() => {
    if (!isDone) return;

    const timeoutId = window.setTimeout(() => setIconsVisible(true), ICONS_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isDone]);

  const nameStart = fullText.indexOf(NAME_HIGHLIGHT);
  const nameEnd =
    nameStart === NOT_FOUND
      ? NOT_FOUND
      : extendPastAttachedPunctuation(fullText, nameStart + NAME_HIGHLIGHT.length);

  const typedContent =
    nameStart === NOT_FOUND ? (
      fullText.slice(START, typedLength)
    ) : (
      <>
        {fullText.slice(START, Math.min(typedLength, nameStart))}
        <span className="name-highlight">
          {fullText.slice(nameStart, Math.min(typedLength, nameEnd))}
        </span>
        {fullText.slice(nameEnd, typedLength)}
      </>
    );

  return (
    <Section className="about-text">
      <p className="about-typing">
        <span aria-hidden="true">
          {typedContent}
          {!isDone && <span className="typing-cursor" aria-hidden="true" />}
        </span>
        <span className="sr-only">{fullText}</span>
      </p>

      <TechIconCluster popIn={iconsVisible} />
    </Section>
  );
};

export default Hero;
