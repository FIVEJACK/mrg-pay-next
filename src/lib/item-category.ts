export const ITEM_CATEGORY = {
  1: "Currency",
  2: "Item",
  3: "Account",
  4: "Voucher",
  5: "Pulsa",
  6: "Game",
  7: "Wallet Injection",
  8: "etc",
  9: "Top Up",
  10: "Boosting",
  11: "Sneakers",
  12: "Software & Aplikasi",
  13: "NFT",
  14: "Joki",
  15: "Console & Accessories",
  16: "Top Up Login",
  17: "Akun Streaming",
  18: "Game Key",
  19: "Curated Item",
} as const;

export type ItemCategoryId = keyof typeof ITEM_CATEGORY;
export type ItemCategoryName = (typeof ITEM_CATEGORY)[ItemCategoryId];

/** Resolve a category id to its name, or `null` when unknown/missing. */
export function getItemCategoryName(
  id: number | null | undefined,
): ItemCategoryName | null {
  if (id == null) return null;
  return ITEM_CATEGORY[id as ItemCategoryId] ?? null;
}
