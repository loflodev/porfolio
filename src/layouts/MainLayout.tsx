import { Outlet } from 'react-router-dom';

import Footer from '../components/layouts/Footer/Footer';
import Header from '../components/layouts/Header/Header';
import Sidebar from '../components/layouts/Sidebar/Sidebar';

const MainLayout = () => {
  return (
    <main>
      <Sidebar />
      <div className="main-content">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </main>
  );
};

export default MainLayout;
