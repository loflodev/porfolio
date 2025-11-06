/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface NavbarProps {
  navbarMenu: Array<{
    label: string;
    to: string;
  }>;
  activeIndex: number;
  handleTopMenu: (value: number, to: string) => void;
}

const Navbar = ({ navbarMenu, handleTopMenu, activeIndex }: NavbarProps) => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {navbarMenu.map((item, index) => (
          <li key={`topmemnu-${index}`} className="navbar-item">
            <button
              className={`navbar-link  ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleTopMenu(index, item.to)}
              data-nav-link
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
