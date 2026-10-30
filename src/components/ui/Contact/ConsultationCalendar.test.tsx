import { describe, expect, it, vi } from 'vitest';

import ConsultationCalendar from './ConsultationCalendar';
import { renderWithProviders } from '../../../test/renderWithProviders';

const renderCalendar = (bookable: string[], value = '') =>
  renderWithProviders(
    <ConsultationCalendar
      value={value}
      onSelect={vi.fn()}
      min="2026-10-30"
      max="2026-11-27"
      bookableDates={new Set(bookable)}
      language="en"
    />
  );

describe('ConsultationCalendar', () => {
  it("opens on the first bookable day's month when the current one has none left", () => {
    renderCalendar(['2026-11-03', '2026-11-02']);

    expect(document.querySelector('[data-day="2026-11-02"] button')).toHaveFocus();
  });

  it("opens on the selected day's month", () => {
    renderCalendar(['2026-10-30', '2026-11-02'], '2026-11-02');

    expect(document.querySelector('[data-day="2026-11-02"] button')).toHaveFocus();
  });

  it('opens on the first month of the window when nothing is bookable yet', () => {
    renderCalendar([]);

    expect(document.querySelector('[data-day="2026-10-30"]')).not.toBeNull();
  });
});
