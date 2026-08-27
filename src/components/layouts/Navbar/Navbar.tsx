/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { chevronUpOutline } from 'ionicons/icons';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';

import useOutsideClick from '../../../hooks/useOutsideClick';
import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

interface NavbarProps {
  navbarMenu: TopMenuType[];
  moreMenu: TopMenuType[];
  activeIndex: number;
  isMoreOpen: boolean;
  isMoreActive: boolean;
  handleTopMenu: (value: number, to: string) => void;
  handleMoreMenu: (to: string) => void;
  toggleMoreMenu: () => void;
  closeMoreMenu: () => void;
}

const Navbar = ({
  navbarMenu,
  moreMenu,
  handleTopMenu,
  handleMoreMenu,
  activeIndex,
  isMoreOpen,
  isMoreActive,
  toggleMoreMenu,
  closeMoreMenu,
}: NavbarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const moreRef = useRef<HTMLLIElement>(null);

  useOutsideClick(moreRef, closeMoreMenu);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {navbarMenu.map((item, index) => (
          <li key={`topmemnu-${index}`} className="navbar-item">
            <button
              className={`navbar-link  ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleTopMenu(index, item.to)}
              data-nav-link
            >
              {item.label}
            </button>
          </li>
        ))}

        <li className="navbar-item navbar-item-more" ref={moreRef}>
          <button
            className={`navbar-link ${isMoreActive ? 'active' : ''}`}
            onClick={toggleMoreMenu}
            aria-expanded={isMoreOpen}
            data-nav-link
          >
            {t('more')}
            <IonIcon
              icon={chevronUpOutline}
              className={`navbar-more-icon ${isMoreOpen ? 'open' : ''}`}
            />
          </button>

          {isMoreOpen && (
            <ul className="navbar-dropdown">
              {moreMenu.map((item, index) => (
                <li key={`moremenu-${index}`}>
                  <button
                    className={`navbar-dropdown-link ${
                      location.pathname === item.to ? 'active' : ''
                    }`}
                    onClick={() => handleMoreMenu(item.to)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
