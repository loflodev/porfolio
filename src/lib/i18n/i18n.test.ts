import { afterEach, describe, expect, it } from 'vitest';

import i18n from '.';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const flattenKeys = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, child]) =>
        flattenKeys(child, prefix ? `${prefix}.${key}` : key)
      )
    : [prefix];

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('locales', () => {
  const enKeys = flattenKeys(en).sort();

  it.each([
    ['fr', fr],
    ['es', es],
  ])('%s has exactly the same keys as en', (_lang, locale) => {
    expect(flattenKeys(locale).sort()).toEqual(enKeys);
  });

  it.each([
    ['en', en],
    ['fr', fr],
    ['es', es],
  ])('%s has no empty strings', (_lang, locale) => {
    const empty = flattenKeys(locale).filter(
      (key) => key.split('.').reduce<unknown>((node, part) => (node as never)[part], locale) === ''
    );
    expect(empty).toEqual([]);
  });
});

describe('document language', () => {
  it('follows the active language', async () => {
    await i18n.changeLanguage('fr');
    expect(document.documentElement.lang).toBe('fr');

    await i18n.changeLanguage('es');
    expect(document.documentElement.lang).toBe('es');
  });
});
