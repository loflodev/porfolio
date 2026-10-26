import { Outlet } from 'react-router-dom';

import Header from '../components/layouts/Header/Header';
import Sidebar from '../components/layouts/Sidebar/Sidebar';
import MainProvider from '../context/MainProvider';
import useTranslation from '../hooks/useTransalation';

const MAIN_CONTENT_ID = 'main-content';

const MainLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="layout">
      <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
        {t('skipToContent')}
      </a>
      <Sidebar />
      <div className="main-content">
        <Header />
        <main id={MAIN_CONTENT_ID} tabIndex={-1}>
          <MainProvider>
            <Outlet />
          </MainProvider>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
