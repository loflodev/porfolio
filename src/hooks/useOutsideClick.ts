import { useEffect, type RefObject } from 'react';

const useOutsideClick = (ref: RefObject<HTMLElement | null>, onOutsideClick: () => void) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [ref, onOutsideClick]);
};

export default useOutsideClick;
