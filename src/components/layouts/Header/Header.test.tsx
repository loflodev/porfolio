import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Header from './Header';
import { MAX_VISIBLE_ITEMS, splitMenu } from './useHeader';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('Header navigation', () => {
  it('renders crawlable links for every top-level page', () => {
    renderWithProviders(<Header />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume');
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
  });

  it('marks the current page with aria-current', () => {
    renderWithProviders(<Header />, { route: '/resume' });

    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });

  it('shows every page in the bar and no More menu when it fits', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
    expect(screen.queryByRole('link', { name: 'Contact', hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  });
});

describe('splitMenu', () => {
  const items = (count: number) =>
    Array.from({ length: count }, (_, index) => ({ label: `Page ${index}`, to: `/page-${index}` }));

  it(`keeps up to ${MAX_VISIBLE_ITEMS} items in the bar`, () => {
    const { menu, moreMenu } = splitMenu(items(MAX_VISIBLE_ITEMS));

    expect(menu).toHaveLength(MAX_VISIBLE_ITEMS);
    expect(moreMenu).toEqual([]);
  });

  it('moves the overflow into More, which takes the last slot', () => {
    const all = items(MAX_VISIBLE_ITEMS + 2);
    const { menu, moreMenu } = splitMenu(all);

    expect(menu).toEqual(all.slice(0, MAX_VISIBLE_ITEMS - 1));
    expect(moreMenu).toEqual(all.slice(MAX_VISIBLE_ITEMS - 1));
  });
});
