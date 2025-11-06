import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_STATE_NUMBER, TOP_MENU } from '../../../constants';
import type { TopMenuType } from '../../../types';

const useHeader = () => {
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
