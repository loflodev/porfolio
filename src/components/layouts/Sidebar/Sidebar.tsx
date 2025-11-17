import { IonIcon } from '@ionic/react';
import {
  calendarOutline,
  locationOutline,
  logoGithub,
  logoInstagram,
  logoLinkedin,
  mailOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { type FC } from 'react';

import avatar from '@/assets/images/avatar-1.png';

import SidebarInfo from './SidebarInfo';
import SidebarMenu from './SidebarMenu';
import SidebarSocialIcon from './SidebarSocialIcon';
import useSidebar, { type SidebarMenuType } from './useSidebar';
import useTranslation from '../../../hooks/useTransalation';

const Sidebar: FC = () => {
  const { t } = useTranslation();

  const { isActive, toggleMenu } = useSidebar();

  const menuList: SidebarMenuType[] = [
    {
      icon: <IonIcon icon={mailOutline} />,
      label: t('sidebar.email'),
      title: 'louis@loflodev.com',
      to: 'mailto:louis@loflodev.com',
      itemType: 'link',
    },
    {
      icon: <IonIcon icon={phonePortraitOutline} />,
      label: t('sidebar.phone'),
      title: ' +1 (438) 526-2254',
      to: 'tel:+14385262254',
      itemType: 'link',
    },
    {
      icon: <IonIcon icon={calendarOutline} />,
      label: t('sidebar.birthday'),
      title: 'October 10, 1989',
      to: '#',
      itemType: 'date',
    },
    {
      icon: <IonIcon icon={locationOutline} />,
      label: t('sidebar.location'),
      title: 'Repentigny, QC, CANADA',
      to: '#',
      itemType: 'address',
    },
  ];

  const socialIconList: Omit<SidebarMenuType, 'label'>[] = [
    {
      icon: <IonIcon className="socials-icons" icon={logoGithub} />,
      title: 'Github',
      to: 'https://github.com/loflodev/',
      itemType: 'link',
    },
    {
      icon: <IonIcon className="socials-icons" icon={logoInstagram} />,
      title: 'instagram',
      to: 'https://www.instagram.com/louis_thereborn',
      itemType: 'link',
    },
    {
      icon: <IonIcon className="socials-icons" icon={logoLinkedin} />,
      title: 'Linkedin',
      to: 'https://www.linkedin.com/in/ljunit25',
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
