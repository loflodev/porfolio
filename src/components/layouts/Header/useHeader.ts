import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_STATE_NUMBER } from '../../../constants';
import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

const useHeader = () => {
  const { t } = useTranslation();
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
    {
      label: t('contact'),
      to: '/contact',
      index: false,
    },
  ];
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_STATE_NUMBER);
  const [menu, setMenu] = useState<TopMenuType[]>(TOP_MENU);
  const navigate = useNavigate();

  const handleTopMenu = (current: number, to: string) => {
    setActiveIndex(current);
    navigate(to);
    setMenu((prev) => {
      return prev.map((item, index) => (index === current ? { ...item, index: true } : item));
    });
  };
  return { menu, handleTopMenu, activeIndex };
};

export default useHeader;
