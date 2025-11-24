import { Outlet } from 'react-router-dom';

import Header from '../components/layouts/Header/Header';
import Sidebar from '../components/layouts/Sidebar/Sidebar';
import MainProvider from '../context/MainProvider';

const MainLayout = () => {
  return (
    <main>
      <Sidebar />
      <div className="main-content">
        <Header />
        <MainProvider>
          <Outlet />
        </MainProvider>
      </div>
    </main>
  );
};

export default MainLayout;
