import useHeader from './useHeader';
import Navbar from '../Navbar/Navbar';

const Header = () => {
  const { menu, moreMenu, isMoreOpen, isMoreActive, toggleMoreMenu, closeMoreMenu } = useHeader();

  return (
    <Navbar
      navbarMenu={menu}
      moreMenu={moreMenu}
      isMoreOpen={isMoreOpen}
      isMoreActive={isMoreActive}
      toggleMoreMenu={toggleMoreMenu}
      closeMoreMenu={closeMoreMenu}
    />
  );
};

export default Header;
