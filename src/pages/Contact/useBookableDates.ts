import { useCallback, useEffect, useState } from 'react';

import { fetchBookableDates } from '../../services/api/consultation';
import { weekdaysInWindow } from '../../utils/consultationDates';

const FIRST_LOAD = 0;
const NEXT = 1;

export type BookableDatesStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * The YYYY-MM-DD dates the calendar lets visitors pick, loaded while `enabled`. Falls back to the
 * weekdays of the booking window when the server can't say which days are fully booked.
 */
const useBookableDates = (enabled: boolean) => {
  const [dates, setDates] = useState<ReadonlySet<string>>(() => new Set());
  const [status, setStatus] = useState<BookableDatesStatus>('idle');
  const [reloadCount, setReloadCount] = useState(FIRST_LOAD);

  useEffect(() => {
    if (!enabled) return undefined;

    let isCurrent = true;
    setStatus('loading');

    fetchBookableDates()
      .then((nextDates) => {
        if (isCurrent) {
          setDates(new Set(nextDates));
          setStatus('ready');
        }
        return undefined;
      })
      .catch(() => {
        if (isCurrent) {
          setDates(new Set(weekdaysInWindow()));
          setStatus('error');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [enabled, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + NEXT), []);

  return { dates, status, reload };
};

export default useBookableDates;
