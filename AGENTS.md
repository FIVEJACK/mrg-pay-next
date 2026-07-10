# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Confirmed breaking change in this repo:** Next.js 16 renamed Middleware to Proxy. There is no `middleware.ts` — routing/device logic lives in `src/proxy.ts` (see `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`). Do not recreate a `middleware.ts` file; extend `src/proxy.ts` instead.

## Stack

Next.js 16 (App Router, `src/app/[locale]`), React 19, TypeScript (strict), Tailwind CSS v4, `next-intl` for i18n, Zustand for client state, `@amplitude/analytics-browser` for tracking, `@pubnub/chat` for chat. No test framework is configured — do not assume Jest/Vitest exists.

## Path Aliases

Defined in `tsconfig.json`. In practice almost everything imports through `@/*` (maps to `src/*`) — e.g. `@/components/...`, `@/lib/...`, `@/config/config`.

`@helpers/*` and `@plugins/*` point at `src/app/helpers` and `src/app/plugins`, which do not exist in this repo (stale from the original scaffold). Do not use them or create those directories to make them "work" — if you need a helper, put it under `src/lib/`.

## Server vs Client Components

Server Components are the default. Add `"use client"` only when you need hooks, browser APIs, or event handlers.

- A page file itself should stay a Server Component. If a page needs client behavior, wrap the client piece in its own component rather than marking the page `"use client"`.
- A Server Component cannot be rendered as a child passed through a Client Component's own JSX tree in the same module — if you need to nest one inside the other, pass the Server Component in as `children`/props from a parent Server Component:
  ```tsx
  <ClientComponent>
    <ServerComponent />
  </ClientComponent>
  ```
- Avoid props drilling beyond ~2 levels; reach for a Zustand store (see `src/stores/`) or component composition instead.

## Device Split: `dweb` / `mweb`

Feature folders that need materially different desktop vs mobile markup split into sibling `dweb/` and `mweb/` subfolders (see `src/components/checkout/{dweb,mweb}` and `src/components/pdp/{dweb,mweb}`). Server-side device detection is available via `getDevice()`/`isMobile()` in `src/lib/device.server.ts`, backed by the `DEVICE_HEADER` that `src/proxy.ts` sets on every request from the User-Agent. Prefer this over client-side `matchMedia`/resize-based detection for anything that affects initial render.

## i18n (`next-intl`)

- Client components: `import { useTranslations } from "next-intl"; const t = useTranslations();`
- Server components: `import { getTranslations } from "next-intl/server"; const t = await getTranslations();`
- Locale config lives in `src/i18n/routing.ts`. **Currently ID-only** — English is temporarily disabled (see the comment in that file). Don't add English-locale UI copy assuming `en` is live; check `routing.ts` first if this matters.

## Data Fetching: Partner API

Server-side calls go through `partnerApi` (`@/lib/partner-api`), which throws `PartnerApiError` on failure. Follow the pattern in `src/app/[locale]/checkout/page.tsx`: wrap calls in a helper that catches `PartnerApiError` specifically, `console.warn`s it, and returns `null`/a fallback rather than letting it throw into the page. Pages render an explicit error/empty state instead of crashing.

## Amplitude Analytics

Initialized once in `src/instrumentation-client.ts`; no-ops on the server and when `NEXT_PUBLIC_AMPLITUDE_API_KEY` is unset, so local dev without a key sends nothing. `autocapture` is fully disabled — nothing is tracked unless you call it explicitly.

1. Register new event names in `EVENT` in `src/lib/amplitude.ts` first — don't inline raw event-name strings at call sites.
2. Fire with `trackEvent(EVENT.MY_EVENT, { ... })` from `@/lib/amplitude` — safe to call anywhere, never throws into the UI.
3. For page-view tracking, render `<VisitPageTracker eventName={EVENT.X} properties={{...}} />` (`@/components/shared/visit-page-tracker`) — it's a thin client component that works from Server Component pages.
4. If you `router.push`/redirect immediately after tracking, `await flushAmplitude()` first so the event isn't dropped on unload.
5. After resolving user identity, call `identifyUser(user.email)`.

## Images

Use `MrgImage` from `@/components/shared/mrg-image` (not `next/image` directly, and not `FJImage` — that name is stale from an earlier fork of this codebase). It force-upgrades protocol-relative/`http://` URLs to `https://` and cross-fades in over a skeleton. Add `priority` to the LCP image (check with Lighthouse) and always set `width`/`height` or `sizes` for `fill` images to get correctly-sized optimization.

Remote image hosts must be added to `images.remotePatterns` in `next.config.ts` **and** to the `img-src`/`connect-src` CSP directives in the same file if the host also serves non-image assets — they're two separate allowlists that silently diverge if only one is updated.

## Iframe / postMessage Protocol

`/iframe/product` is embedded by the `/product-list` shell. The wire protocol (message types, payload shape, a same-origin-only `postProductSelection` sender, and an `isProductListMessage` type guard) lives in `src/components/pdp/product-list-messaging.ts` — both sides import from there so the format can't drift. Message type strings are prefixed `mrg:` (e.g. `mrg:product-selected`). When adding a new message type, add it here rather than hand-rolling a new `postMessage` call elsewhere, and always pin the target origin (never `"*"`).

## Content Security Policy

CSP is assembled in `next.config.ts` from `cspDirectives`. When adding a new external domain (CDN, websocket endpoint, API), add it to the specific directive it needs (`connect-src` for fetch/WS, `img-src` for images, etc.) rather than loosening `default-src`.

## Formatting & Lint

Prettier (`.prettierrc`): 120 print width, 2-space indent, double quotes, semicolons, trailing commas everywhere. ESLint (`eslint.config.mjs`): `eslint-config-next` core-web-vitals + typescript, flat config. Run `npm run lint` before considering frontend work done; there is no separate `format` script, rely on editor/Prettier integration.

## Env Vars

See `.example.env` for the full set (partner API base URL, PubNub keys, S3 upload config, Amplitude key). `NEXT_PUBLIC_*` vars are exposed to the browser — never put a secret behind that prefix.

## About `README.md`

`README.md` predates several changes in this codebase and includes guides that no longer match reality (the `FJImage` component name, a `helpers/storage-helper` / `helpers/cache-helper` caching layer, a per-route `pathnames` i18n translation map, and a custom-header whitelist pattern) — none of these exist in the current `src/` tree. Prefer this file and the actual code over those specific `README.md` sections; verify against `src/` before following an example from there.
