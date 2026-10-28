import { useCallback, useEffect, useState } from 'react';

import { fetchConsultationSlots, type ConsultationSlot } from '../../services/api/consultation';

const FIRST_LOAD = 0;
const NEXT = 1;

export type SlotsStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Loads the consultation times of `date`, each marked available or not; idle without a date. */
const useConsultationSlots = (date: string) => {
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [status, setStatus] = useState<SlotsStatus>('idle');
  const [reloadCount, setReloadCount] = useState(FIRST_LOAD);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      setStatus('idle');
      return undefined;
    }

    let isCurrent = true;
    setStatus('loading');

    fetchConsultationSlots(date)
      .then((nextSlots) => {
        if (isCurrent) {
          setSlots(nextSlots);
          setStatus('ready');
        }
        return undefined;
      })
      .catch(() => {
        if (isCurrent) {
          setSlots([]);
          setStatus('error');
        }
      });

    // A late answer for a date the visitor already changed must not overwrite the new one.
    return () => {
      isCurrent = false;
    };
  }, [date, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + NEXT), []);

  return { slots, status, reload };
};

export default useConsultationSlots;
