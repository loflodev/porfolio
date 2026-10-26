import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import MainProvider from '@/context/MainProvider';
import i18n from '@/lib/i18n';

type ProviderOptions = RenderOptions & {
  route?: string;
  helmetContext?: Record<string, unknown>;
};

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', helmetContext = {}, ...options }: ProviderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <HelmetProvider context={helmetContext}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[route]}>
          <MainProvider>{children}</MainProvider>
        </MemoryRouter>
      </I18nextProvider>
    </HelmetProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
