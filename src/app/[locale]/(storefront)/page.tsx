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
    hashCode: '869a503e20bc86b02c681efee37f4e7384b1b6ecee3448cff1a3d42465ba705049dee7535bd087b72b06253e6e0c28e9ffd2f304024fef433c5ec22c21c99659976de7146531ca2d6d2910855c8d6db54a416e4d636bb4cc12e0ab3c8238',
  },
  {
    name: "Roblox",
    subtitle: "Roblox — sample B2B2C scope",
    hashCode: '367819938deb4a30e2854e9b044dc039cc0238d54303176e7806f81b35125478c409472b866e2762e8b449b6336f0929042b93032d3f4d6742898ba9cfbc6ce5d3eadec82be8ad2737e5fdca90e6705d95ab9af7d6e08795d2ec3aa1206f',
  },
  {
    name:"World of Warcraft",
    subtitle: "WoW — sample B2B2C scope",
    hashCode: 'eb811776894465fe3eb17fcdd42cc0b89f1a01fb06e56f50946075c4a60736e8b53ca0c24ff0b1fba017ef304ad1b235232dc363a4f06ec5c5e646782280b66cb19d94c9e858ae66e7603c31054e30aceb1d6c68bee1f0a0752a4ec8a9f5fd',
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
