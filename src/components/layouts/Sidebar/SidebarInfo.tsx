import { IoChevronDown } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';

type SidebarInfoProps = {
  image: string;
  name: string;
  title: string;
  isMenuOpen: boolean;
  menuId: string;
  toggleMenu: () => void;
};

const SidebarInfo = ({ image, name, title, isMenuOpen, menuId, toggleMenu }: SidebarInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-info">
      <figure className="avatar-box">
        <img src={image} alt={name} width="120" height="118" />
      </figure>

      <div className="info-content">
        {/* Not a heading: each page's own title is its <h1>. */}
        <p className="name ml-2" title={name}>
          {name}
        </p>

        <p className="title">{title}</p>

        <Link className="hire-me-btn form-btn" to="/pricing">
          <span>{t('hireMe')}</span>
        </Link>
      </div>

      <button
        type="button"
        className="info_more-btn"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        data-sidebar-btn
      >
        <span>{t('showContacts')}</span>

        <IoChevronDown aria-hidden="true" />
      </button>
    </div>
  );
};

export default SidebarInfo;
