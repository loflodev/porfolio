import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Contact from './Contact';
import { bookConsultation, fetchConsultationSlots } from '../../services/api/consultation';
import { saveContactForm } from '../../services/api/contactForm';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../services/api/contactForm', () => ({ saveContactForm: vi.fn() }));
vi.mock('../../services/api/consultation', () => ({
  fetchConsultationSlots: vi.fn(),
  bookConsultation: vi.fn(),
}));

const save = vi.mocked(saveContactForm);
const fetchSlots = vi.mocked(fetchConsultationSlots);
const book = vi.mocked(bookConsultation);

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Your Message'), 'I would like a website.');
};

afterEach(() => {
  save.mockReset();
  fetchSlots.mockReset();
  book.mockReset();
});

const chooseConsultation = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.selectOptions(screen.getByLabelText('Subject'), 'consultation');
};

describe('Contact page', () => {
  it('labels every field and titles the map', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Your Message').tagName).toBe('TEXTAREA');
    const map = screen.getByTitle('Map of Repentigny, Quebec');
    expect(map.getAttribute('src')).toContain('!1sen!2sca!4v');
    expect(map.getAttribute('src')).not.toContain('es-419');
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
      expect(field).toHaveAccessibleDescription('This field is required');
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

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Please enter a valid email address'
    );
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
      subject: 'general',
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
    save.mockResolvedValue({ success: false, error: 'errors.network' });
    renderWithProviders(<Contact />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Network problem. Please check your connection and try again.'
    );
    expect(screen.getByLabelText('Full Name')).toHaveValue('Ada Lovelace');
  });

  it('defaults the subject to General Inquiry and lists every subject', () => {
    renderWithProviders(<Contact />);

    const subject = screen.getByLabelText('Subject');
    expect(subject).toHaveValue('general');
    expect(Array.from((subject as HTMLSelectElement).options).map((option) => option.text)).toEqual(
      ['General Inquiry', 'Consultation', 'Join the Team', 'Report an Issue']
    );
  });

  it('sends the chosen subject with a normal message', async () => {
    const user = userEvent.setup();
    save.mockResolvedValue({ success: true });
    renderWithProviders(<Contact />);

    await fill(user);
    await user.selectOptions(screen.getByLabelText('Subject'), 'reportIssue');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ subject: 'reportIssue' }));
  });

  it('swaps the message for a date and the open times of that day on Consultation', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(['09:00', '09:30']);
    renderWithProviders(<Contact />);

    await chooseConsultation(user);

    expect(screen.queryByLabelText('Your Message')).not.toBeInTheDocument();
    const time = screen.getByLabelText('Preferred time');
    expect(time).toBeDisabled();
    expect(time).toHaveDisplayValue('Pick a date first');

    await user.type(screen.getByLabelText('Preferred date'), '2030-01-07');

    await waitFor(() => expect(time).toBeEnabled());
    expect(fetchSlots).toHaveBeenLastCalledWith('2030-01-07');
    expect(screen.getByRole('option', { name: '09:30' })).toBeInTheDocument();
    expect(time).toHaveAccessibleDescription(/Montreal time/);
  });

  it('says when a day has no open times', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue([]);
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await user.type(screen.getByLabelText('Preferred date'), '2030-01-05');

    expect(
      await screen.findByRole('option', { name: 'No times available that day (weekdays only)' })
    ).toBeInTheDocument();
  });

  it('requires a date and a time for a consultation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(screen.getByLabelText('Preferred date')).toHaveAccessibleDescription(
      'This field is required'
    );
    expect(screen.getByLabelText('Preferred time')).toHaveAttribute('aria-invalid', 'true');
    expect(book).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('books the consultation and confirms the date and time', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(['09:00', '09:30']);
    book.mockResolvedValue({ success: true });
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await user.type(screen.getByLabelText('Preferred date'), '2030-01-07');
    await waitFor(() => expect(screen.getByLabelText('Preferred time')).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Preferred time'), '09:30');
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(book).toHaveBeenCalledWith({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      consultationDate: '2030-01-07',
      consultationTime: '09:30',
      website: '',
    });
    expect(save).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog', { name: 'Consultation booked!' });
    expect(dialog).toHaveTextContent('2030-01-07 at 09:30');
    await waitFor(() => expect(screen.getByLabelText('Subject')).toHaveValue('general'));
  });

  it('asks for another time and reloads the times when the slot was just taken', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(['09:00', '09:30']);
    book.mockResolvedValue({ success: false, error: 'errors.slotTaken' });
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await user.type(screen.getByLabelText('Preferred date'), '2030-01-07');
    await waitFor(() => expect(screen.getByLabelText('Preferred time')).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Preferred time'), '09:30');
    fetchSlots.mockResolvedValue(['09:00']);
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, that time was just booked. Please pick another one.'
    );
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: '09:30' })).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('Preferred time')).toHaveValue('');
  });
});
