import { describe, expect, it } from 'vitest';

import CodeRain from './CodeRain';
import { axe } from '../../../test/axe';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('CodeRain', () => {
  it('hides the decorative canvas and keeps a text alternative', async () => {
    // jsdom has no 2D context, so this also proves the effect bails out quietly.
    const { container } = renderWithProviders(<CodeRain />);

    const canvas = container.querySelector('canvas');
    expect(canvas?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('.sr-only')?.textContent).not.toBe('');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('only reveals the rain once popIn is set', () => {
    const { container, rerender } = renderWithProviders(<CodeRain popIn={false} />);
    expect(container.querySelector('.code-rain')).not.toHaveClass('is-visible');

    rerender(<CodeRain popIn />);
    expect(container.querySelector('.code-rain')).toHaveClass('is-visible');
  });
});
