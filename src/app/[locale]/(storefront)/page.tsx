import type { Metadata } from "next";

import { config } from "@/config/config";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Home",
  description: "LapakGaming x itemku partner storefront",
};

// Local-dev B2B2C test hash from PARTNER_API.md §1.3.
// Decodes to { partner_id, game_id: 51, item_type_id: 234, currency, country_code }.

const FEATURED_DEV = [
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

const FEATURED_PROD_TEST = [
    {
    name: "Grow A Garden 2",
    subtitle: "-",
    hashCode: '27988f40241b1d70e73d612a8f7e10f1b55c7c50f9b03f08385057243f0a6d763ff32abd0b5ce1607b8f2c10334a4534552db2a8c95d4948bf6cf094a2c28592c58af6d6c8578dff22cbf0511b07b771d896388cc2cc6c67bb03dce1497b',
  },
  {
    name: "Blox Fruits",
    subtitle: "-",
    hashCode: '31f7f3d9f8cf6b66da967a0f526963bc361c74a695a6952160f04ecdeb4374a993d8c2ffe18fc3e9e9c521a992faa0cf83e8a13271f308d35f60f6abb964e90a5d21ebb1108512d503e19396f8ccfdcdfb98f2a1dbe302af7d31e77796bbed',
  },
  {
    name:"Pet Simulator 99!",
    subtitle: "-",
    hashCode: 'b00f481940754c97d6b15a6fbf0c099fc31cfdf690564c0e6e1e658a1a35c5b87e3dad25edeb912f1d8aa9d46ad29ff2a627c77f29958391a9bbc41f08f3381a04dc8cb99c2b19dd5cc36ab7d385d864158b32c8b8728241193d55e362ec09',
  }
]
const FEATURED =
  config.environment === "production" ? FEATURED_PROD_TEST : FEATURED_DEV;
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
