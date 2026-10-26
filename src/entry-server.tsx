import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { StaticRouter } from 'react-router-dom';

import App from './App';
import i18n from './lib/i18n';

export { ROUTES } from './constants/routes';

// Build-time render used by scripts/prerender.mjs. Pages are always prerendered in English (the
// default language crawlers see); the browser entry re-renders in the visitor's language.
export const render = async (url: string): Promise<string> => {
  await i18n.changeLanguage('en');

  const { prelude } = await prerender(
    <StrictMode>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </I18nextProvider>
      </HelmetProvider>
    </StrictMode>
  );

  return new Response(prelude).text();
};
