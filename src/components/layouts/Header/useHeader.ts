import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

const NO_ACTIVE_INDEX = -1;

const useHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const TOP_MENU: TopMenuType[] = [
    {
      label: t('about'),
      to: '/',
      index: false,
    },
    {
      label: t('resume'),
      to: '/resume',
      index: false,
    },
    {
      label: t('portfolio'),
      to: '/portfolio',
      index: false,
    },
    {
      label: t('blog'),
      to: '/blog',
      index: false,
    },
  ];

  const MORE_MENU: TopMenuType[] = [
    {
      label: t('contact'),
      to: '/contact',
      index: false,
    },
    {
      label: t('pricing'),
      to: '/pricing',
      index: false,
    },
  ];

  // Get initial index based on current URL path; -1 when the current route lives under "More"
  const getInitialIndex = (): number => {
    const currentPath = location.pathname;
    return TOP_MENU.findIndex((item) => item.to === currentPath);
  };

  const [activeIndex, setActiveIndex] = useState<number>(getInitialIndex);
  const [menu, setMenu] = useState<TopMenuType[]>(TOP_MENU);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const isMoreActive = MORE_MENU.some((item) => item.to === location.pathname);

  const handleTopMenu = (current: number, to: string) => {
    setActiveIndex(current);
    navigate(to);
    setMenu((prev) => {
      return prev.map((item, index) => (index === current ? { ...item, index: true } : item));
    });
  };

  const toggleMoreMenu = () => {
    setIsMoreOpen((prev) => !prev);
  };

  const closeMoreMenu = () => {
    setIsMoreOpen(false);
  };

  const handleMoreMenu = (to: string) => {
    setActiveIndex(NO_ACTIVE_INDEX);
    navigate(to);
    closeMoreMenu();
  };

  return {
    menu,
    moreMenu: MORE_MENU,
    handleTopMenu,
    handleMoreMenu,
    activeIndex,
    isMoreOpen,
    isMoreActive,
    toggleMoreMenu,
    closeMoreMenu,
  };
};

export default useHeader;
