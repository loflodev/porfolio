import useHeader from './useHeader';
import Navbar from '../Navbar/Navbar';

const Header = () => {
  const {
    menu,
    moreMenu,
    handleTopMenu,
    handleMoreMenu,
    activeIndex,
    isMoreOpen,
    isMoreActive,
    toggleMoreMenu,
    closeMoreMenu,
  } = useHeader();

  return (
    <Navbar
      navbarMenu={menu}
      moreMenu={moreMenu}
      handleTopMenu={handleTopMenu}
      handleMoreMenu={handleMoreMenu}
      activeIndex={activeIndex}
      isMoreOpen={isMoreOpen}
      isMoreActive={isMoreActive}
      toggleMoreMenu={toggleMoreMenu}
      closeMoreMenu={closeMoreMenu}
    />
  );
};

export default Header;
