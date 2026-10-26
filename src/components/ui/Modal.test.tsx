import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import Modal from './Modal';
import { axe } from '../../test/axe';
import { renderWithProviders } from '../../test/renderWithProviders';

const DATA = { title: 'Guise S', description: 'Great work.', icon: '/avatar.png' };

const Harness = ({ notification }: { notification?: 'message' | 'popup' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        data={DATA}
        showModal={open}
        handleModal={() => setOpen((prev) => !prev)}
        notification={notification}
      />
    </>
  );
};

const getDialog = () => screen.getByRole<HTMLDialogElement>('dialog', { hidden: true });

describe('Modal', () => {
  it('is closed until opened, then labelled by its title', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    expect(getDialog()).not.toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = screen.getByRole('dialog', { name: 'Guise S' });
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByText('Great work.')).toBeInTheDocument();
  });

  it('closes from its labelled close button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(getDialog()).not.toHaveAttribute('open');
  });

  it('syncs state when the browser closes it (Escape / backdrop)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    getDialog().close();
    // Re-opening proves state was reset to closed rather than left stale at "open".
    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(getDialog()).toHaveAttribute('open');
  });

  it('closes on a backdrop click', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(container.querySelector('.overlay')!);

    expect(getDialog()).not.toHaveAttribute('open');
  });

  it('uses the person as avatar alt text and hides the decorative quote icon', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('img', { name: 'Guise S' })).toHaveAttribute('src', '/avatar.png');
    expect(screen.getAllByRole('presentation')).toHaveLength(1);
  });

  it('omits the avatar for message notifications', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness notification="message" />);
    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.queryByRole('img', { name: 'Guise S' })).not.toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
