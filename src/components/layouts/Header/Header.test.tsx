import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Header from './Header';
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

  it('keeps the More menu links in the DOM (hidden) so crawlers can follow them', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('link', { name: 'Contact', hidden: true })).toHaveAttribute(
      'href',
      '/contact'
    );
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });

  it('opens the More menu, closes it on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const more = screen.getByRole('button', { name: 'More' });

    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveAttribute('aria-controls', 'navbar-more-menu');

    await user.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Pricing' })).toBeVisible();

    await user.keyboard('{Escape}');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveFocus();
  });

  it('closes the More menu after choosing a page and flags More as active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('link', { name: 'Pricing' }));

    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveClass('active');
  });

  it('closes the More menu on an outside click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(document.body);

    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });
});
