import { type FC } from 'react';
import { Helmet } from 'react-helmet-async';

import useTranslation from '../../hooks/useTransalation';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  /** Use `title` as-is instead of appending the site name. */
  absoluteTitle?: boolean;
  noindex?: boolean;
};

const SITE_URL = 'https://loflodev.com';
const SITE_NAME = 'LofloDev';
const LANGUAGE_BASE_INDEX = 0;

const OG_LOCALES: Record<string, string> = {
  en: 'en_CA',
  fr: 'fr_CA',
  es: 'es_ES',
};

const Seo: FC<SeoProps> = ({ title, description, path = '/', absoluteTitle, noindex }) => {
  const { getCurrentLanguage } = useTranslation();
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const language = (getCurrentLanguage() ?? 'en').split('-')[LANGUAGE_BASE_INDEX];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={OG_LOCALES[language] ?? OG_LOCALES.en} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
