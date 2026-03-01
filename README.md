# Louis's Developer Portfolio

A modern, responsive personal portfolio website showcasing my work as a Full Stack Developer. Built with cutting-edge technologies and best practices in web development.

**[View Live Demo](https://loflodev.com)**

---

## Tech Stack

### Frontend

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| **React 19**       | UI library with latest features |
| **TypeScript 5.9** | Type-safe development           |
| **Vite 7**         | Lightning-fast build tool       |
| **Tailwind CSS 4** | Utility-first styling           |
| **React Router 7** | Client-side routing             |
| **Ionic React**    | Mobile-first UI components      |

### Backend & Services

| Technology            | Purpose                     |
| --------------------- | --------------------------- |
| **Netlify Functions** | Serverless API endpoints    |
| **Supabase**          | PostgreSQL database & auth  |
| **Resend**            | Transactional email service |

### Internationalization

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| **i18next**       | Multi-language support (EN/ES/FR) |
| **react-i18next** | React integration for i18n        |

### Code Quality

| Tool            | Purpose                         |
| --------------- | ------------------------------- |
| **ESLint**      | Code linting with strict rules  |
| **Prettier**    | Code formatting                 |
| **Husky**       | Git hooks for pre-commit checks |
| **lint-staged** | Run linters on staged files     |

---

## Features

- **Multi-language Support** — Seamlessly switch between English, Spanish, and French
- **Responsive Design** — Optimized for all devices from mobile to desktop
- **Serverless Contact Form** — Form submissions stored in Supabase with email notifications
- **Modern Architecture** — Clean separation of concerns with custom hooks and context
- **Performance Optimized** — Fast load times with Vite's optimized bundling
- **Accessibility** — Built with accessibility best practices using `eslint-plugin-jsx-a11y`
- **Type Safety** — Full TypeScript coverage with strict mode enabled

---

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── layouts/         # Header, Navbar, Sidebar
│   └── ui/              # Feature-specific UI components
├── pages/               # Route components with co-located hooks
│   ├── About/
│   ├── Contact/
│   ├── Portfolio/
│   └── Resume/
├── context/             # React Context for global state
├── hooks/               # Custom React hooks
├── services/api/        # API layer with Axios
├── lib/i18n/            # Internationalization config & locales
├── types/               # TypeScript interfaces
├── utils/               # Utility functions & validators
└── constants/           # Static data & configuration

netlify/
└── functions/           # Serverless API endpoints
    └── submit-form.ts   # Contact form handler
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** (recommended) or npm/yarn
- **Netlify CLI** (for local function development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio.git
cd portfolio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

Create a `.env` file with:

```env
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_email@example.com

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_API_KEY=your_supabase_key
```

### Development

```bash
# Start dev server with Netlify Functions
pnpm dev

# Or run Vite only (no serverless functions)
pnpm dev:vite
```

### Build & Preview

```bash
# Production build
pnpm build

# Preview production build locally
pnpm preview
```

---

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `pnpm dev`      | Start development server with Netlify |
| `pnpm dev:vite` | Start Vite dev server only            |
| `pnpm build`    | Type-check and build for production   |
| `pnpm preview`  | Preview production build              |
| `pnpm lint`     | Run ESLint                            |
| `pnpm lint:fix` | Fix linting issues                    |
| `pnpm format`   | Format code with Prettier             |

---

## Architecture Highlights

### State Management

- **React Context** for modal state management
- **Custom Hooks** for page-specific business logic (e.g., `useAbout`, `useContact`)
- **Server State** separation using dedicated API service layer

### Routing

```
/            → About (landing page)
/resume      → Resume & Experience
/portfolio   → Project showcase
/blog        → Blog posts
/contact     → Contact form
```

### API Layer

- Centralized Axios configuration
- Type-safe API responses
- Serverless functions for secure backend operations

---

## Code Quality Standards

This project enforces strict code quality through:

- **No `any` types** — Full TypeScript strict mode
- **No console.log** — Clean production code
- **Consistent formatting** — Prettier with single quotes, semicolons
- **Import sorting** — Automatic import organization
- **Pre-commit hooks** — Lint and format on every commit

---

## Deployment

This project is configured for **Netlify** deployment:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to `main`

Build settings:

- **Build command:** `pnpm build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

---

## Connect With Me

- **Portfolio:** [https://loflodev.com](https://loflodev.com)
- **LinkedIn:** [linkedin.com/in/ljunit25](https://linkedin.com/in/ljunit25)
- **GitHub:** [github.com/loflodev](https://github.com/loflodev)
- **Email:** me.loflodev.com

---

## License

This project is open source and available under the [MIT License](LICENSE).
