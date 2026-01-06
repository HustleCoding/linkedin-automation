# LinkAgent AI Dashboard

LinkAgent is a LinkedIn content workspace that helps creators and teams go from idea to published post. It combines trend discovery, AI drafting, scheduling, and direct publishing in one app.

## What It Does

- Discover trending LinkedIn topics by niche.
- Generate hooks and full posts with AI.
- Create on-brand post images with AI.
- Save drafts, schedule posts, and publish directly to LinkedIn.
- Track a basic activity overview (drafts, scheduled, published).
- Research topics and competitors with AI and store results.

## How It Works

1. **Auth + onboarding**: Users sign up via Supabase Auth, then complete onboarding and (optionally) connect LinkedIn for publishing.
2. **Trend discovery**: The app generates live trends per niche and caches them in Supabase.
3. **Content Lab**: Users draft posts, generate hooks/images, and preview in a LinkedIn-style UI.
4. **Scheduling + publishing**: Drafts are stored in Supabase. Scheduled posts are published by a cron job that calls `/api/cron/publish`.
5. **Research**: Topic and competitor research runs through AI, then is saved to Supabase for history.

## Tech Stack

- **Framework**: Next.js (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Data**: Supabase (Postgres + Auth + RLS)
- **Caching**: SWR
- **AI**: Vercel AI SDK (`ai`)
- **Deploy**: Vercel + Vercel Cron

## AI Models (Default)

These are configured in the API routes and can be swapped:

- **Post generation**: `anthropic/claude-haiku-4.5` (`app/api/generate/route.ts`)
- **Image generation**: `bfl/flux-pro-1.1` (`app/api/generate-image/route.ts`)
- **Trend discovery**: `perplexity/sonar-pro` (`app/api/trends/route.ts`)
- **Research**: `perplexity/sonar-pro` (`app/api/research/route.ts`)

All AI calls go through the AI SDK and expect a gateway key in `AI_GATEWAY_API_KEY`.

## Project Structure

- `app/` - Next.js routes, layouts, and API handlers
- `components/` - UI and feature components
- `hooks/` - Client data hooks
- `lib/` - Utilities, types, and Supabase clients
- `scripts/` - Supabase SQL migrations
- `public/` - Static assets

## Getting Started (Local)

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` with the required variables (see below).

3. Run the SQL migrations in `scripts/` using the Supabase SQL editor (in order):

   - `001_create_drafts_table.sql`
   - `002_add_linkedin_fields.sql`
   - `003_create_user_preferences.sql`
   - `004_create_linkedin_connections.sql`
   - `005_create_trend_cache.sql`
   - `006_create_research_history.sql`

4. Start the dev server:
   ```bash
   pnpm dev
   ```

## Environment Variables

Create `.env.local` (or configure these in Vercel):

| Variable                                | Required | Description                                 |
| --------------------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`              | Yes      | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | Yes      | Supabase anon key                           |
| `SUPABASE_SERVICE_ROLE_KEY`             | Yes      | Service role key (for cron publishing)      |
| `LINKEDIN_CLIENT_ID`                    | Yes      | LinkedIn app client ID (publishing OAuth)   |
| `LINKEDIN_CLIENT_SECRET`                | Yes      | LinkedIn app client secret                  |
| `AI_GATEWAY_API_KEY`                    | Yes      | Vercel AI Gateway key                       |
| `CRON_SECRET`                           | Yes      | Bearer token for cron publishing            |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | No       | Dev OAuth redirect override                 |
| `OUTSTAND_API_KEY`                      | No       | Only required if using Outstand integration |

## LinkedIn Setup

There are two different LinkedIn flows:

1. **Login (Supabase Auth)**: Uses LinkedIn OIDC through Supabase (`provider: "linkedin_oidc"`).
2. **Publishing (App OAuth)**: Uses LinkedIn v2 OAuth in `/api/linkedin/*` for posting on behalf of the user.

To enable publishing:

- Create a LinkedIn app with `w_member_social` scope.
- Add a redirect URI: `https://your-app.com/api/linkedin/callback`
- Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

## Scheduling (Cron)

Scheduled posts are not created in LinkedIn ahead of time. The app stores them and publishes later via cron:

- Vercel cron calls `/api/cron/publish` every 5 minutes (see `vercel.json`).
- Requests must include `Authorization: Bearer ${CRON_SECRET}`.

Example:

```bash
curl -X POST https://your-app.com/api/cron/publish \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Scripts

```bash
pnpm dev     # Start dev server
pnpm build   # Production build
pnpm start   # Run production build locally
pnpm lint    # ESLint
```

## Deployment Notes

- This repo can be synced with v0.app deployments.
- Vercel cron is configured in `vercel.json`.

## Security

- Store secrets in `.env.local` and never commit them.
- Supabase RLS policies are enabled by default in the SQL scripts.
