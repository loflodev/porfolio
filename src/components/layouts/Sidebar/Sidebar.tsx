import { type FC } from 'react';
import {
  IoLocationOutline,
  IoLogoGithub,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoMailOutline,
  IoPhonePortraitOutline,
} from 'react-icons/io5';

import avatar from '@/assets/images/my-avatar.png';

import SidebarInfo from './SidebarInfo';
import SidebarMenu from './SidebarMenu';
import SidebarSocialIcon from './SidebarSocialIcon';
import useSidebar, { type SidebarMenuType } from './useSidebar';
import useTranslation from '../../../hooks/useTransalation';

const buildMenuList = (t: (key: string) => string): SidebarMenuType[] => [
  {
    icon: <IoMailOutline aria-hidden="true" />,
    label: t('email'),
    title: 'louis@loflodev.com',
    to: 'mailto:louis@loflodev.com',
    itemType: 'link',
  },
  {
    icon: <IoPhonePortraitOutline aria-hidden="true" />,
    label: t('phone'),
    title: ' +1 (438) 304-7941',
    to: 'tel:+14383047941',
    itemType: 'link',
  },
  {
    icon: <IoLocationOutline aria-hidden="true" />,
    label: t('location'),
    title: 'Repentigny, QC, CANADA',
    to: '#',
    itemType: 'address',
  },
];

const SOCIAL_ICON_LIST: Omit<SidebarMenuType, 'label'>[] = [
  {
    icon: <IoLogoGithub className="socials-icons" aria-hidden="true" />,
    title: 'GitHub',
    to: 'https://github.com/loflodev/',
    itemType: 'link',
  },
  {
    icon: <IoLogoInstagram className="socials-icons" aria-hidden="true" />,
    title: 'Instagram',
    to: 'https://www.instagram.com/loflo.dev',
    itemType: 'link',
  },
  {
    icon: <IoLogoLinkedin className="socials-icons" aria-hidden="true" />,
    title: 'LinkedIn',
    to: 'https://www.linkedin.com/in/ljunit25',
    itemType: 'link',
  },
];

const SIDEBAR_MORE_ID = 'sidebar-contacts';

const Sidebar: FC = () => {
  const { t } = useTranslation();
  const { showMenu, isActive, toggleMenu } = useSidebar();

  const menuList = buildMenuList(t);

  return (
    <aside className={`sidebar ${isActive()}`} data-sidebar>
      <SidebarInfo
        image={avatar}
        name={'Louis Florival'}
        title={t('jobTitle')}
        isMenuOpen={showMenu}
        menuId={SIDEBAR_MORE_ID}
        toggleMenu={toggleMenu}
      />

      <div id={SIDEBAR_MORE_ID} className="sidebar-info_more">
        <div className="separator"></div>

        <SidebarMenu menuList={menuList} />

        <div className="separator"></div>

        <SidebarSocialIcon socialIconList={SOCIAL_ICON_LIST} />
      </div>
    </aside>
  );
};

export default Sidebar;
