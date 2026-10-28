import { describe, expect, it } from 'vitest';

import {
  availableSlots,
  isBookableSlot,
  isValidDate,
  listDaySlots,
  slotStartsAt,
  todayInZone,
} from './consultation-slots';

// Monday 26 October 2026, 08:00 in Montreal (EDT, UTC-4).
const NOW = Date.parse('2026-10-26T12:00:00Z');
const NONE = new Set<string>();

describe('consultation slots', () => {
  it('offers 30-minute slots from 9:00 to 16:30 on weekdays only', () => {
    const slots = listDaySlots('2026-10-27');

    expect(slots).toHaveLength(16);
    expect(slots[0]).toBe('09:00');
    expect(slots[1]).toBe('09:30');
    expect(slots.at(-1)).toBe('16:30');
    expect(listDaySlots('2026-10-31')).toEqual([]); // Saturday
    expect(listDaySlots('2026-11-01')).toEqual([]); // Sunday
  });

  it('converts Montreal time to UTC across the daylight saving change', () => {
    expect(new Date(slotStartsAt('2026-10-27', '09:00')).toISOString()).toBe(
      '2026-10-27T13:00:00.000Z'
    );
    expect(new Date(slotStartsAt('2026-11-03', '09:00')).toISOString()).toBe(
      '2026-11-03T14:00:00.000Z'
    );
  });

  it("uses Montreal's date for today, not UTC's", () => {
    expect(todayInZone(Date.parse('2026-10-27T02:00:00Z'))).toBe('2026-10-26');
  });

  it('hides slots starting in less than two hours', () => {
    expect(availableSlots('2026-10-26', NOW, NONE)[0]).toBe('10:00');
  });

  it('keeps bookings inside the 60-day window', () => {
    expect(availableSlots('2026-10-23', NOW, NONE)).toEqual([]);
    expect(availableSlots('2026-12-25', NOW, NONE)).not.toEqual([]);
    expect(availableSlots('2026-12-28', NOW, NONE)).toEqual([]);
  });

  it('removes taken slots', () => {
    const slots = availableSlots('2026-10-27', NOW, new Set(['09:00', '14:30']));

    expect(slots).not.toContain('09:00');
    expect(slots).not.toContain('14:30');
    expect(slots).toContain('09:30');
  });

  it('rejects malformed and impossible dates and times', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('27/10/2026')).toBe(false);
    expect(availableSlots('2026-02-30', NOW, NONE)).toEqual([]);
    expect(isBookableSlot('2026-10-27', '9:00', NOW)).toBe(false);
    expect(isBookableSlot('2026-10-27', '09:15', NOW)).toBe(false);
    expect(isBookableSlot('2026-10-27', '17:00', NOW)).toBe(false);
    expect(isBookableSlot('2026-10-27', '16:30', NOW)).toBe(true);
  });
});
