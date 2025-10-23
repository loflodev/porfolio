import { IonIcon } from '@ionic/react';
import {
  calendarOutline,
  locationOutline,
  logoFacebook,
  logoInstagram,
  logoTwitter,
  mailOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { type FC } from 'react';
import { Link } from 'react-router-dom';

import avatar from '@/assets/image/my-avatar.png';

import SidebarInfo from './SidebarInfo';
import SidebarMenu from './SidebarMenu';
import useSidebar, { type SidebarMenuType } from './useSidebar';

const Sidebar: FC = () => {
  const { isActive, toggleMenu } = useSidebar();
  const menuList: SidebarMenuType[] = [
    {
      icon: <IonIcon icon={mailOutline} />,
      label: 'Email',
      title: ' richard@example.com',
      to: 'mailto:richard@example.com',
      itemType: 'link',
    },
    {
      icon: <IonIcon icon={phonePortraitOutline} />,
      label: 'Phone',
      title: ' +1 (213) 352-2795',
      to: 'tel:+12133522795',
      itemType: 'link',
    },
    {
      icon: <IonIcon icon={calendarOutline} />,
      label: 'Birthday',
      title: 'June 23, 1982',
      to: '#',
      itemType: 'date',
    },
    {
      icon: <IonIcon icon={locationOutline} />,
      label: 'Location',
      title: 'Sacramento, California, USA',
      to: '#',
      itemType: 'address',
    },
  ];

  return (
    <aside className={`sidebar ${isActive()}`} data-sidebar>
      <SidebarInfo
        image={avatar}
        name={'Louis Florival'}
        title="Full stack Developer"
        toggleMenu={toggleMenu}
      />

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <SidebarMenu menuList={menuList} />

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <Link to="#" className="social-link">
              <IonIcon className="socials-icons" icon={logoFacebook} />
            </Link>
          </li>

          <li className="social-item">
            <Link to="#" className="social-link">
              <IonIcon className="socials-icons" icon={logoTwitter} />
            </Link>
          </li>

          <li className="social-item">
            <Link to="#" className="social-link">
              <IonIcon className="socials-icons" icon={logoInstagram} />
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
