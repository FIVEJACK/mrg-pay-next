import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Home",
  description: "LapakGaming x itemku partner storefront",
};

// Local-dev B2B2C test hash from PARTNER_API.md §1.3.
// Decodes to { partner_id, game_id: 51, item_type_id: 234, currency, country_code }.

const FEATURED = [
  {
    name: "Mobile Legends",
    subtitle: "MLBB — sample B2B2C scope",
    hashCode: '6165c36563c143227fdbf52ccdb679436296584ec9826fcc2cd7238d35705a48ab4dc3c50d8484d09c933b192d42c9ec8630593386caf7cf36e1b5932e0d6474f5dd7e79c62e8993581038dc44cd440291c669b0a62e6c037456e45cbd04a95657991923f331b09653721121c61f908b5b',
  },
  {
    name: "Roblox",
    subtitle: "Roblox — sample B2B2C scope",
    hashCode: '4c98618e787411b9edb7631648e2530d3a700350d6c55af69cf4bae5fdad4f07daa07eb6373d20dc5494db6f26a10dc0dc2045e9ba2e3239011870af4efae62eb654b346646a7b2da782f765f020b410ea82b6dc357a5bd84dd125ef0deb933b33bb9e59920d62f1cf23788b1ec714364e',
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-[116px]">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight">
        this is test page, will be removed later
      </h1>
      <p className="mt-2 text-sm text-(--color-text-subdued)">
        Pick a game to browse partner products.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((g) => (
          <li key={g.name}>
            <Link
              href={`/product-list?hash_code=${encodeURIComponent(g.hashCode)}`}
              className="block rounded-2xl border border-(--color-border) bg-white p-5 transition hover:border-(--color-brand)"
            >
              <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-(--color-text-title)">
                {g.name}
              </p>
              <p className="mt-1 text-sm text-(--color-brand)">{g.subtitle}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
