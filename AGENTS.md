# Repository Guidelines

## Project Structure & Module Organization

- `app/` contains the Next.js App Router pages, layouts, and API routes (`app/api/**/route.ts`).
- `components/` holds shared UI and feature components (e.g., `components/content-lab/`, `components/ui/`).
- `hooks/` and `lib/` provide reusable hooks, helpers, and Supabase utilities.
- `styles/` and `app/globals.css` define global styling and Tailwind layers.
- `public/` stores static assets (icons, placeholders).
- `scripts/` includes SQL migrations and setup scripts.

## Build, Test, and Development Commands

- `pnpm dev`: run the local Next.js dev server.
- `pnpm build`: create a production build.
- `pnpm start`: serve the production build locally.
- `pnpm lint`: run ESLint checks across the repo.

## Coding Style & Naming Conventions

- TypeScript + React components use 2-space indentation, double quotes, and no semicolons (match existing files).
- React components are exported in `PascalCase`; file names are typically kebab-case (e.g., `trend-card.tsx`).
- Route segments under `app/` are kebab-case and API routes follow `app/api/<feature>/route.ts`.
- Tailwind CSS is the primary styling system; prefer existing utility patterns over inline styles.

## Testing Guidelines

- No dedicated test framework is configured currently.
- Use `pnpm lint` and `pnpm build` as the baseline checks before opening a PR.
- If adding tests, co-locate them near the feature and update `package.json` scripts accordingly.

## Commit & Pull Request Guidelines

- Recent history uses Conventional Commit prefixes (`feat:`, `fix:`), though not uniformly. Prefer `feat:`, `fix:`, or `chore:` with a short, imperative subject.
- PRs should include a concise description, linked issues when applicable, and screenshots or GIFs for UI changes.
- Call out new environment variables or migrations in the PR description.

## Security & Configuration Tips

- Store secrets in `.env.local` and keep them out of version control.
- Supabase, LinkedIn, and other provider settings live in `lib/` and `app/api/`; review those files when wiring new integrations.
