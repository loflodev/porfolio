# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with React 19, TypeScript, and Vite. Features multi-language support (EN/ES/FR), build-time prerendering for SEO, serverless backend via Netlify Functions (Netlify Forms, Stripe Checkout, Resend email), and Vitest + Playwright test suites.

## Development Commands

```bash
pnpm dev                  # Start dev server with Netlify integration
pnpm dev:vite             # Pure Vite dev server (no Netlify functions)
pnpm build                # Typecheck + client build + SSR build + prerender (see below)
pnpm preview              # Serve the prerendered dist/ on :4173
pnpm lint                 # ESLint (includes jsx-a11y recommended rules)
pnpm typecheck:functions  # Typecheck netlify/functions
pnpm test                 # Vitest: web (jsdom) + functions (node) projects
pnpm test:watch           # Vitest in watch mode
pnpm test:coverage        # Vitest with v8 coverage (coverage/)
pnpm test:e2e             # Playwright against the prerendered build (builds first locally)
pnpm format               # Format with Prettier
```

## Architecture

### Routing & Layout

```
main.tsx (BrowserRouter)        entry-server.tsx (StaticRouter, build time only)
└── App.tsx (router-agnostic route tree)
    └── MainLayout (layouts/MainLayout.tsx)
        ├── skip link → #main-content
        ├── Sidebar
        └── .main-content
            ├── Header / Navbar (NavLink — real <a href>, aria-current)
            └── <main id="main-content"> → /, /resume, /portfolio, /blog, /contact, /pricing, * (NotFound)
```

- `src/constants/routes.ts` — `ROUTES` is the single source of truth for prerendered routes and the sitemap (`indexable: false` → `noindex`, no canonical, not in sitemap).

### Prerendering (SEO)

- `pnpm build` runs `vite build`, then `vite build --ssr src/entry-server.tsx --outDir dist-ssr`, then `node scripts/prerender.mjs`.
- The script renders each route in English with `react-dom/static`, moves React's hoisted `<title>/<meta>/<link>` into `<head>` (tagged `data-prerendered`), and writes flat files (`dist/resume.html`, …), `dist/404.html` and `dist/sitemap.xml`.
- `main.tsx` hydrates when the visitor's language is English; otherwise it removes `[data-prerendered]` head tags and renders fresh.
- `netlify.toml` has no SPA catch-all on purpose: unknown paths get `404.html` with a real 404.
- Per-page meta lives only in `src/components/common/Seo.tsx` (react-helmet-async v3 renders plain tags that React 19 hoists, with no dedupe). `index.html` keeps only site-wide tags — never add page-specific meta there.

### State Management

- **React Context** (`src/context/MainContext.tsx`) - Modal state with `showModal`, `modalData`, `toggleModal`, `handleModalData`
- **Custom Hooks** - Each page has a corresponding hook (e.g., `useAbout`, `useContact`) containing business logic and data

### Project Structure

- `src/components/common/` - Reusable components (`Seo`)
- `src/components/layouts/` - Header, Navbar, Sidebar with their own hooks
- `src/components/ui/` - Feature-specific components organized by domain (About/, Contact/, Portfolio/, Pricing/, Resume/)
- `src/pages/` - Route components, each with its own `use*.ts` hook
- `src/services/api/` - Axios instance and API calls (Netlify Forms contact submit, checkout)
- `src/lib/i18n/` - i18next configuration and locale JSON files
- `src/types/` - TypeScript types in `common.types.ts`
- `src/utils/` - Validators, checkout idempotency keys
- `src/constants/` - Static data, defaults, `ROUTES`
- `src/test/` - Vitest setup, `renderWithProviders`, configured `axe`
- `e2e/` - Playwright specs (axe, SEO/raw HTML, keyboard, contact, i18n, console)

### Backend (Netlify Functions)

- `submission-created.ts` - Netlify Forms event: emails the admin via Resend for `contact` submissions and for `purchase` submissions whose HMAC (`_shared/purchase-signature.ts`) verifies
- `create-checkout-session.ts` - Stripe Checkout session for `PLAN_SLUGS`, rate limited, idempotency key from `X-Idempotency-Key`
- `verify-checkout-session.ts` - Confirms a returning session is paid and < 24h old
- `stripe-webhook.ts` - Verifies the Stripe signature, dedupes events in Netlify Blobs, records the purchase as a signed Netlify Forms submission
- `_shared/` - CORS, rate limiting (Netlify Blobs compare-and-swap), Sentry, Stripe client, site URL
- API calls routed via `/api/*` → `/.netlify/functions/*` (see `netlify.toml`)
- Functions bundled with esbuild targeting Node 18 (ESM format); `resend` and `stripe` are marked external

### Internationalization

- i18next with react-i18next; locale files `src/lib/i18n/locales/{en,es,fr}.json` must keep identical keys (enforced by `src/lib/i18n/i18n.test.ts`)
- Auto-detects language from localStorage or navigator; `<html lang>` follows `languageChanged`

## Testing

- **Vitest** (`vitest.config.ts`) has two projects: `web` (jsdom, `src/**/*.test.{ts,tsx}`) and `functions` (node, `netlify/functions/**/*.test.ts`).
- Render components with `renderWithProviders` (`src/test/renderWithProviders.tsx`); check a11y with `axe` from `src/test/axe.ts` (contrast and iframes are left to e2e).
- Function tests use the in-memory Blobs fake and `makeEvent` from `netlify/functions/_test/fakes.ts`. Modules that read env at load time are tested with `vi.stubEnv` + `vi.resetModules` + dynamic import.
- **Playwright** (`playwright.config.ts`) runs desktop + Pixel 7 against `pnpm preview`; axe runs with `reducedMotion: 'reduce'` so fade-in animations don't skew contrast.
- CI (`.github/workflows/ci.yml`) runs lint, functions typecheck, coverage, build and e2e on pushes/PRs to `main` and `development`.

## Code Conventions

### ESLint Rules (Strictly Enforced)

- No `console.log` statements (`no-console: error`)
- No `any` type (`@typescript-eslint/no-explicit-any: error`)
- Use `const` where possible (`prefer-const: error`)
- `jsx-a11y` recommended rules are errors

### Accessibility conventions

- Icon-only links/buttons need an `aria-label`; decorative icons/images get `aria-hidden` / `alt=""`
- One `<h1>` per page (the `Article` header); sections `h2`, items `h3` — visual size comes from `.h2/.h3/.h4` classes
- Modals use the native `<dialog>` in `Modal.tsx`; toggles expose `aria-expanded`/`aria-controls` and close on Escape (`useEscapeKey`)

### Formatting (Prettier)

- Semicolons required
- Single quotes
- Trailing commas (ES5)
- 100 character line width

### Path Alias

- `@/` maps to `src/` (configured in vite.config.ts, vitest.config.ts and tsconfig.app.json)

## Environment Variables

Netlify Functions (set in Netlify / `.env` for `netlify dev`):

```
RESEND_API_KEY          # Email service
ADMIN_EMAIL             # Notification recipient
STRIPE_SECRET_KEY       # Stripe API key
STRIPE_WEBHOOK_SECRET   # Webhook signing secret (also signs purchase submissions)
STRIPE_PRICE_ESSENTIAL  # price_… id
STRIPE_PRICE_GROWTH     # price_… id
SENTRY_DSN              # Optional error reporting
```

Netlify provides `URL`, `DEPLOY_PRIME_URL` and `CONTEXT` automatically.

## Key Technologies

- React 19.1 + TypeScript 5.9
- Vite 7.1 with Tailwind CSS v4 plugin
- React Router DOM v7
- react-icons (io5 set) for icons
- react-helmet-async v3 for page meta
- Axios for HTTP requests
- react-spinners for loading states
- Vitest, Testing Library, vitest-axe, Playwright, @axe-core/playwright
