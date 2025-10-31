/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Link } from 'react-router-dom';

import type { SidebarMenuType } from './useSidebar';

interface SidebarSocialIconProps {
  socialIconList: SidebarMenuType[];
}

const SidebarSocialIcon = ({ socialIconList }: SidebarSocialIconProps) => {
  return (
    <ul className="social-list">
      {socialIconList.map((item, index) => (
        <li key={`social-icon-${index}`} className="social-item">
          <Link to={item.to} className="social-link">
            {item.icon}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarSocialIcon;
