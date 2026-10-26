import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

const useHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  const menu: TopMenuType[] = [
    { label: t('about'), to: '/' },
    { label: t('resume'), to: '/resume' },
    { label: t('portfolio'), to: '/portfolio' },
    { label: t('blog'), to: '/blog' },
  ];

  const moreMenu: TopMenuType[] = [
    { label: t('contact'), to: '/contact' },
    { label: t('pricing'), to: '/pricing' },
  ];

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
