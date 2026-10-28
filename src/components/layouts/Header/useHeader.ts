import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

// The bar shows every item up to this count; past it, the last slot becomes "More" and holds
// the overflow, so the bar never shows more than MAX_VISIBLE_ITEMS entries.
export const MAX_VISIBLE_ITEMS = 5;
const MORE_SLOT = 1;

export const splitMenu = (items: TopMenuType[], max = MAX_VISIBLE_ITEMS) => {
  if (items.length <= max) {
    return { menu: items, moreMenu: [] };
  }

  const visibleCount = max - MORE_SLOT;
  return {
    menu: items.filter((_, index) => index < visibleCount),
    moreMenu: items.filter((_, index) => index >= visibleCount),
  };
};

const useHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  // Contact is reached from Pricing (consultation and plan CTAs), not from the bar.
  const items: TopMenuType[] = [
    { label: t('about'), to: '/' },
    { label: t('resume'), to: '/resume' },
    { label: t('portfolio'), to: '/portfolio' },
    { label: t('blog'), to: '/blog' },
    { label: t('pricing'), to: '/pricing' },
  ];

  const { menu, moreMenu } = splitMenu(items);

  const isMoreActive = moreMenu.some((item) => item.to === location.pathname);

  const toggleMoreMenu = useCallback(() => {
    setIsMoreOpen((prev) => !prev);
  }, []);

  const closeMoreMenu = useCallback(() => {
    setIsMoreOpen(false);
  }, []);

  return {
    menu,
    moreMenu,
    isMoreOpen,
    isMoreActive,
    toggleMoreMenu,
    closeMoreMenu,
  };
};

export default useHeader;
