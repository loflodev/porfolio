import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../Navbar/Navbar';

const DEFAULT_ACTIVE_MENU = 0;

const Header = () => {
  const [activeIndex, setActiveIndex] = useState<number>(DEFAULT_ACTIVE_MENU);
  const navigate = useNavigate();
  const menu = [
    {
      label: 'About',
      to: '/',
    },
    {
      label: 'Resume',
      to: '/resume',
    },
    {
      label: 'Portfolio',
      to: '/portfolio',
    },
    {
      label: 'Blog',
      to: '/blog',
    },
    {
      label: 'Contact',
      to: '/contact',
    },
  ];

  const isActive = (current: number, to: string) => {
    setActiveIndex(current);
    navigate(to);
  };
  return <Navbar navbarMenu={menu} onClick={isActive} activeIndex={activeIndex} />;
};

export default Header;
