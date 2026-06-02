export type Envelope<T> = {
  success: boolean;
  data: T;
  message: string;
  statusCode: string;
};

export type GameSummary = {
  game_id: number;
  game_name: string;
  game_slug?: string;
  nickname?: string | null;
  description?: string | null;
  description_translation?: string | null;
  banner_image_url?: string | null;
  og_image_url?: string | null;
  poster_image_url?: string | null;
  how_to_trade_link?: string | null;
  is_strict_item_info?: 0 | 1;
};

export type ItemType = {
  id: number;
  name: string;
  slug?: string;
  game_id: number;
  game_name?: string;
  game_slug?: string;
  sequence?: number;
  icon_image_url?: string | null;
  default_product_image_url?: string | null;
  horizontal_image_url?: string | null;
  vertical_image_url?: string | null;
  item_info_group_label?: string | null;
  item_info_label?: string | null;
  is_use_catalog_design?: 0 | 1;
  use_new_catalog_design?: 0 | 1;
  has_auto_delivery?: number;
  is_fast_delivery_eligible?: 0 | 1;
};

export type Server = {
  id: number;
  game_id: number;
  name: string;
};

export type GameInfoData = {
  game: GameSummary;
  item_type: ItemType[];
  server: Server[];
  has_server: 0 | 1;
  genre?: { id: number; name: string } | null;
  server_label?: string | null;
};

export type ItemInfo = {
  id: number;
  name: string;
  item_info_group_id?: number;
  slug?: string | null;
  item_type_slug?: string | null;
  is_highest_sales?: boolean;
};

export type ItemInfoGroup = {
  id: number;
  name: string;
  sequence: number;
  item_info: ItemInfo[];
};

export type GameInfoDetailData = {
  item_info_group: ItemInfoGroup[];
};

export type ProductImage = {
  image_url?: string | null;
  thumbnail_image_url?: string | null;
  horizontal_image_url?: string | null;
  vertical_image_url?: string | null;
};

export type ProductSeller = {
  id: number;
  shop_name: string;
  profile_picture_url?: string | null;
  average_rating?: number | null;
  rating_count?: number | null;
  is_open?: 0 | 1;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  market_price?: number | null;
  competitor_price?: number | null;
  seller_price?: number | string;
  seller_currency?: string;
  game?: { id: number; name: string; slug?: string };
  game_id?: number;
  item_type?: { name: string; slug?: string };
  item_type_id?: number;
  item_info?: { id: number; slug?: string | null };
  item_info_id?: number;
  item_info_group_id?: number;
  images?: ProductImage[];
  horizontal_image_url?: string | null;
  vertical_image_url?: string | null;
  seller?: ProductSeller;
  seller_emblem?: string | null;
  order_record?: {
    product_id?: number;
    successful_order_count?: number;
    failed_order_count?: number;
    total_gmv_7_days?: number;
  };
  stock?: number;
  use_auto_delivery?: 0 | 1;
  use_fast_delivery?: 0 | 1;
  use_instant_delivery?: 0 | 1;
  server_id?: number | null;
  server_name?: string | null;
};

export type ProductListData = {
  data: Product[];
  /** Items in THIS response, not the global count (gateway uses cursor pagination). */
  total_item?: number;
  /** Usually `null` — the gateway doesn't compute a global page count for partner queries. */
  total_page?: number | null;
  current_page?: number;
  item_per_page?: number;
  /** Cursor-style: page number of the previous batch, or `null` on the first page. */
  prev_page?: number | null;
  /** Cursor-style: page number of the next batch, or `null` on the last page. */
  next_page?: number | null;
};

/** Union of the three possible attribute filter values sent to the API. */
export type AttributeValue =
  | string                          // RADIO — single value
  | string[]                        // CHECKBOX — multiple values
  | { min?: string; max?: string }; // FREE_TEXT — numeric range

export type ProductListQuery = {
  id?: number;
  game_id?: number;
  item_type_id?: number;
  item_info_group_id?: number;
  item_info_id?: number;
  server_id?: number;
  keyword?: string;
  page?: number;
  per_page?: number;
  sort?:
  | "latest"
  | "oldest"
  | "cheap"
  | "expensive"
  | "popular"
  | "fastest_delivery"
  | "shop_rating";
  use_simple_pagination?: boolean;
  country_codes?: string[];
  /**
   * Dynamic product-attribute filters keyed by attribute id (as string).
   * Serialized as `product_attributes[<id>][<key>]=<value>` on the wire.
   * - RADIO    → string          → product_attributes[id]=value
   * - CHECKBOX → string[]        → product_attributes[id][0]=v0&[1]=v1
   * - FREE_TEXT→ {min?,max?}     → product_attributes[id][min]=v&[max]=v
   */
  attributes?: Record<string, AttributeValue>;
};

export type RequiredInfoField = {
  id: number;
  item_type_id: number;
  /** Human-readable label (e.g. "Player ID", "Server"). */
  name: string;
  /** Key used in the `required_information` JSON sent with the order. */
  field_name: string;
  placeholder?: string;
  tooltip_text?: string;
  error_message?: string;
  /** Optional regex the value must match. */
  pattern?: string | null;
  alternative_pattern?: string | null;
  is_dropdown: 0 | 1;
  /** When `is_dropdown === 1`, a JSON-encoded string of option labels. */
  dropdown_options?: string | null;
  translation_value?: {
    name?: string;
    placeholder?: string;
    tooltip_text?: string;
    error_message?: string;
  };
};

export type PaymentMethodFeeTier = {
  id: number;
  payment_method_id: number;
  currency: string;
  /**
   * Tier threshold. The active tier is the one with the smallest
   * `amount_priority` that is strictly greater than the order amount; when no
   * tier matches, the highest-priority tier is used as a fallback.
   */
  amount_priority: number;
  fixed_fee: number;
  /** Stored as a percentage string, e.g. `"1.62"` means 1.62%. */
  fixed_rate: string;
  pg_fixed_fee?: number | null;
  pg_fixed_rate?: string | null;
};

export type PaymentMethod = {
  id: number;
  name: string;
  is_active: 0 | 1;
  currency?: string;
  payment_method_code?: string;
  payment_method_fee?: PaymentMethodFeeTier[];
  icon_url?: string | null;
  is_instant?: 0 | 1;
  is_maintenance?: 0 | 1;
  minimum_payment_limit?: number;
  maximum_payment_limit?: number;
};

export type PaymentGroup = {
  id: number;
  name: string;
  is_active: 0 | 1;
  payment_method_list: PaymentMethod[];
};

export type CreateOrderBody = {

  partner_id?: number;
  payment_method_id: number;
  product_id: number;
  quantity: number;
  price: number;
  email?: string;
  buyer_price?: string;
  buyer_country?: string;
  buyer_currency?: string;
  /** JSON-encoded string of the per-item-type required information. */
  required_information?: string;
  note?: string;
  request_guid?: string;
  device_id?: string;
};

export type SellerInfo = {
  seller_id: number;
  shop_name?: string;
  shop_is_active?: 0 | 1;
  shop_is_open?: 0 | 1;
  shop_profile_picture_url?: string | null;
  shop_slogan?: string | null;
  seller_country_code?: string;
  seller_currency?: string;
  shop_created_at?: string;
  last_login?: string;
  /** ISO timestamp of the seller's most recent activity (used by the chat panel for the "Aktif X lalu" pill). */
  last_activity_time?: string | null;
};

export type DirectPayment = {
  payload?: unknown[];
  gateway?: { url?: string; type?: string };
  checkoutUrl?: string;
  qr_content?: string;
};

export type PartnerTokenResponse = {
  access_token: string;
  expires_in: number;
};

export type ChatTokenResponse = {
  token: string;
  expired_timestamp: number;
};

/** Slice of the transaction-detail response we render on the invoice page. */
export type TransactionDetailOrder = {
  id: number;
  order_number?: string;
  product_id: number;
  product_name: string;
  product_image?: string | null;
  game_id?: number;
  item_type_id?: number;
  game_name?: string;
  item_type_name?: string;
  price: number;
  buyer_price?: number | string;
  quantity: number;
  status: number;
  use_auto_delivery?: 0 | 1;
  paid_at?: string | null;
  delivered_at?: string | null;
  confirmed_at?: string | null;
  required_information?: string;
  buyer_email?: string;
  buyer_name?: string;
  seller_id?: number;
  shop_name?: string;
};

export type TransactionDetail = {
  id: number;
  transaction_number?: string;
  buyer_id?: number;
  buyer_name?: string;
  buyer_country?: string;
  buyer_currency?: string;
  status: number;
  payment_status?: number;
  payment_method_id?: number;
  payment_method_name?: string;
  payment_method_media_url?: string | null;
  payment_url?: string | null;
  payment_due_date?: string | null;
  payment_instruction_text?: string | null;
  confirmed_at?: string | null;
  created_at?: string;
  invoice_amount?: number | string;
  total_payment_fee?: number | string;
  total_order_value?: number | string;
  total_buyer_order_value?: number | string;
  direct_payment?: DirectPayment;
  transaction_uuid?: { uuid?: string } | string;
  orders: TransactionDetailOrder[];
};

export type CreateOrderResponse = {
  /**
   * Doubly-enveloped: after the outer `{ success, data: ... }` strip, the
   * transaction record sits under `data` and the actionable redirect under
   * `direct_payment`.
   */
  data?: {
    id?: number;
    transaction_number?: string;
    transaction_uuid?: { uuid?: string };
    payment_url?: string | null;
    payment_method_name?: string;
    invoice_amount?: number | string;
    total_payment_fee?: number | string;
    direct_payment?: DirectPayment;
    [key: string]: unknown;
  };
  direct_payment?: DirectPayment;
};
