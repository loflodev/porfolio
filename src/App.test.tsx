import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from './App';
import { ROUTES } from './constants';
import { axe } from './test/axe';
import { renderWithProviders } from './test/renderWithProviders';

const EXPECTED_H1: Record<string, string> = {
  '/': 'About me',
  '/resume': 'Resume',
  '/portfolio': 'Portfolio',
  '/blog': 'Blog',
  '/pricing': 'Pricing',
  '/contact': 'Contact',
};

describe.each(ROUTES.map((route) => route.path))('route %s', (path) => {
  it('renders exactly one h1 naming the page, inside <main>', async () => {
    renderWithProviders(<App />, { route: path });

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(EXPECTED_H1[path]);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1 })).toBe(heading);
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<App />, { route: path });
    await screen.findByRole('heading', { level: 1 });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('unknown routes', () => {
  it('render the not-found page with a link home', async () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});

describe('layout', () => {
  it('offers a skip link to the main content', async () => {
    renderWithProviders(<App />);
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main-content'
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('labels the social icon links', async () => {
    renderWithProviders(<App />);
    await screen.findByRole('heading', { level: 1 });

    for (const name of ['GitHub', 'Instagram', 'LinkedIn']) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('target', '_blank');
    }
  });

  it('exposes the sidebar contacts toggle state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await screen.findByRole('heading', { level: 1 });

    const toggle = screen.getByRole('button', { name: 'Show Contacts' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
