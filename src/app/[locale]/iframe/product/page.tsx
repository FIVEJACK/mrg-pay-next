import { Breadcrumb } from "@/components/pdp/breadcrumb";
import { GameHeader } from "@/components/pdp/game-header";
import { HeroBackground } from "@/components/pdp/hero-background";
import { ProductListClient } from "@/components/pdp/product-list-client";
import { tryDecodeB2b2cHash } from "@/lib/partner-api/b2b2c-hash";
import {
  partnerApi,
  PartnerApiError,
  pickGameLogo,
  type B2b2cAttribute,
} from "@/lib/partner-api";
import type { GameInfoData, ProductListQuery } from "@/lib/partner-api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    hash_code?: string;
    item_type_id?: string;
    item_info_group_id?: string;
    item_info_id?: string;
    server_id?: string;
    page?: string;
    keyword?: string;
    sort?: string;
  }>;
};

export default async function ProductIframePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const hashCode = sp.hash_code?.trim();

  if (!hashCode) return <MissingHashState />;

  const scope = tryDecodeB2b2cHash(hashCode);
  if (!scope) return <MissingHashState />;
  const gameId = scope.game_id;

  // Fetch in parallel — game-info populates the breadcrumb/header/tabs, and
  // the attribute config drives the b2b2c filter UI.
  const [gameInfo, attributes]: [GameInfoData | null, B2b2cAttribute[] | null] =
    await Promise.all([
      safeCall(() => partnerApi.getGameInfo(gameId, { hashCode })),
      safeCall(() => partnerApi.getProductAttributeConfiguration(hashCode)),
    ]);

  const itemTypes = gameInfo?.item_type ?? [];
  const gameName = gameInfo?.game?.game_name ?? `Game #${gameId}`;

  const urlItemTypeId = numOrUndef(sp.item_type_id);
  const fallbackItemTypeId = scope.item_type_id || itemTypes[0]?.id || 0;
  const initialItemTypeId =
    urlItemTypeId && itemTypes.some((t) => t.id === urlItemTypeId)
      ? urlItemTypeId
      : fallbackItemTypeId;

  const initialAttributes: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k.startsWith("attr_") && v.trim() !== "") {
      initialAttributes[k.slice("attr_".length)] = v;
    }
  }

  const filters = {
    itemInfoGroupId: numOrUndef(sp.item_info_group_id),
    itemInfoId: numOrUndef(sp.item_info_id),
    serverId: numOrUndef(sp.server_id),
    attributes: initialAttributes,
    page: Math.max(1, Number(sp.page ?? "1") || 1),
    keyword: sp.keyword?.trim() || undefined,
    sort: (sp.sort as ProductListQuery["sort"]) ?? "popular",
  };

  return (
    <div className="relative">
      <HeroBackground />

      <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-[116px]">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: gameName }]} />

        <div className="mt-6">
          <GameHeader name={gameName} logoUrl={pickGameLogo(gameInfo?.game)} />
        </div>

        <ProductListClient
          hashCode={hashCode}
          gameId={gameId}
          itemTypes={itemTypes}
          initialItemTypeId={initialItemTypeId}
          scopeItemTypeId={fallbackItemTypeId}
          attributes={attributes ?? []}
          servers={gameInfo?.server ?? []}
          serverLabel={gameInfo?.server_label ?? null}
          hasServer={gameInfo?.has_server === 1}
          filters={filters}
        />
      </div>
    </div>
  );
}

function numOrUndef(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof PartnerApiError) {
      console.warn(`[partner-api] ${err.statusCode} (${err.httpStatus}): ${err.message}`);
    } else {
      console.warn(`[partner-api] unexpected error:`, err);
    }
    return null;
  }
}

function MissingHashState() {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
        Missing or invalid <code>hash_code</code>
      </h1>
      <p className="mt-3 text-(--color-text-subdued)">
        This iframe expects <code>?hash_code=&lt;hash&gt;</code>.
      </p>
    </div>
  );
}
