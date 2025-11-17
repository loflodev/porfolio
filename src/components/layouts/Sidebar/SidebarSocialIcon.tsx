/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { SidebarMenuType } from './useSidebar';

interface SidebarSocialIconProps {
  socialIconList: Omit<SidebarMenuType, 'label'>[];
}

const SidebarSocialIcon = ({ socialIconList }: SidebarSocialIconProps) => {
  return (
    <ul className="social-list">
      {socialIconList.map((item, index) => (
        <li key={`social-icon-${index}`} className="social-item">
          <a href={item.to} target="_blank" rel="noopener noreferrer" className="social-link">
            {item.icon}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SidebarSocialIcon;
