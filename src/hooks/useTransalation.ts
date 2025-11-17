import { useCallback } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';

export type TranslationKey = string;

const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string>) => {
      return t(key, params);
    },
    [t]
  );

  const changeLanguage = useCallback(
    async (language: string) => {
      await i18n.changeLanguage(language);
    },
    [i18n]
  );

  const getCurrentLanguage = useCallback(() => {
    return i18n.language;
  }, [i18n.language]);

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
  };
};

export default useTranslation;
