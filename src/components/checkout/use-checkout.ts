"use client";

import { useEffect, useMemo, useState } from "react";

import {
  partnerBrowserApi,
  PartnerApiError,
} from "@/lib/partner-api/browser-client";
import { calculatePaymentFee, checkPaymentMethodLimit } from "@/lib/partner-api";
import type {
  CreateOrderBody,
  PaymentGroup,
  Product,
  RequiredInfoField,
} from "@/lib/partner-api";
import { addRecentEmail, getRecentEmails } from "@/lib/recent-emails";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutViewProps = {
  product: Product;
  productImageUrl: string | null;
  initialQuantity: number;
  /** B2B2C hash that scopes the order to the current partner/game/item-type. */
  hashCode: string;
  buyerCountry?: string;
  buyerCurrency?: string;
};

/**
 * Shared checkout state, data-fetching, and submit logic for both the dweb and
 * mweb checkout compositions. Keeping it here means the two layouts can diverge
 * freely (sidebar vs. sticky bottom bar) without duplicating the buyer-input,
 * payment-method, fee, and order-creation behaviour.
 */
export function useCheckout({
  product,
  initialQuantity,
  hashCode,
  buyerCountry = "ID",
  buyerCurrency = "IDR",
}: CheckoutViewProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  useEffect(() => {
    setRecentEmails(getRecentEmails());
  }, []);

  const [requiredInfoFields, setRequiredInfoFields] = useState<RequiredInfoField[]>([]);
  const [requiredInfoLoading, setRequiredInfoLoading] = useState(true);
  const [requiredInfoValues, setRequiredInfoValues] = useState<Record<string, string>>({});
  const [requiredInfoErrors, setRequiredInfoErrors] = useState<Record<string, string>>({});

  const [quantity, setQuantity] = useState(() => Math.max(1, initialQuantity));

  const [paymentGroups, setPaymentGroups] = useState<PaymentGroup[] | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch the buyer-input schema for this item type. Empty schema means no
  // extra fields are required (e.g. account-selling products).
  useEffect(() => {
    const itemTypeId = product.item_type_id;
    if (!itemTypeId) {
      setRequiredInfoFields([]);
      setRequiredInfoLoading(false);
      return;
    }
    const controller = new AbortController();
    setRequiredInfoLoading(true);
    partnerBrowserApi
      .getRequiredInfo(itemTypeId, { signal: controller.signal })
      .then((fields) => setRequiredInfoFields(fields))
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        setRequiredInfoFields([]);
      })
      .finally(() => setRequiredInfoLoading(false));
    return () => controller.abort();
  }, [product.item_type_id]);

  useEffect(() => {
    const controller = new AbortController();
    setPaymentLoading(true);
    partnerBrowserApi
      .getPaymentMethods(buyerCountry, { signal: controller.signal })
      .then((groups) => {
        setPaymentGroups(groups);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        const msg =
          err instanceof PartnerApiError ? err.message : "Tidak dapat menghubungi server.";
        setPaymentError(msg);
      })
      .finally(() => setPaymentLoading(false));
    return () => controller.abort();
  }, [buyerCountry]);

  const subtotal = product.price * quantity;

  // Derive the effective selection during render: prefer the user's explicit
  // pick when it fits the current subtotal, otherwise fall back to the first
  // method whose min/max range covers `subtotal`. This keeps quantity changes
  // and initial load consistent without a setState-in-effect.
  const availableMethods = useMemo(
    () =>
      paymentGroups
        ? paymentGroups
            .filter((g) => g.is_active === 1)
            .flatMap((g) => g.payment_method_list.filter((m) => m.is_active === 1))
        : [],
    [paymentGroups],
  );
  const userPickedMethod =
    selectedPaymentId != null
      ? availableMethods.find((m) => m.id === selectedPaymentId) ?? null
      : null;
  const userPickValid =
    userPickedMethod != null &&
    checkPaymentMethodLimit(userPickedMethod, subtotal) == null;
  const effectiveMethod = userPickValid
    ? userPickedMethod
    : availableMethods.find((m) => checkPaymentMethodLimit(m, subtotal) == null) ?? null;
  const effectivePaymentId = effectiveMethod?.id ?? null;

  const selectedFee = effectiveMethod ? calculatePaymentFee(effectiveMethod, subtotal) : 0;
  const total = subtotal + selectedFee;
  const stock = typeof product.stock === "number" && product.stock > 0 ? product.stock : undefined;

  function setRequiredInfoValue(name: string, value: string) {
    setRequiredInfoValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate(): boolean {
    let ok = true;
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError("Masukkan email yang valid.");
      ok = false;
    } else {
      setEmailError(null);
    }
    const fieldErrors: Record<string, string> = {};
    for (const field of requiredInfoFields) {
      const value = (requiredInfoValues[field.field_name] ?? "").trim();
      if (!value) {
        fieldErrors[field.field_name] =
          field.error_message || `${field.name} wajib diisi.`;
        ok = false;
        continue;
      }
      if (field.pattern) {
        try {
          if (!new RegExp(field.pattern).test(value)) {
            fieldErrors[field.field_name] =
              field.error_message || `${field.name} tidak valid.`;
            ok = false;
          }
        } catch {
          // Ignore malformed patterns rather than blocking the buyer.
        }
      }
    }
    setRequiredInfoErrors(fieldErrors);
    return ok;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;
    if (effectivePaymentId == null) {
      setSubmitError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    const requiredInfoPayload: Record<string, string> = {};
    for (const field of requiredInfoFields) {
      const value = (requiredInfoValues[field.field_name] ?? "").trim();
      if (value) requiredInfoPayload[field.field_name] = value;
    }

    const body: CreateOrderBody = {
      payment_method_id: effectivePaymentId,
      product_id: product.id,
      quantity,
      price: product.price,
      email,
      buyer_price: String(product.price),
      buyer_country: buyerCountry,
      buyer_currency: buyerCurrency,
      required_information: JSON.stringify(requiredInfoPayload),
    };

    setSubmitting(true);
    try {
      const result = await partnerBrowserApi.createOrder(body, { hashCode });
      // Order created successfully — remember this email for next time.
      addRecentEmail(email);
      const redirect =
        result?.direct_payment?.checkoutUrl ||
        result?.direct_payment?.gateway?.url ||
        result?.data?.direct_payment?.checkoutUrl ||
        result?.data?.direct_payment?.gateway?.url ||
        result?.data?.payment_url ||
        null;
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      const uuid = result?.data?.transaction_uuid?.uuid;
      if (uuid) {
        const qs = new URLSearchParams({ transaction_uuid: uuid });
        window.location.href = `/invoice?${qs.toString()}`;
        return;
      }
      setSubmitError("Pesanan dibuat, tetapi tidak ada URL pembayaran yang dikembalikan.");
    } catch (err) {
      if (err instanceof PartnerApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Gagal memproses pesanan. Coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const productSubtitle = product.item_type?.name ?? product.game?.name ?? null;

  return {
    // buyer
    email,
    setEmail,
    emailError,
    recentEmails,
    // required info
    requiredInfoFields,
    requiredInfoLoading,
    requiredInfoValues,
    setRequiredInfoValue,
    requiredInfoErrors,
    // quantity
    quantity,
    setQuantity,
    stock,
    // payment
    paymentGroups,
    paymentLoading,
    paymentError,
    effectivePaymentId,
    setSelectedPaymentId,
    // money
    subtotal,
    selectedFee,
    total,
    // submit
    submitting,
    submitError,
    handleSubmit,
    // misc
    productSubtitle,
  };
}
