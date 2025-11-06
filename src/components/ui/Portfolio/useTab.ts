import { useState } from 'react';

import { DEFAULT_ACTIVE_TAB, PORTFOLIO } from '../../../constants';
import type { TabType } from '../../../types';

const useTab = () => {
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_ACTIVE_TAB);

  const filteredCategory: TabType[] = [...new Set(PORTFOLIO.map((item) => item.category))].map(
    (cat) => ({
      title: cat,
      index: false,
    })
  );

  const [category, setCategory] = useState<TabType[]>([
    { title: 'all', index: true },
    ...filteredCategory,
  ]);

  const handleTabSelect = (index: number) => {
    setActiveIndex(index);

    setCategory((prev) => {
      return prev.map((item, i) => (i === index ? { ...item, index: true } : item));
    });
  };
  return { category, setCategory, handleTabSelect, activeIndex };
};

export default useTab;
