import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface SidebarInfoProps {
  image: string;
  name: string;
  title: string;
  toggleMenu: () => void;
}

const SidebarInfo = ({ image, name, title, toggleMenu }: SidebarInfoProps) => {
  return (
    <div className="sidebar-info">
      <figure className="avatar-box">
        <img src={image} alt={name} width="80" />
      </figure>

      <div className="info-content">
        <h1 className="name" title={name}>
          {name}
        </h1>

        <p className="title">{title}</p>
      </div>

      <button className="info_more-btn" onClick={toggleMenu} data-sidebar-btn>
        <span>Show Contacts</span>

        <IonIcon icon={chevronDown} />
      </button>
    </div>
  );
};

export default SidebarInfo;
