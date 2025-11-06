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

import avatar from '@/assets/images/avatar-1.png';

import SidebarInfo from './SidebarInfo';
import SidebarMenu from './SidebarMenu';
import SidebarSocialIcon from './SidebarSocialIcon';
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

  const socialIconList: SidebarMenuType[] = [
    {
      icon: <IonIcon className="socials-icons" icon={logoFacebook} />,
      label: 'Facebok',
      title: 'facebook',
      to: '#',
      itemType: 'link',
    },
    {
      icon: <IonIcon className="socials-icons" icon={logoTwitter} />,
      label: 'Twitter',
      title: 'twitter',
      to: '#',
      itemType: 'link',
    },
    {
      icon: <IonIcon className="socials-icons" icon={logoInstagram} />,
      label: 'Instagram',
      title: 'instagram',
      to: '#',
      itemType: 'link',
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

        <SidebarSocialIcon socialIconList={socialIconList} />
      </div>
    </aside>
  );
};

export default Sidebar;
