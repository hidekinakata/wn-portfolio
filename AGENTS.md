<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# wn-portfolio — agent directives

Personal portfolio of **William Hideki Nakata** (AI Automation Engineer & Full Stack Developer):
bilingual (en / pt-BR) landing + blog + projects, driven by Supabase Postgres through Prisma 7,
with an authenticated `/admin`. The block above is owned by Next.js — **everything below is ours,
edit it freely**.

Plan, decision log and phase status live in `PLAN.md` or `PRODUCT.md` (untracked, local only). This file is about
**how to work in this repo**, not what to build.

---

## Non-negotiables

1. **Commits are Conventional Commits, written in English.** Always. Types: `feat`, `fix`, `chore`,
   `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `style`. Subject in imperative mood
   (`add`, not `added`/`adds`). Wrap body at ~72 chars; explain *why*, not *what*.
   History is still unpushed, so amending/rewording is expected and encouraged.
2. **`pnpm typecheck` and `pnpm lint` must both be clean before you commit.** No exceptions.
3. **Verify UI work in a real browser**, at both `/en` and `/pt-BR`, before calling it done.
   Do not describe what you expect to render — open it and look. Check the browser console for
   errors while you are there.
4. **Read the bundled Next.js docs before writing Next.js code.** `node_modules/next/dist/docs/`.
   This project is on Next 16, which differs materially from what you may assume.
5. **Do not touch the `nextjs-agent-rules` block above.** `next dev` rewrites it.
6. Prefer small, verifiable steps. When something is blocked (missing credentials, missing data),
   say so plainly instead of working around it with stubs or hardcoded values.

---

## Repository layout

- Application code lives under `src/`. Import alias `@/*` maps to `./src/*`.
- `prisma/schema.prisma` is the source of truth for data shape; the client is generated to
  `src/generated/prisma` and imported as `@/generated/prisma/client`.
- UI strings live in `src/messages/en.json` and `src/messages/pt-BR.json`. Keep both in sync —
  a key missing in one file is a bug.
- Design tokens (dark-only theme) live in `src/app/globals.css` under `@theme`. Tune tokens there,
  not one-off colours in components.

---

## TypeScript

Follow the `typescript-best-practices` skill (load it whenever you touch `.ts`/`.tsx`):

- No `as` casts. Validate at the boundary (Zod), then trust the narrowed type internally.
- `unknown` over `any` for external data.
- Discriminated unions with a `kind` literal instead of bags of optional fields.
- Derive types (`z.infer`, `Pick`, `Omit`, `ReturnType`) instead of redeclaring shapes.
- Exhaustiveness checks via `const _exhaustive: never = x` in `default` arms.
- Object arguments over positional for anything beyond hot paths.

## React / Next.js

Follow the `vercel-react-best-practices` skill (load it for any React/Next work):

- **Server Components by default.** `'use client'` only where there is interaction or browser APIs.
- Keep props passed to Client Components small and serializable — fetch in the server, not the client.
- Await independent data in `Promise.all`; never waterfall sequentially where order does not matter.
- `React.cache()` for per-request deduplication.
- No `console.log` in shipped code.

---

## Stack-specific rules in this codebase

### Next.js 16 (things that will bite you)

- `params` and `searchParams` are **Promises** — `await params`, or `use()` in client components.
- The request middleware file is **`src/proxy.ts`** with a `proxy` export. `middleware.ts` is
  deprecated here.
- **Cache Components is enabled** (`cacheComponents: true`):
  - Data access goes through `'use cache'` functions with `cacheTag`/`cacheLife`.
  - Mutations use `updateTag(...)` from `next/cache` (read-your-writes). The one-argument
    `revalidateTag(tag)` is deprecated and a type error; use `revalidateTag(tag, 'max')`.
  - `export const dynamic`, `revalidate`, `fetchCache` and `dynamicParams` **do not exist**.
  - `generateStaticParams` on `app/[locale]/layout.tsx` is **required** and must return at least
    one value.
  - Anything reading request-time data in a layout/page needs a `<Suspense>` boundary.
- `<Image>` uses **`preload`**, not `priority`. Remote images must be listed in
  `images.remotePatterns` (not `images.domains`).
- Forms: `useActionState` from `react` (not `useFormState` from `react-dom`).
- `next lint` is gone — run `pnpm lint` (ESLint directly).

### next-intl — do NOT use `next-intl/plugin`

The alias is configured manually in `next.config.ts` and that is deliberate. `next-intl/plugin`
does `require('@swc/core')` at module top-level; the SWC native addon is a self-loading carrier
that refuses to materialise when another SID has write rights on its cache directory
(`ERR_SWC_NATIVE_CACHE`), which broke `next dev` entirely on this machine.

For basic usage the plugin only sets `turbopack.resolveAlias['next-intl/config']`, which
`next.config.ts` already does. If `experimental.extract` / `messages.precompile` are ever needed,
switch back to `createNextIntlPlugin('./src/i18n/request.ts')(nextConfig)` and resolve the SWC
environment issue first.

- Site components import `Link`, `usePathname`, `useRouter` and `redirect` from
  **`@/i18n/navigation`** — never from `next/link` / `next/navigation`, or the locale is lost.
- Locales are `en` and `pt-BR` in URLs, but the database enum is `pt_BR`. The **only** place that
  translates between the two is `src/i18n/languages.ts` — use `toLanguage` / `toLocale`.
- When a translation is missing, content **falls back to `en`** (`FALLBACK_LANGUAGE`).

### Prisma 7

- Prisma 7 **requires a driver adapter**. Runtime uses `@prisma/adapter-pg` over
  `process.env.DATABASE_URL` (Supabase **pooler**) in `src/lib/db.ts`.
- `DIRECT_URL` is reserved for the Prisma CLI (`prisma.config.ts` → `datasource.url`) because DDL
  cannot run through the pooler. **Never use `DIRECT_URL` at runtime.**
- `datasource` in `schema.prisma` has no `url` — that is correct for Prisma 7; the URL lives in
  `prisma.config.ts`.
- Prisma CLI flags changed: `prisma migrate diff` takes `--from-config-datasource` / `--to-schema`
  (there is no `--from-url` / `--to-schema-datamodel`).
- Migrations are baselined: `0_init` marks the pre-existing database as applied. New migrations
  must be additive where possible and never assume an empty database.

---

## Verification workflow

```bash
pnpm dev        # then check http://localhost:3000/en and /pt-BR in a browser
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint

pnpm db:status  # is the schema in sync?
pnpm db:migrate # prisma migrate deploy
pnpm exec tsx prisma/seed.ts   # local scaffolding only (untracked)
```

After any UI change, capture a screenshot at both locales and inspect the browser console.
After any schema change, confirm `pnpm db:status` reports no drift before moving on.

---

## Skills — load these as relevant

| Skill | Use for |
|---|---|
| `typescript-best-practices` | any `.ts`/`.tsx` writing or review |
| `vercel-react-best-practices` | React/Next components, data fetching, performance |
| `context7-mcp` | **any** library/framework API question — Next.js, Prisma, next-intl, Motion, Lenis, Zod, Shiki, Supabase. Use it even when you think you know the answer |
| `impeccable` | UI/UX design review and polish (planned for the visual refinement phase) |
| `agent-browser` | browser automation, exploratory testing, QA |
| `find-skills` | discovering additional skills when a task needs one |

When a task touches a library API, resolve the library ID and query its docs first — training data
goes stale quickly, and this repo already depends on several fast-moving major versions.

---

## Never commit

These are ignored on purpose; do not force-add them:

- `.env.local` (real credentials) — `.env.exemple` is the committed template
- `src/generated/` (Prisma client output)
- `prisma/seed.ts`, `prisma/load-env.ts` (local scaffolding, deliberately untracked)
- `PLAN.md` (local working plan)
- `.openchamber/` (tool state)

Never print secret values in output — check for presence or length only.
