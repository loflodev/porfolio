import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Navbar from './Navbar';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { splitMenu } from '../Header/useHeader';

// One more page than the bar holds, so the last two land in the More menu.
const ITEMS = [
  { label: 'About', to: '/' },
  { label: 'Resume', to: '/resume' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
  { label: 'Pricing', to: '/pricing' },
];

const OverflowingNavbar = () => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { menu, moreMenu } = splitMenu(ITEMS);

  return (
    <Navbar
      navbarMenu={menu}
      moreMenu={moreMenu}
      isMoreOpen={isMoreOpen}
      isMoreActive={moreMenu.some((item) => item.to === location.pathname)}
      toggleMoreMenu={() => setIsMoreOpen((prev) => !prev)}
      closeMoreMenu={() => setIsMoreOpen(false)}
    />
  );
};

const renderNavbar = () => renderWithProviders(<OverflowingNavbar />);

describe('Navbar More menu', () => {
  it('keeps the overflow links in the DOM (hidden) so crawlers can follow them', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Contact', hidden: true })).toHaveAttribute(
      'href',
      '/contact'
    );
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  });

  it('opens the More menu, closes it on Escape and returns focus', async () => {
    const user = userEvent.setup();
    renderNavbar();
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
    renderNavbar();

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('link', { name: 'Pricing' }));

    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveClass('active');
  });

  it('closes the More menu on an outside click', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(document.body);

    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });
});
