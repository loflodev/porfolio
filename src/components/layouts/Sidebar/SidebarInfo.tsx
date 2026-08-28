import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';
import { Link } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface SidebarInfoProps {
  image: string;
  name: string;
  title: string;
  toggleMenu: () => void;
}

const SidebarInfo = ({ image, name, title, toggleMenu }: SidebarInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-info">
      <figure className="avatar-box">
        <img src={image} alt={name} width="120" />
      </figure>

      <div className="info-content">
        <h1 className="name ml-2" title={name}>
          {name}
        </h1>

        <p className="title">{title}</p>

        <Link className="hire-me-btn form-btn" to="/pricing">
          <span>{t('hireMe')}</span>
        </Link>
      </div>

      <button className="info_more-btn" onClick={toggleMenu} data-sidebar-btn>
        <span>{t('showContacts')}</span>

        <IonIcon icon={chevronDown} />
      </button>
    </div>
  );
};

export default SidebarInfo;
