import { useState, type ReactNode } from 'react';

type MenuItemType = 'link' | 'date' | 'address';

export type SidebarMenuType = {
  icon: ReactNode;
  label: string;
  title: string;
  to: string;
  itemType: MenuItemType;
};

const useSidebar = () => {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const isActive = (): string => (showMenu ? 'active' : '');

  return { showMenu, setShowMenu, isActive, toggleMenu };
};

export default useSidebar;
