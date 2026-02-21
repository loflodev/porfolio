import { useState } from 'react';

import { DEFAULT_STATE_NUMBER } from '../../constants';
import useTranslation from '../../hooks/useTransalation';
import type { PortfolioType, TabType } from '../../types';

const usePortfolio = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_STATE_NUMBER);

  const portfolio: PortfolioType[] = [
    {
      to: '#',
      image: '/src/assets/images/project-1.webp',
      title: 'Rafaela Chic Shop',
      category: t('webDesign'),
      alt: 'Rafeal Chic Shop',
    },
    {
      to: '#',
      image: '/src/assets/images/project-2.webp',
      title: 'PA Real Estate Queen',
      category: t('webDesign'),
      alt: 'PA Real Estate Queen',
    },
    {
      to: '#',
      image: '/src/assets/images/project-3.webp',
      title: 'Yoopikids',
      category: t('webDesign'),
      alt: 'Yoopikids',
    },
    {
      to: 'https://boissonsolutionx.ca',
      image: '/src/assets/images/project-4.webp',
      title: 'Boisson SolutionX',
      category: t('webDevelopment'),
      alt: 'Boisson SolutionX',
    },
    {
      to: 'https://safrozen.com/',
      image: '/src/assets/images/project-5.webp',
      title: 'Les Alimitent Safrozen Foods',
      category: t('webDesign'),
      alt: 'Les Alimitent Safrozen Foods',
    },
    {
      to: 'https://github.com/loflodev/assurelis-v1/',
      image: '/src/assets/images/project-6.webp',
      title: 'Assurelis',
      category: t('webDevelopment'),
      alt: 'Assurelis',
    },
  ];

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
