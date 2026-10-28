import { useState } from 'react';

import { DEFAULT_STATE_NUMBER } from '../../constants';
import { PROJECTS, translateProject } from '../../constants/projects';
import useTranslation from '../../hooks/useTransalation';
import type { TabType } from '../../types';

const usePortfolio = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_STATE_NUMBER);

  const portfolio = PROJECTS.map((item) => translateProject(item, t));

  const filteredCategory: TabType[] = [...new Set(portfolio.map((item) => item.category))].map(
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
  return { category, portfolio, setCategory, handleTabSelect, activeIndex };
};

export default usePortfolio;
