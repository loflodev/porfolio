import { useState } from 'react';

import { DEFAULT_STATE_NUMBER, PORTFOLIO } from '../../../constants';
import type { TabType } from '../../../types';

const useTab = () => {
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_STATE_NUMBER);

  const filteredCategory: TabType[] = [...new Set(PORTFOLIO.map((item) => item.category))].map(
    (cat) => ({
      title: cat,
      isSelected: false,
    })
  );

  const [category, setCategory] = useState<TabType[]>([
    { title: 'all', isSelected: true },
    ...filteredCategory,
  ]);

  const handleTabSelect = (index: number) => {
    setActiveIndex(index);

    setCategory((prev) => {
      return prev.map((item, i) => (i === index ? { ...item, isSelected: true } : item));
    });
  };
  return { category, setCategory, handleTabSelect, activeIndex };
};

export default useTab;
