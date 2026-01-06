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

## Product Overview

LinkAgent is a LinkedIn content workspace that combines trend discovery, AI drafting, scheduling, and direct publishing.

### Core Flows

- **Auth + onboarding**: Supabase Auth, onboarding gate in `lib/supabase/proxy.ts`, and preferences in `user_preferences`.
- **Trend discovery**: `/api/trends` generates niche trends and caches them per user.
- **Content Lab**: Draft posts, generate hooks/images, and preview in a LinkedIn-style UI.
- **Scheduling + publishing**: Drafts stored in Supabase; scheduled posts are published via Vercel cron.
- **Research**: `/api/research` and `/api/competitor` generate and store research history.

## Environment Variables (Required)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `AI_GATEWAY_API_KEY`
- `CRON_SECRET`

## LinkedIn Integrations

- **Login (Supabase)** uses LinkedIn OIDC (`provider: "linkedin_oidc"` in auth pages).
- **Publishing OAuth** lives under `/api/linkedin/*` and requires `w_member_social` scope with redirect URL `/api/linkedin/callback`.

## Scheduling Notes

- Vercel cron calls `/api/cron/publish` every 5 minutes.
- Requests must include `Authorization: Bearer ${CRON_SECRET}`.

## AI Models (Defaults)

- Post generation: `anthropic/claude-haiku-4.5` (`app/api/generate/route.ts`)
- Image generation: `bfl/flux-pro-1.1` (`app/api/generate-image/route.ts`)
- Trends + research: `perplexity/sonar-pro` (`app/api/trends/route.ts`, `app/api/research/route.ts`)

## Supabase Migrations

Run the SQL scripts in order:

1. `scripts/001_create_drafts_table.sql`
2. `scripts/002_add_linkedin_fields.sql`
3. `scripts/003_create_user_preferences.sql`
4. `scripts/004_create_linkedin_connections.sql`
5. `scripts/005_create_trend_cache.sql`
6. `scripts/006_create_research_history.sql`
