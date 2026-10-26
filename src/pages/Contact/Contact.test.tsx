import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Contact from './Contact';
import { saveContactForm } from '../../services/api/contactForm';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../services/api/contactForm', () => ({ saveContactForm: vi.fn() }));

const save = vi.mocked(saveContactForm);

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Your Message'), 'I would like a website.');
};

afterEach(() => {
  save.mockReset();
});

describe('Contact page', () => {
  it('labels every field and titles the map', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Your Message').tagName).toBe('TEXTAREA');
    expect(screen.getByTitle('Map of Repentigny, Quebec')).toBeInTheDocument();
  });

  it('keeps submit enabled and reports every empty field on submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    const submit = screen.getByRole('button', { name: 'Send Message' });
    expect(submit).toBeEnabled();
    await user.click(submit);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
    for (const label of ['Full Name', 'Email', 'Your Message']) {
      const field = screen.getByLabelText(label);
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription('Cannot be empty');
    }
    expect(save).not.toHaveBeenCalled();
  });

  it('flags an invalid email only', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await user.type(screen.getByLabelText('Full Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Your Message'), 'Hello there');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Invalid email');
    expect(screen.getByLabelText('Full Name')).not.toHaveAttribute('aria-invalid');
    expect(save).not.toHaveBeenCalled();
  });

  it('submits valid input, shows the success dialog and resets the form', async () => {
    const user = userEvent.setup();
    let resolveSave: (value: { success: true }) => void = () => undefined;
    save.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)));
    renderWithProviders(<Contact />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(save).toHaveBeenCalledWith({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      yourMessage: 'I would like a website.',
      website: '',
    });
    const sending = screen.getByRole('button', { name: 'Sending…' });
    expect(sending).toBeDisabled();
    expect(sending.closest('form')).toHaveAttribute('aria-busy', 'true');

    resolveSave({ success: true });

    expect(
      await screen.findByRole('dialog', { name: 'Message sent successfully!' })
    ).toHaveAttribute('open');
    await waitFor(() => expect(screen.getByLabelText('Full Name')).toHaveValue(''));
  });

  it('shows the server error under the message field on failure', async () => {
    const user = userEvent.setup();
    save.mockResolvedValue({ success: false, error: 'Network Error' });
    renderWithProviders(<Contact />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network Error');
    expect(screen.getByLabelText('Full Name')).toHaveValue('Ada Lovelace');
  });
});
