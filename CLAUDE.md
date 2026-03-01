# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with React 19, TypeScript, and Vite. Features multi-language support (EN/ES/FR), serverless backend via Netlify Functions, Supabase database, and Resend email service.

## Development Commands

```bash
pnpm dev          # Start dev server with Netlify integration
pnpm dev:vite     # Pure Vite dev server (no Netlify functions)
pnpm build        # TypeScript check + Vite production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Format with Prettier
pnpm preview      # Preview production build
```

## Architecture

### Routing & Layout

```
BrowserRouter (App.tsx)
└── MainLayout (layouts/MainLayout.tsx)
    ├── Sidebar - Navigation menu
    ├── Header - Page title/breadcrumb
    └── Routes: /, /resume, /portfolio, /blog, /contact
```

### State Management

- **React Context** (`src/context/MainContext.tsx`) - Modal state with `showModal`, `modalData`, `toggleModal`, `handleModalData`
- **Custom Hooks** - Each page has a corresponding hook (e.g., `useAbout`, `useContact`) containing business logic and data

### Project Structure

- `src/components/common/` - Reusable components
- `src/components/layouts/` - Header, Navbar, Sidebar with their own hooks
- `src/components/ui/` - Feature-specific components organized by domain (About/, Contact/, Portfolio/, Resume/)
- `src/pages/` - Route components, each with its own `use*.ts` hook
- `src/services/api/` - Axios instances and API call functions
- `src/lib/i18n/` - i18next configuration and locale JSON files
- `src/types/` - TypeScript interfaces in `common.types.ts`
- `src/utils/validation/` - Input validators
- `src/constants/` - Static data and defaults

### Backend (Netlify Functions)

- `netlify/functions/submit-form.ts` - Contact form handler
- Validates input, stores in Supabase `contacts` table, sends email via Resend
- API calls routed via `/api/*` → `/.netlify/functions/*`

### Internationalization

- i18next with react-i18next
- Locale files: `src/lib/i18n/locales/{en,es,fr}.json`
- Auto-detects language from localStorage or navigator

## Code Conventions

### ESLint Rules (Strictly Enforced)

- No `console.log` statements (`no-console: error`)
- No `any` type (`@typescript-eslint/no-explicit-any: error`)
- Use `const` where possible (`prefer-const: error`)

### Formatting (Prettier)

- Semicolons required
- Single quotes
- Trailing commas (ES5)
- 100 character line width

### Path Alias

- `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)

## Environment Variables

Required in `.env`:

```
RESEND_API_KEY        # Email service
SUPABASE_URL          # Database URL
SUPABASE_API_KEY      # Database key
ADMIN_EMAIL           # Contact form recipient
VITE_SUPABASE_URL     # Frontend-exposed Supabase URL
VITE_SUPABASE_API_KEY # Frontend-exposed Supabase key
```

## Key Technologies

- React 19.1 + TypeScript 5.9
- Vite 7.1 with Tailwind CSS v4 plugin
- React Router DOM v7
- Ionic React + Ionicons for mobile-friendly UI
- Axios for HTTP requests
- react-spinners for loading states
