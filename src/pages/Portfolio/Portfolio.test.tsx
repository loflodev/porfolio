import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Portfolio from './Portfolio';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Portfolio page', () => {
  it('links each card to its project page, named by title and described by its summary', () => {
    renderWithProviders(<Portfolio />);

    const card = screen.getByRole('link', { name: /^Boisson SolutionX/ });
    expect(card).toHaveAttribute('href', '/portfolio/boisson-solutionx');
    expect(card).toHaveAccessibleDescription(/headless WordPress/);
  });

  it('fits the hover panel badges on one row of three, collapsing extras into +N', () => {
    renderWithProviders(<Portfolio />);

    const card = screen.getByRole('link', { name: /^Boisson SolutionX/ });
    const badges = within(card).getAllByRole('listitem', { hidden: true });
    expect(badges.map((badge) => badge.textContent)).toEqual(['React', 'TypeScript', '+6']);
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
    const { container } = renderWithProviders(<Portfolio />);
    const images = container.querySelectorAll('.project-img img');

    expect(images).toHaveLength(5);
    for (const image of images) {
      // Decorative: the card link is named by the project title and category.
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('width');
      expect(image).toHaveAttribute('height');
    }
  });
});
