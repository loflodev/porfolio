import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Seo from './Seo';
import i18n from '../../lib/i18n';
import { renderWithProviders } from '../../test/renderWithProviders';

const head = () => document.head;
const meta = (selector: string) => head().querySelector(selector)?.getAttribute('content');

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('Seo', () => {
  it('writes a single canonical and the page meta, suffixing the site name', async () => {
    renderWithProviders(<Seo title="Resume" description="My resume." path="/resume" />);

    await waitFor(() => expect(document.title).toBe('Resume | LofloDev'));
    const canonicals = head().querySelectorAll('link[rel="canonical"]');
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]).toHaveAttribute('href', 'https://loflodev.com/resume');
    expect(meta('meta[name="description"]')).toBe('My resume.');
    expect(meta('meta[name="robots"]')).toBe('index, follow');
    expect(meta('meta[property="og:url"]')).toBe('https://loflodev.com/resume');
    expect(meta('meta[property="og:title"]')).toBe('Resume | LofloDev');
    expect(meta('meta[property="og:locale"]')).toBe('en_CA');
  });

  it('supports absolute titles', async () => {
    renderWithProviders(<Seo title="Louis Florival" description="d" absoluteTitle />);

    await waitFor(() => expect(document.title).toBe('Louis Florival'));
  });

  it('marks noindex pages and drops their canonical', async () => {
    renderWithProviders(<Seo title="Blog" description="d" path="/blog" noindex />);

    await waitFor(() => expect(meta('meta[name="robots"]')).toBe('noindex, follow'));
    expect(head().querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('follows the UI language for og:locale', async () => {
    await i18n.changeLanguage('fr');
    renderWithProviders(<Seo title="CV" description="d" />);

    await waitFor(() => expect(meta('meta[property="og:locale"]')).toBe('fr_CA'));
  });
});
