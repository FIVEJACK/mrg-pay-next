import { config } from "@/config/config";

import type {
  Envelope,
  GameInfoData,
  GameInfoDetailData,
  PaymentGroup,
  ProductListData,
  ProductListQuery,
} from "./types";

export type B2b2cAttribute = {
  id: number;
  game_id: number;
  item_type_id: number;
  translation_key: string;
  sequence: number;
  configuration: Record<string, unknown>;
};

export class PartnerApiError extends Error {
  constructor(
    public readonly statusCode: string,
    public readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = "PartnerApiError";
  }
}

type QueryValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string | string[] | { min?: string; max?: string }>
  | undefined;

type FetchOptions = {
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Next.js cache options — defaults to 60s revalidate. */
  revalidate?: number | false;
};

function buildUrl(path: string, query?: FetchOptions["query"]) {
  const url = new URL(path, config.partnerApiBaseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(`${key}[]`, String(v));
      } else if (typeof value === "object") {
        const prefix = key === "attributes" ? "product_attributes" : key;
        for (const [attrId, attrVal] of Object.entries(value)) {
          if (attrVal === undefined || attrVal === null) continue;
          if (Array.isArray(attrVal)) {
            // CHECKBOX: product_attributes[id][0]=v0&[1]=v1
            (attrVal as string[]).forEach((item: string, i: number) => {
              if (item) url.searchParams.append(`${prefix}[${attrId}][${i}]`, item);
            });
          } else if (typeof attrVal === "object") {
            // FREE_TEXT: product_attributes[id][min]=v&[max]=v
            const range = attrVal as { min?: string; max?: string };
            if (range.min) url.searchParams.append(`${prefix}[${attrId}][min]`, range.min);
            if (range.max) url.searchParams.append(`${prefix}[${attrId}][max]`, range.max);
          } else {
            // RADIO: product_attributes[id]=value
            url.searchParams.append(`${prefix}[${attrId}]`, String(attrVal));
          }
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...opts.headers,
    },
    next:
      opts.revalidate === false
        ? { revalidate: false }
        : { revalidate: opts.revalidate ?? 60 },
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new PartnerApiError(
      "invalidJson",
      res.status,
      `Partner API returned non-JSON (${res.status})`,
    );
  }

  if (!res.ok) {
    if (isEnvelope(body)) {
      throw new PartnerApiError(
        body.statusCode ?? "unknown",
        res.status,
        body.message ?? "Partner API error",
      );
    }
    throw new PartnerApiError(
      "validation",
      res.status,
      `Partner API ${res.status}: ${JSON.stringify(body)}`,
    );
  }

  if (!isEnvelope(body)) {
    throw new PartnerApiError(
      "invalidEnvelope",
      res.status,
      "Partner API response missing envelope",
    );
  }
  if (!body.success) {
    throw new PartnerApiError(
      body.statusCode ?? "unknown",
      res.status,
      body.message ?? "Partner API returned success=false",
    );
  }
  return body.data as T;
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "statusCode" in value
  );
}

function b2b2cHeaders(hashCode?: string) {
  return hashCode ? { "x-api-key": hashCode } : undefined;
}

export const partnerApi = {
  getGameInfo(
    gameId: number,
    opts?: {
      countryCodes?: string[];
      isIncludeGameExpansionCountry?: boolean;
      isIncludeRegionLock?: boolean;
      hashCode?: string;
    },
  ) {
    return request<GameInfoData>("/partner/v1/product/game-info", {
      query: {
        game_id: gameId,
        country_codes: opts?.countryCodes,
        is_include_game_expansion_country: opts?.isIncludeGameExpansionCountry,
        is_include_region_lock: opts?.isIncludeRegionLock,
      },
      headers: b2b2cHeaders(opts?.hashCode),
    });
  },

  getGameInfoDetail(
    itemTypeId: number,
    opts?: { gameId?: number; countryCodes?: string[]; hashCode?: string },
  ) {
    return request<GameInfoDetailData>("/partner/v1/product/game-info/detail", {
      query: {
        item_type_id: itemTypeId,
        game_id: opts?.gameId,
        country_codes: opts?.countryCodes,
      },
      headers: b2b2cHeaders(opts?.hashCode),
    });
  },

  /**
   * Requires one of game_id / item_type_id / item_info_group_id / id as an indexed filter.
   * The validator declares item_type_id as required.
   */
  getProducts(params: ProductListQuery, opts?: { hashCode?: string }) {
    return request<ProductListData>("/partner/v1/product", {
      query: params,
      headers: b2b2cHeaders(opts?.hashCode),
    });
  },

  getPaymentMethods(country?: string) {
    return request<PaymentGroup[]>("/partner/v1/payment-method", {
      query: { country },
    });
  },

  /**
   * B2B2C-only. Returns attribute config for the partner's scope; the response
   * contains the decoded `game_id` and `item_type_id` from the `x-api-key` hash.
   */
  getProductAttributeConfiguration(hashCode: string) {
    return request<B2b2cAttribute[]>(
      "/partner/v1/product/product-attribute-configuration",
      { headers: b2b2cHeaders(hashCode) },
    );
  },
};
