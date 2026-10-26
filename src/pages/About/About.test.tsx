import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import About from './About';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('About page', () => {
  it('opens a testimonial from the keyboard and returns focus on close', async () => {
    const user = userEvent.setup();
    renderWithProviders(<About />);

    const trigger = screen.getByRole('button', { name: 'Guise S' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog', { name: 'Guise S' })).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('renders section headings below the page h1', () => {
    renderWithProviders(<About />);

    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(expect.arrayContaining(["What I'm doing", 'Testimonials', 'Clients']));
  });

  it('treats service icons as decorative and links clients that have a site', () => {
    renderWithProviders(<About />);

    expect(screen.queryByRole('img', { name: 'Web Design' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'JD Pet Place' })).toHaveAttribute(
      'href',
      'https://jdpetplace.com/'
    );
    // Assurelis has no site: logo only, not a dead "#" link.
    expect(screen.getByRole('img', { name: 'Assurelis' }).closest('a')).toBeNull();
  });
});
