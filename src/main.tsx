import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import i18n from './lib/i18n/index.ts';

const PRERENDER_LANGUAGE = 'en';
const container = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </HelmetProvider>
  </StrictMode>
);

// Pages are prerendered in English (scripts/prerender.mjs). Hydrate when the visitor's language
// matches; otherwise render fresh so the markup isn't a hydration mismatch, and drop the
// prerendered head tags that the new render replaces.
if (container.hasChildNodes() && i18n.resolvedLanguage === PRERENDER_LANGUAGE) {
  hydrateRoot(container, app);
} else {
  document.head.querySelectorAll('[data-prerendered]').forEach((node) => node.remove());
  container.replaceChildren();
  createRoot(container).render(app);
}
