"use client";

import { useEffect, useState } from "react";

import type { Product } from "@/lib/partner-api";
import { partnerBrowserApi } from "@/lib/partner-api/browser-client";

// The how-to article is shared by every product under the same item type, so
// cache article bodies by item_type_id — reopening the panel/sheet for another
// product in the same item type reuses it instead of re-fetching. Keyed by
// item_type_id (not the faq id itself) since that's the field the product
// list is actually filtered/grouped by. Module-level so the desktop panel and
// mobile sheet share one cache.
const howToArticleCache = new Map<number, string>();

// The zendesk proxy returns the article body HTML-entity-escaped (e.g. "&lt;p&gt;")
// rather than raw markup, so decode it once before handing it to HtmlContent —
// otherwise the tags render as visible text instead of formatted content.
function decodeHtmlEntities(html: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

export function useHowToTradeArticle(active: boolean, product: Product | null | undefined, hashCode: string) {
  const howToTradeFaqId = (product?.item_type as { how_to_trade_faq_id?: string } | undefined)?.how_to_trade_faq_id;
  const itemTypeId = product?.item_type_id;

  const [article, setArticle] = useState<{ itemTypeId: number; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!active || !howToTradeFaqId || itemTypeId === undefined) return;
    if (article?.itemTypeId === itemTypeId) return;

    const cached = howToArticleCache.get(itemTypeId);
    if (cached !== undefined) {
      setArticle({ itemTypeId, body: cached });
      setError(false);
      return;
    }

    const ctrl = new AbortController();
    let cancelled = false;
    async function loadHowToArticle() {
      setLoading(true);
      setError(false);
      try {
        const res = await partnerBrowserApi.getZendeskArticle(howToTradeFaqId as string, {
          hashCode,
          signal: ctrl.signal,
        });
        const body = decodeHtmlEntities(res.article?.body ?? "");
        howToArticleCache.set(itemTypeId as number, body);
        if (!cancelled) setArticle({ itemTypeId: itemTypeId as number, body });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadHowToArticle();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [active, howToTradeFaqId, itemTypeId, article?.itemTypeId, hashCode]);

  return {
    howToTradeFaqId,
    article: itemTypeId !== undefined && article?.itemTypeId === itemTypeId ? article : null,
    loading,
    error,
  };
}
