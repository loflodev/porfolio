import { useState } from 'react';

import project1 from '@/assets/images/project-1.webp';
import project2 from '@/assets/images/project-2.webp';
import project3 from '@/assets/images/project-3.webp';
import project4 from '@/assets/images/project-4.webp';
import project5 from '@/assets/images/project-5.webp';
import project6 from '@/assets/images/project-6.webp';

import { DEFAULT_STATE_NUMBER } from '../../constants';
import useTranslation from '../../hooks/useTransalation';
import type { PortfolioType, TabType } from '../../types';

const usePortfolio = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_STATE_NUMBER);

  const portfolio: PortfolioType[] = [
    {
      linkTo1: 'https://boissonsolutionx.ca',
      linkTo2: 'https://github.com/loflodev/react-boissonsolutionx',
      image: project4,
      title: 'Boisson SolutionX',
      category: t('webDevelopment'),
      alt: 'Boisson SolutionX',
    },
    {
      linkTo1: '#',
      linkTo2: 'https://github.com/loflodev/assurelis-v1/',
      image: project6,
      title: 'Assurelis',
      category: t('webDevelopment'),
      alt: 'Assurelis',
    },
    {
      linkTo1: '#',
      linkTo2: '#',
      image: project1,
      title: 'Rafaela Chic Shop',
      category: t('webDesign'),
      alt: 'Rafeal Chic Shop',
    },
    {
      linkTo1: '#',
      linkTo2: '#',
      image: project2,
      title: 'PA Real Estate Queen',
      category: t('webDesign'),
      alt: 'PA Real Estate Queen',
    },
    {
      linkTo1: '#',
      linkTo2: '#',
      image: project3,
      title: 'Yoopikids',
      category: t('webDesign'),
      alt: 'Yoopikids',
    },
    {
      linkTo1: 'https://safrozen.com/',
      linkTo2: '#',
      image: project5,
      title: 'Les Alimitent Safrozen Foods',
      category: t('webDesign'),
      alt: 'Les Alimitent Safrozen Foods',
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
