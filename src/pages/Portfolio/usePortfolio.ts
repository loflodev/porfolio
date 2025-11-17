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
      image: '/src/assets/images/project-1.jpg',
      title: 'Finance',
      category: t('webDevelopment'),
      alt: 'finance',
    },
    {
      to: '#',
      image: '/src/assets/images/project-2.png',
      title: 'Orizon',
      category: t('webDevelopment'),
      alt: 'orizon',
    },
    {
      to: '#',
      image: '/src/assets/images/project-3.jpg',
      title: 'Orizon',
      category: t('webDesign'),
      alt: 'fundo',
    },
    {
      to: '#',
      image: '/src/assets/images/project-4.png',
      title: 'Brawlhalla',
      category: t('applications'),
      alt: 'brawlhalla',
    },
    {
      to: '#',
      image: '/src/assets/images/project-5.png',
      title: 'DSM.',
      category: t('webDesign'),
      alt: 'dsm.',
    },
    {
      to: '#',
      image: '/src/assets/images/project-6.png',
      title: 'MetaSpark',
      category: t('webDesign'),
      alt: 'metaspark',
    },
    {
      to: '#',
      image: '/src/assets/images/project-7.png',
      title: 'Summary',
      category: t('webDevelopment'),
      alt: 'summary',
    },
    {
      to: '#',
      image: '/src/assets/images/project-8.jpg',
      title: 'Task Manager',
      category: t('applications'),
      alt: 'task manager',
    },
    {
      to: '#',
      image: '/src/assets/images/project-9.png',
      title: 'Arrival',
      category: t('applications'),
      alt: 'Web development',
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
