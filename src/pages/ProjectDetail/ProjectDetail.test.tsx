import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import ProjectDetail from './ProjectDetail';
import i18n from '../../lib/i18n';
import { axe } from '../../test/axe';
import { renderWithProviders } from '../../test/renderWithProviders';

const renderProject = (slug: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/portfolio/:slug" element={<ProjectDetail />} />
    </Routes>,
    { route: `/portfolio/${slug}` }
  );

afterEach(async () => {
  await i18n.changeLanguage('en');
});

const getDialog = () => screen.getByRole<HTMLDialogElement>('dialog', { hidden: true });

describe('Project detail page', () => {
  it('shows the project as the single h1 with its full stack', () => {
    renderProject('boisson-solutionx');

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Boisson SolutionX');
    expect(screen.getByRole('link', { name: 'Back to portfolio' })).toHaveAttribute(
      'href',
      '/portfolio'
    );

    const stack = screen.getByRole('heading', { level: 2, name: 'Stack' }).parentElement;
    expect(within(stack as HTMLElement).getAllByRole('listitem')).toHaveLength(8);
  });

  it('keeps every description paragraph in the page and toggles them with Read more', async () => {
    const user = userEvent.setup();
    renderProject('boisson-solutionx');
    const toggle = screen.getByRole('button', { name: 'Read more' });
    const description = document.getElementById(
      toggle.getAttribute('aria-controls') as string
    ) as HTMLElement;

    expect(description.querySelectorAll('p')).toHaveLength(4);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(description).toHaveClass('collapsed');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Read less');
    expect(description).not.toHaveClass('collapsed');
  });

  it('links to the live site and source code in a new tab', () => {
    renderProject('boisson-solutionx');

    const live = screen.getByRole('link', { name: 'View Boisson SolutionX live site' });
    expect(live).toHaveAttribute('href', 'https://boissonsolutionx.ca');
    expect(live).toHaveAttribute('target', '_blank');
    expect(live).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: 'View Boisson SolutionX source code' })
    ).toBeInTheDocument();
  });

  it('shows the case study in the active language', async () => {
    renderProject('assurelis');

    expect(screen.getByText(/^Assurelis replaces this with/)).toBeInTheDocument();

    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByText(/^Assurelis remplace ce processus/)).toBeInTheDocument();
  });

  it('hides project links that have no URL', () => {
    renderProject('izipey');

    expect(screen.queryByRole('link', { name: /live site|source code/ })).not.toBeInTheDocument();
  });

  it('lazy-loads gallery images with reserved space', () => {
    renderProject('assurelis');

    const buttons = screen.getAllByRole('button', { name: /^Open image \d of 5 full screen$/ });
    expect(buttons).toHaveLength(5);
    for (const button of buttons) {
      const image = button.querySelector('img');
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('width');
      expect(image).toHaveAttribute('height');
    }
  });

  it('opens an image full screen, pages with the arrow keys and closes on Escape', async () => {
    const user = userEvent.setup();
    renderProject('assurelis');

    expect(getDialog()).not.toHaveAttribute('open');
    const opener = screen.getByRole('button', { name: 'Open image 2 of 5 full screen' });
    await user.click(opener);

    const dialog = getDialog();
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('2 / 5')).toBeInTheDocument();
    expect(within(dialog).getByRole('img')).toHaveAccessibleName(/placeholder screenshot 1/);

    within(dialog).getByRole('button', { name: 'Close image' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByText('3 / 5')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(within(dialog).getByText('5 / 5')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Next image' }));
    expect(within(dialog).getByText('1 / 5')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close image' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('renders the not-found page for an unknown project', () => {
    renderProject('does-not-exist');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });

  it('has no axe violations', async () => {
    const { container } = renderProject('boisson-solutionx');

    expect(await axe(container)).toHaveNoViolations();
  });
});
