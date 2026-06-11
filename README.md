This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## App Structure
- App: page content
- components: components collection
- config: config from env
- externals: api call
- helpers: reusable function collection
- plugins: third party script
- stores: zustand/state management

## Create Page Checklist
- [ ] Add page metadata for SEO like title and meta description ([Guide](#add-page-metadata-for-seo))
- [ ] Add route translation to i18n config ([Guide](#add-route-translation))
- [ ] Page must not include `'use client'`. If needed, make a wrapper and make the component use client and not the page ([Guide](#how-to-use-server-component-or-client-component))
- [ ] Use i18n translation feature to translate text ([Guide](#use-next-intl-to-translate-text))
- [ ] (Optional) Add Amplitude page tracker ([Guide](#amplitude-analytics))
- [ ] (Optional) Add custom page header ([Guide](#add-custom-page-header))

## Optimizing Page Checklist
- [ ] Use server component by default ([Guide](#how-to-use-server-component-or-client-component))
- [ ] Do not props drilling. Max 2 level deep
- [ ] Optimize image ([Guide](#optimizing-image))
- [ ] Proper structure HTML tag (`<h1>`, `<h2>`, `<p>`) ([Guide](#proper-structure-html))
- [ ] Use dynamic import for below the fold ([Guide](#use-dynamic-import))
- [ ] Use cache when fetching data if possible ([Guide](#caching))

## Guides
### Add Page Metadata for SEO
At the page file, add this on top of page. For example `/app/[locale]/game-key/page.tsx`:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return metadataGenerator(
    'Buy Game Keys Steam For PC Cheapest Price',
    'Buy cheap game keys Steam for PC with instant delivery 24/7 to a vast selection of games at cheapest prices. Elevate your gaming experience today.'
  );
}
```

If you need to change OG image, you can add the image URL as third parameter:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return metadataGenerator(
    'Buy Game Keys Steam For PC Cheapest Price',
    'Buy cheap game keys Steam for PC with instant delivery 24/7 to a vast selection of games at cheapest prices. Elevate your gaming experience today.',
    'https://files.itemku.com/image/og-image.png'
  );
}
```

### Add Route Translation
Some routes have different names when in English. For example `/dagangan` will be `/product`.
You can register the translation at `/i18n/routing.ts` on pathnames. For now we only need `en`:

```typescript
export const routing = defineRouting({
    locales: ['en', 'id'],
    localePrefix: 'as-needed',
    defaultLocale: 'id',
    localeDetection: false,
    pathnames: {
        '/': '/',
        '/pusat-bantuan': {
            en: '/help-center',
        },
        '/pusat-bantuan/tanya-jawab': {
            en: '/help-center/discussion',
        },
    },
});
```

For dynamic routes, use `/[dynamic_value]` same name as folder structure. For example:

```typescript
'/dagangan/[seo_string]/[product_id]': {
    en: '/product/[seo_string]/[product_id]',
},
```

### How to Use Server Component or Client Component
By default, a component will be a server component. To change it to a client component, simply add `'use client'` on top of the file.

**Server component limitations:**
- Can't use React hooks (`useEffect`, `useState`, etc.)
- Can't use HTML events (`onClick`, `onInput`, etc.)

**Client component limitations:**
- Can't fetch data inside the component
- Can't have server component inside client component. Server component can't be a child of client component

For workaround, you can wrap server component with child component. For example:

```tsx
<ClientComponent>
  <ServerComponent />
</ClientComponent>
```

### Use next-intl to Translate Text
To translate text, there are two ways:

**Client Component:**
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations();
t('lupa_password')
```

**Server Component:**
```typescript
import { getTranslations } from 'next-intl/server';

const t = await getTranslations();
t('lupa_password')
```

### Amplitude Analytics

Amplitude is initialized once for the whole app in `src/instrumentation-client.ts`
(Next.js runs this before hydration). It is a no-op unless the API key is set, so
local development without a key sends nothing.

Set the key via env (exposed to the browser, so it must be `NEXT_PUBLIC_`):

```bash
NEXT_PUBLIC_AMPLITUDE_API_KEY=your-amplitude-api-key
```

`autocapture` is fully disabled (pageViews, webVitals, elementInteractions, pageUrlEnrichment).
All tracking is explicit — nothing is sent unless you call `trackEvent` or use `VisitPageTracker`.

#### Track a custom event

1. **Register the event name** in the registry at `src/lib/amplitude.ts`:
```typescript
export const EVENT = {
  // ...
  MY_NEW_EVENT: "My New Event",
} as const;
```

2. **Fire it** from any client component or hook:
```typescript
import { EVENT, trackEvent } from "@/lib/amplitude";

trackEvent(EVENT.MY_NEW_EVENT, { foo: "bar" });
```

`trackEvent` is safe to call anywhere — it no-ops on the server and when no key
is configured, and never throws into the UI flow.

#### Add a page-visit tracker

For a "page viewed" event, drop `VisitPageTracker` into the page (works in
Server Components — it's a thin client component that renders nothing):

```tsx
import { VisitPageTracker } from "@/components/shared/visit-page-tracker";
import { EVENT } from "@/lib/amplitude";

<VisitPageTracker eventName={EVENT.VISIT_CHECKOUT_PAGE} properties={{ product_id }} />
```

#### Flush before navigation

If you redirect immediately after tracking (e.g. post-checkout), await `flushAmplitude()`
so queued events aren't dropped when the page unloads:

```typescript
import { flushAmplitude } from "@/lib/amplitude";

await flushAmplitude();
router.push("/success");
```

#### Identify a user

After resolving a user identity (e.g. login), call `identifyUser` to associate
subsequent events with that user:

```typescript
import { identifyUser } from "@/lib/amplitude";

identifyUser(user.email);
```

### Add Custom Page Header

If the page needs a custom header (different version of home page header), add the PageHeader like this. This is a header with back button. If you need a different type, create a new header and replace it with your new header:

```tsx
export default async function GameKeyPage() {
  const t = await getTranslations();
  return (
    <div>
      <PageHeader
        title={t('beli_game_key_dengan_harga_terbaik')}
        backgroundColorBeforeScroll='bg-gradient-to-b from-[#1B1B1B] to-transparent'
        textColorBeforeScroll='text-white'
        iconColorBeforeScroll='white'
      />
      <GameKeyContent />
    </div>
  );
}
```

Since this is adding a header to a page, you need to hide the default header by whitelisting the page. Otherwise, it will have 2 stacks of headers. The config is located at `components/shared/layout/header/index.tsx`:

```typescript
const hideMobileHeaderFor: any = ['/game-key', '/']; // TEMPORARY INCLUDE HOME PAGE
const hideDesktopHeaderFor: any = [];
```

### Optimizing Image

When creating a new image:

1. **Use FJImage component** - Import `FJImage` from `'components/shared/image'`. It includes `next/image` and optimization from server. Do not use HTML `<img>` if possible.

2. **Use priority for LCP** - Use Lighthouse to detect which image is the LCP and add `priority` to its property. This will instruct the server to serve the image first and as soon as possible to reduce LCP time:

```tsx
<FJImage
  src={IMAGE_BRAND.ITEMKU_LOGO_WHITE_MINI}
  alt='logo-itemku'
  width={32}
  height={32}
  priority
/>
```

3. **Define the size** - By defining the size, the image optimization will automatically use smaller image dimensions and compress the size:

```tsx
<FJImage
  src={sellerBadge?.badge_image}
  width={24}
  height={24}
/>
```

4. **For filled image or responsive size** - Use `sizes` to select the smallest image. The value may vary and you might need to change and find the sweet spot. Too low will cause the image to be blurry and too high will have large size and slower load time:

```tsx
<FJImage
  src={backgroundImage}
  alt='Background'
  fill
  style={{
    objectFit: 'cover',
    objectPosition: 'top',
  }}
  sizes='20vw'
/>
```

### Proper Structure HTML

The page should follow proper structural markup to improve SEO. Utilize HTML tags like `h1`, `h2`, `p`, etc. One page should have at least one `h1` tag as the main title. For example:

```tsx
<h1 className='font-bold text-3xl sm:text-5xl'>
  {t('buka_petualangan_baru_dengan_game_key_harga_terbaik')}
</h1>
<h2 className='font-normal text-lg sm:text-xl text-charcoal'>
  {t(
    'temukan_game_hebat_yang_lebih_murah_dan_bisa_dikirimkan_kepada_kamu_dalam_sekejap_game_bagus_penawaran_bagus'
  )}
</h2>
```

### Use Dynamic Import

To reduce load time, content below the fold should be loaded on demand. One method to do that is using dynamic import. If the component is a client component, make sure to use `{ ssr: false }` so the component only loads after the initial server load:

```typescript
const FindGameSectionMobile = dynamic(
  () =>
    import('components/features/game-key/sections/find-game-section/mobile'),
  { ssr: false }
);
```

### Caching

To minimize requests to the gateway, some data should be cached. There are 2 ways to cache in the new web:

#### Client Side

On the client side, you can't use Redis, so the alternative is `sessionStorage`.

1. **Import the helper function:**
```typescript
import { retrieveFromSessionStorage } from 'helpers/storage-helper';
```

2. **Generate cache key with `generateCacheKeyFromObject` function.**

3. **Wrap the fetch function and decide how long the cache lasts:**

```typescript
export async function fetchSellerBadge(userId: number, token: string) {
    return await retrieveFromSessionStorage('sellerBadgeData_' + userId, async () => {
        const response = await AxiosHelper.getWithParams(`${getGatewayUrl()}${endpoint}`, { seller_id: userId }, {
            accessToken: token
        });
        return response?.data?.current_tier;
    }, DURATION.IN_SECOND_1_MINUTES);
}
```

#### Server Side
On the server side, the cache will be using Redis.

1. **Import the helper function:**
```typescript
import { retrieveCache } from 'helpers/cache-helper';
```

2. **Generate cache key with `generateCacheKeyFromObject` function.**

3. **Wrap the fetch function and decide how long the cache lasts:**

```typescript
export async function fetchPaymentMethodIcon() {
    return await retrieveCache(generateCacheKeyFromObject('paymentMethodIcon'), async () => {
        const response = await AxiosHelper.getWithParams(`${getGatewayUrl()}${endpoint}`, {});
        return response;
    }, DURATION.IN_SECOND_30_MINUTES);
}
``` 

