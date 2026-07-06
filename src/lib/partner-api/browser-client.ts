// Browser-side variant of the partner API client: hits the local `/api/partner/*`
// proxy so requests stay same-origin (no CORS).
import type {
  B2b2cAttribute,
  ChatTokenResponse,
  CreateOrderBody,
  CreateOrderResponse,
  Envelope,
  GameInfoData,
  GameInfoDetailData,
  PartnerTokenResponse,
  PaymentGroup,
  ProductListData,
  ProductListQuery,
  RequiredInfoField,
  SellerInfo,
  TransactionDetail,
} from "./index";
import { PartnerApiError } from "./client";

const PROXY_BASE = "/api/partner";

type QueryValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string | string[] | { min?: string; max?: string }>
  | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const usp = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) {
        for (const x of v) usp.append(`${k}[]`, String(x));
      } else if (typeof v === "object") {
        const prefix = k === "attributes" ? "product_attributes" : k;
        for (const [attrId, attrVal] of Object.entries(v)) {
          if (attrVal === undefined || attrVal === null) continue;
          if (Array.isArray(attrVal)) {
            // CHECKBOX: product_attributes[id][0]=v0&[1]=v1
            (attrVal as string[]).forEach((item, i) => {
              if (item) usp.append(`${prefix}[${attrId}][${i}]`, item);
            });
          } else if (typeof attrVal === "object") {
            // FREE_TEXT: product_attributes[id][min]=v&[max]=v
            const range = attrVal as { min?: string; max?: string };
            if (range.min) usp.append(`${prefix}[${attrId}][min]`, range.min);
            if (range.max) usp.append(`${prefix}[${attrId}][max]`, range.max);
          } else {
            // RADIO: product_attributes[id]=value
            usp.append(`${prefix}[${attrId}]`, String(attrVal));
          }
        }
      } else {
        usp.set(k, String(v));
      }
    }
  }
  const qs = usp.toString();
  return qs ? `${PROXY_BASE}${path}?${qs}` : `${PROXY_BASE}${path}`;
}

// Module-level token store. Populated by `mintPartnerToken` (or explicitly via
// `setPartnerAccessToken`); read by every subsequent request that targets a
// protected endpoint. Lives in memory only — a page reload triggers a re-mint.
let _accessToken: string | null = null;

export function setPartnerAccessToken(token: string | null) {
  _accessToken = token;
}

export function getPartnerAccessToken(): string | null {
  return _accessToken;
}

async function request<T>(
  path: string,
  opts: {
    method?: "GET" | "POST";
    query?: Record<string, QueryValue>;
    body?: unknown;
    hashCode?: string;
    /** Override the module-level access token for this call. */
    accessToken?: string | null;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const url = buildUrl(path, opts.query);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.hashCode) headers["x-api-key"] = opts.hashCode;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const token = opts.accessToken !== undefined ? opts.accessToken : _accessToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: "include",
  });

  // Read as text first so we can surface non-JSON errors (e.g. the gateway's
  // plain-text "Unauthorized 01" on a missing JWT) instead of swallowing them
  // behind a generic "Non-JSON response".
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      const code = res.status === 401 ? "unauthorized" : "invalidJson";
      throw new PartnerApiError(code, res.status, text.slice(0, 200));
    }
  }

  if (!res.ok || !isEnvelope(body) || !body.success) {
    const env = isEnvelope(body) ? body : null;
    throw new PartnerApiError(
      env?.statusCode ?? "unknown",
      res.status,
      env?.message ?? `Partner API ${res.status}`,
    );
  }
  return body.data as T;
}

function isEnvelope(v: unknown): v is Envelope<unknown> {
  return typeof v === "object" && v !== null && "success" in v && "statusCode" in v;
}

export const partnerBrowserApi = {
  getProductAttributeConfiguration(hashCode: string, signal?: AbortSignal) {
    return request<B2b2cAttribute[]>("/v1/product/product-attribute-configuration", {
      hashCode,
      signal,
    });
  },
  getGameInfo(gameId: number, opts?: { hashCode?: string; signal?: AbortSignal }) {
    return request<GameInfoData>("/v1/product/game-info", {
      query: { game_id: gameId },
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  getGameInfoDetail(itemTypeId: number, opts?: { gameId?: number; hashCode?: string; signal?: AbortSignal }) {
    return request<GameInfoDetailData>("/v1/product/game-info/detail", {
      query: { item_type_id: itemTypeId, game_id: opts?.gameId },
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  getProducts(params: ProductListQuery, opts?: { hashCode?: string; signal?: AbortSignal }) {
    return request<ProductListData>("/v1/product", {
      query: params as Record<string, QueryValue>,
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  getPaymentMethods(country?: string, opts?: { signal?: AbortSignal }) {
    return request<PaymentGroup[]>("/v1/payment-method", {
      query: { country },
      signal: opts?.signal,
    });
  },
  /**
   * Per-item-type required-info schema (labels, placeholders, validation
   * rules, dropdown options). Empty array means the buyer doesn't need to
   * provide any extra fields for this item type.
   */
  getRequiredInfo(itemTypeId: number, opts?: { signal?: AbortSignal }) {
    return request<RequiredInfoField[]>("/v1/product/required-info", {
      query: { item_type_id: itemTypeId },
      signal: opts?.signal,
    });
  },
  createOrder(body: CreateOrderBody, opts?: { hashCode?: string; signal?: AbortSignal }) {
    return request<CreateOrderResponse>("/v1/order", {
      method: "POST",
      body,
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  /**
   * Mint a partner JWT scoped to `transaction_uuid` and stash the resulting
   * `access_token` so subsequent protected calls automatically include it as
   * `Authorization: Bearer <jwt>`. The gateway also sets an httpOnly cookie
   * but ignores it for auth; the Authorization header is mandatory.
   */
  async mintPartnerToken(transaction_uuid: string, opts?: { hashCode?: string; signal?: AbortSignal }) {
    const res = await request<PartnerTokenResponse>("/v1/token", {
      method: "POST",
      body: { transaction_uuid },
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
    if (res?.access_token) setPartnerAccessToken(res.access_token);
    return res;
  },
  getTransactionDetail(
    transaction_uuid: string,
    opts?: { hashCode?: string; signal?: AbortSignal; countryCodes?: string[] },
  ) {
    return request<TransactionDetail>("/v1/transaction/detail", {
      query: { transaction_uuid, country_codes: opts?.countryCodes },
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  authenticateChat(opts?: { hashCode?: string; signal?: AbortSignal }) {
    return request<ChatTokenResponse>("/v1/chat/authenticate", {
      method: "POST",
      body: {},
      hashCode: opts?.hashCode,
      signal: opts?.signal,
    });
  },
  /**
   * Server-side postprocess hook the gateway fires after a chat message is
   * delivered (notifications, moderation, indexing). Best-effort — the
   * message itself is already published to PubNub before this call runs.
   */
  postprocessMessage(
    body: {
      text: string;
      files: string[];
      chat_conversation_id: string;
      user_id: string;
      timetoken: string;
    },
    opts?: { signal?: AbortSignal },
  ) {
    return request<unknown>("/v1/chat/message/postprocess", {
      method: "POST",
      body,
      signal: opts?.signal,
    });
  },
  /**
   * Public seller profile. The gateway double-wraps the payload as
   * `{ data: SellerInfo }` inside the envelope, so we unwrap it here.
   */
  async getSellerInfo(sellerId: number, opts?: { signal?: AbortSignal }) {
    const res = await request<{ data?: SellerInfo } | SellerInfo>("/v1/seller-info", {
      query: { seller_id: sellerId },
      signal: opts?.signal,
    });
    return (res as { data?: SellerInfo }).data ?? (res as SellerInfo);
  },
};

export { PartnerApiError };
