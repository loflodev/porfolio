import useHeader from './useHeader';
import Navbar from '../Navbar/Navbar';

const Header = () => {
  const { menu, handleTopMenu, activeIndex } = useHeader();

  return <Navbar navbarMenu={menu} handleTopMenu={handleTopMenu} activeIndex={activeIndex} />;
};

export default Header;
