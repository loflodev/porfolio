import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Portfolio from './Portfolio';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Portfolio page', () => {
  it('names the icon-only project links and opens them in a new tab', () => {
    renderWithProviders(<Portfolio />);

    const live = screen.getByRole('link', { name: 'View Boisson SolutionX live site' });
    expect(live).toHaveAttribute('href', 'https://boissonsolutionx.ca');
    expect(live).toHaveAttribute('target', '_blank');
    expect(live).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: 'View Boisson SolutionX source code' })
    ).toBeInTheDocument();
  });

  it('exposes the selected filter with aria-pressed', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Portfolio />);
    const desktopFilters = within(container.querySelector('.filter-list') as HTMLElement);
    const [first, second] = desktopFilters.getAllByRole('button');

    expect(first).toHaveAttribute('aria-pressed', 'true');
    await user.click(second);
    expect(second).toHaveAttribute('aria-pressed', 'true');
    expect(first).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the mobile category list and closes it on Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Portfolio />);
    const toggle = screen.getByRole('button', { expanded: false, name: /all|select/i });

    expect(toggle).toHaveAttribute('aria-controls', 'portfolio-category-list');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('reserves image space and lazy-loads screenshots', () => {
    renderWithProviders(<Portfolio />);

    for (const image of screen.getAllByRole('img')) {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('width');
      expect(image).toHaveAttribute('height');
    }
  });
});
