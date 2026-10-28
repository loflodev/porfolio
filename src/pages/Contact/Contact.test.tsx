import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Contact from './Contact';
import {
  bookConsultation,
  fetchBookableDates,
  fetchConsultationSlots,
} from '../../services/api/consultation';
import { saveContactForm } from '../../services/api/contactForm';
import { renderWithProviders } from '../../test/renderWithProviders';
import { fromIsoDate, toIsoDate, weekdaysInWindow } from '../../utils/consultationDates';

vi.mock('../../services/api/contactForm', () => ({ saveContactForm: vi.fn() }));
vi.mock('../../services/api/consultation', () => ({
  fetchConsultationSlots: vi.fn(),
  fetchBookableDates: vi.fn(),
  bookConsultation: vi.fn(),
}));

const save = vi.mocked(saveContactForm);
const fetchSlots = vi.mocked(fetchConsultationSlots);
const book = vi.mocked(bookConsultation);
const fetchDates = vi.mocked(fetchBookableDates);

const open = (...times: string[]) => times.map((time) => ({ time, available: true }));
const booked = (...times: string[]) => times.map((time) => ({ time, available: false }));

// The calendar opens on the current month; the second weekday of the window is always in it or
// one "next month" click away, so tests pick that one.
const [, OPEN_DAY, FULL_DAY] = weekdaysInWindow();
const SATURDAY = 6;
const WEEK = 7;
const LAZY_LOAD_MS = 5000;

const dayButton = (date: string) =>
  document.querySelector<HTMLButtonElement>(`[data-day="${date}"] button`);

const dateField = () => screen.getByRole('button', { name: /^Preferred date/ });

// Opens the calendar popover from the date field and shows the month holding `date`.
const openCalendarAt = async (user: ReturnType<typeof userEvent.setup>, date: string) => {
  await waitFor(() => expect(fetchDates).toHaveBeenCalled());
  await user.click(dateField());
  await screen.findByRole('dialog', { name: 'Preferred date' });
  // The calendar is lazy-loaded; the first import in a run can take over a second.
  await waitFor(() => expect(document.querySelector('[data-day]')).not.toBeNull(), {
    timeout: LAZY_LOAD_MS,
  });
  if (!dayButton(date)) {
    await user.click(screen.getByRole('button', { name: /next month/i }));
  }
};

const pickDay = async (user: ReturnType<typeof userEvent.setup>, date: string) => {
  await openCalendarAt(user, date);
  await waitFor(() => expect(dayButton(date)).toBeEnabled());
  await user.click(dayButton(date) as HTMLButtonElement);
};

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Your Message'), 'I would like a website.');
};

afterEach(() => {
  save.mockReset();
  fetchSlots.mockReset();
  fetchDates.mockReset();
  book.mockReset();
});

beforeEach(() => {
  fetchDates.mockResolvedValue([OPEN_DAY]);
  fetchSlots.mockResolvedValue([]);
});

const chooseConsultation = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.selectOptions(screen.getByLabelText('Subject'), 'consultation');
};

describe('Contact page', () => {
  it('preselects the subject from the query string and scrolls to the form', async () => {
    fetchSlots.mockResolvedValue([]);
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderWithProviders(<Contact />, { route: '/contact?subject=consultation' });

    await waitFor(() => expect(screen.getByLabelText('Subject')).toHaveValue('consultation'));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('ignores an unknown subject in the query string', () => {
    renderWithProviders(<Contact />, { route: '/contact?subject=nope' });

    expect(screen.getByLabelText('Subject')).toHaveValue('general');
  });

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

  it('swaps the message for a calendar and the times of the picked day on Consultation', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue([...booked('09:00'), ...open('09:30')]);
    renderWithProviders(<Contact />);

    await chooseConsultation(user);

    expect(screen.queryByLabelText('Your Message')).not.toBeInTheDocument();
    expect(dateField()).toHaveAttribute('aria-expanded', 'false');
    expect(dateField()).toHaveTextContent('Select a date');
    expect(screen.queryByRole('dialog', { name: 'Preferred date' })).not.toBeInTheDocument();
    const time = screen.getByLabelText('Preferred time');
    expect(time).toBeDisabled();
    expect(time).toHaveDisplayValue('Pick a date first');

    await pickDay(user, OPEN_DAY);

    expect(screen.queryByRole('dialog', { name: 'Preferred date' })).not.toBeInTheDocument();
    expect(dateField()).toHaveFocus();
    expect(dateField()).not.toHaveTextContent('Select a date');
    await waitFor(() => expect(time).toBeEnabled());
    expect(fetchSlots).toHaveBeenLastCalledWith(OPEN_DAY);
    expect(screen.getByRole('option', { name: '09:30' })).toBeEnabled();
    expect(screen.getByRole('option', { name: '09:00 — booked' })).toBeDisabled();
    expect(time).toHaveAccessibleDescription(/Montreal time/);
  });

  it('disables weekends and days the server says are fully booked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await openCalendarAt(user, OPEN_DAY);

    await waitFor(() => expect(dayButton(OPEN_DAY)).toBeEnabled());
    expect(dayButton(FULL_DAY)).toBeDisabled();
    const saturday = fromIsoDate(OPEN_DAY);
    saturday.setDate(saturday.getDate() + ((SATURDAY - saturday.getDay() + WEEK) % WEEK));
    if (!dayButton(toIsoDate(saturday))) {
      await user.click(screen.getByRole('button', { name: /next month/i }));
    }
    expect(dayButton(toIsoDate(saturday))).toBeDisabled();
  });

  it('closes the calendar on Escape and on a click outside', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await openCalendarAt(user, OPEN_DAY);
    expect(dateField()).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(document.activeElement).toHaveClass('rdp-day_button'));

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Preferred date' })).not.toBeInTheDocument();
    expect(dateField()).toHaveFocus();

    await user.click(dateField());
    expect(await screen.findByRole('dialog', { name: 'Preferred date' })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Full Name'));
    expect(screen.queryByRole('dialog', { name: 'Preferred date' })).not.toBeInTheDocument();
  });

  it('falls back to weekdays when the open days cannot be loaded', async () => {
    const user = userEvent.setup();
    fetchDates.mockRejectedValue(new Error('offline'));
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await openCalendarAt(user, FULL_DAY);

    expect(
      await screen.findByText(/Couldn't check which days are fully booked/)
    ).toBeInTheDocument();
    await waitFor(() => expect(dayButton(FULL_DAY)).toBeEnabled());
    await user.click(dayButton(FULL_DAY) as HTMLButtonElement);
    expect(fetchSlots).toHaveBeenLastCalledWith(FULL_DAY);
  });

  it('says when a day has no times left', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(booked('09:00'));
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await pickDay(user, OPEN_DAY);

    expect(
      await screen.findByRole('option', {
        name: 'No times left that day. Please pick another date.',
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Preferred time')).toBeDisabled();
  });

  it('requires a date and a time for a consultation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(dateField()).toHaveAccessibleDescription('This field is required');
    expect(screen.getByLabelText('Preferred time')).toHaveAttribute('aria-invalid', 'true');
    expect(book).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('books the consultation and confirms the date and time', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(open('09:00', '09:30'));
    book.mockResolvedValue({ success: true });
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await pickDay(user, OPEN_DAY);
    await waitFor(() => expect(screen.getByLabelText('Preferred time')).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Preferred time'), '09:30');
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(book).toHaveBeenCalledWith({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      consultationDate: OPEN_DAY,
      consultationTime: '09:30',
      website: '',
    });
    expect(save).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog', { name: 'Consultation booked!' });
    expect(dialog).toHaveTextContent(`${OPEN_DAY} at 09:30`);
    await waitFor(() => expect(screen.getByLabelText('Subject')).toHaveValue('general'));
  });

  it('asks for another time and reloads times and days when the slot was just taken', async () => {
    const user = userEvent.setup();
    fetchSlots.mockResolvedValue(open('09:00', '09:30'));
    book.mockResolvedValue({ success: false, error: 'errors.slotTaken' });
    renderWithProviders(<Contact />);

    await chooseConsultation(user);
    await pickDay(user, OPEN_DAY);
    await waitFor(() => expect(screen.getByLabelText('Preferred time')).toBeEnabled());
    await user.selectOptions(screen.getByLabelText('Preferred time'), '09:30');
    fetchSlots.mockResolvedValue([...open('09:00'), ...booked('09:30')]);
    const dateLoads = fetchDates.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Book Consultation' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, that time was just booked. Please pick another one.'
    );
    await waitFor(() =>
      expect(screen.getByRole('option', { name: '09:30 — booked' })).toBeDisabled()
    );
    expect(screen.getByLabelText('Preferred time')).toHaveValue('');
    expect(fetchDates.mock.calls.length).toBeGreaterThan(dateLoads);
  });
});
