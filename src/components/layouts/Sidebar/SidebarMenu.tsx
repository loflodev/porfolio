/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Link } from 'react-router-dom';

import type { SidebarMenuType } from './useSidebar';

interface SidebarMenuProps {
  menuList: SidebarMenuType[];
}

const SidebarMenu = ({ menuList }: SidebarMenuProps) => {
  return (
    <ul className="contacts-list">
      {menuList.map((menu, index) => (
        <li key={`sidebarmenu-${index}`} className="contact-item">
          <div className="icon-box">{menu.icon}</div>

          <div className="contact-info">
            <p className="contact-title">{menu.label}</p>

            {menu.itemType === 'link' && (
              <Link to={menu.to} className="contact-link">
                {menu.title}
              </Link>
            )}

            {menu.itemType === 'date' && <time dateTime="1982-06-23">{menu.title}</time>}
            {menu.itemType === 'address' && <address>{menu.title}</address>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SidebarMenu;
