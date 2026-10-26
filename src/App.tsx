import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

const About = lazy(() => import('./pages/About/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Portfolio = lazy(() => import('./pages/Portfolio/Portfolio'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Resume = lazy(() => import('./pages/Resume/Resume'));

// Router-agnostic so the browser entry (BrowserRouter) and the prerender entry (StaticRouter)
// can share the same route tree.
function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
