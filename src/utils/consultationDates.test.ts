import { describe, expect, it } from 'vitest';

import { consultationDateRange } from './consultationDates';

describe('consultationDateRange', () => {
  it("spans Montreal's today to 60 days later", () => {
    // 02:00 UTC on the 27th is still the evening of the 26th in Montreal.
    expect(consultationDateRange(Date.parse('2026-10-27T02:00:00Z'))).toEqual({
      min: '2026-10-26',
      max: '2026-12-25',
    });
  });
});
