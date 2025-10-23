/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Link } from 'react-router-dom';

import type { SidebarMenuType } from './useSidebar';

interface SidebarMenuProps {
  menuList: SidebarMenuType[];
}

const SidebarMenu = ({ menuList }: SidebarMenuProps) => {
  // const sideBarMenuElement = menuList.map((menu) => (
  //   <li className="contact-item">
  //     <div className="icon-box">{menu.icon}</div>

  //     <div className="contact-info">
  //       <p className="contact-title">{menu.label}</p>

  //       <Link to="tel:+12133522795" className="contact-link">
  //         {menu.title}
  //       </Link>
  //     </div>
  //   </li>
  // ));
  return (
    <ul className="contacts-list">
      {menuList.map((menu) => (
        <li className="contact-item">
          <div className="icon-box">{menu.icon}</div>

          <div className="contact-info">
            <p className="contact-title">{menu.label}</p>

            {menu.itemType === 'link' && (
              <Link to={menu.to} className="contact-link">
                {menu.title}
              </Link>
            )}

            {menu.itemType === 'date' && <time dateTime="1982-06-23">{menu.title}</time>}
            {menu.itemType === 'address' && <address>Sacramento, California, USA</address>}
          </div>
        </li>
      ))}
      {/* <li className="contact-item">
        <div className="icon-box">
          <IonIcon icon={mailOutline} />
        </div>

        <div className="contact-info">
          <p className="contact-title">Email</p>

          <a href="mailto:richard@example.com" className="contact-link">
            richard@example.com
          </a>
        </div>
      </li>

      <li className="contact-item">
        <div className="icon-box">
          <IonIcon icon={phonePortraitOutline} />
        </div>

        <div className="contact-info">
          <p className="contact-title">Phone</p>

          <a href="tel:+12133522795" className="contact-link">
            +1 (213) 352-2795
          </a>
        </div>
      </li>

      <li className="contact-item">
        <div className="icon-box">
          <IonIcon icon={calendarOutline} />
        </div>

        <div className="contact-info">
          <p className="contact-title">Birthday</p>

          <time dateTime="1982-06-23">June 23, 1982</time>
        </div>
      </li>

      <li className="contact-item">
        <div className="icon-box">
          <IonIcon icon={locationOutline} />
        </div>

        <div className="contact-info">
          <p className="contact-title">Location</p>

          <address>Sacramento, California, USA</address>
        </div>
      </li> */}
    </ul>
  );
};

export default SidebarMenu;
