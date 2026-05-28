import { defineRouting } from "next-intl/routing";

// Temporarily ID-only. Restore `["en", "id"]` here to re-enable English.
export const routing = defineRouting({
  locales: ["id"],
  defaultLocale: "id",
  localePrefix: "as-needed",
});
