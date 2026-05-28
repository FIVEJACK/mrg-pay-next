import type { GameSummary, ItemType, Product } from "./types";

function firstNonEmpty(...urls: Array<string | null | undefined>): string | null {
  for (const u of urls) {
    if (typeof u === "string" && u.trim() !== "") return u;
  }
  return null;
}

export function pickProductCoverImage(product: Product): string | null {
  const first = product.images?.[0];
  return firstNonEmpty(
    first?.image_url,
    first?.horizontal_image_url,
    first?.thumbnail_image_url,
    first?.vertical_image_url,
    product.horizontal_image_url,
    product.vertical_image_url,
  );
}

export function pickGameLogo(game: GameSummary | null | undefined): string | null {
  if (!game) return null;
  return firstNonEmpty(game.poster_image_url, game.og_image_url, game.banner_image_url);
}

export function pickItemTypeIcon(itemType: ItemType | null | undefined): string | null {
  if (!itemType) return null;
  return firstNonEmpty(
    itemType.icon_image_url,
    itemType.horizontal_image_url,
    itemType.default_product_image_url,
  );
}
