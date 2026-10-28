import { useCallback, useRef } from 'react';
import { IoChevronUpOutline } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';

import useEscapeKey from '../../../hooks/useEscapeKey';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useTranslation from '../../../hooks/useTransalation';
import type { TopMenuType } from '../../../types';

type NavbarProps = {
  navbarMenu: TopMenuType[];
  moreMenu: TopMenuType[];
  isMoreOpen: boolean;
  isMoreActive: boolean;
  toggleMoreMenu: () => void;
  closeMoreMenu: () => void;
};

const MORE_MENU_ID = 'navbar-more-menu';
const EMPTY = 0;

const linkClassName =
  (base: string) =>
  ({ isActive }: { isActive: boolean }) =>
    `${base} ${isActive ? 'active' : ''}`;

const Navbar = ({
  navbarMenu,
  moreMenu,
  isMoreOpen,
  isMoreActive,
  toggleMoreMenu,
  closeMoreMenu,
}: NavbarProps) => {
  const { t } = useTranslation();
  const moreRef = useRef<HTMLLIElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(moreRef, closeMoreMenu);

  const closeAndRefocus = useCallback(() => {
    closeMoreMenu();
    moreButtonRef.current?.focus();
  }, [closeMoreMenu]);

  useEscapeKey(closeAndRefocus, isMoreOpen);

  return (
    <nav className="navbar" aria-label={t('mainNavigation')}>
      <ul className="navbar-list">
        {navbarMenu.map((item) => (
          <li key={item.to} className="navbar-item">
            <NavLink to={item.to} end className={linkClassName('navbar-link')} data-nav-link>
              {item.label}
            </NavLink>
          </li>
        ))}

        {moreMenu.length > EMPTY && (
          <li className="navbar-item navbar-item-more" ref={moreRef}>
            <button
              ref={moreButtonRef}
              type="button"
              className={`navbar-link ${isMoreActive ? 'active' : ''}`}
              onClick={toggleMoreMenu}
              aria-expanded={isMoreOpen}
              aria-controls={MORE_MENU_ID}
              data-nav-link
            >
              {t('more')}
              <IoChevronUpOutline
                className={`navbar-more-icon ${isMoreOpen ? 'open' : ''}`}
                aria-hidden="true"
              />
            </button>

            <ul id={MORE_MENU_ID} className="navbar-dropdown" hidden={!isMoreOpen}>
              {moreMenu.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={linkClassName('navbar-dropdown-link')}
                    onClick={closeMoreMenu}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
