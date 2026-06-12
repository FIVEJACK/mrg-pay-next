"use client";

import { useCheckout, type CheckoutViewProps } from "@/components/checkout/use-checkout";

import { BuyerInfoCard } from "@/components/checkout/buyer-info-card";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { PaymentMethodList } from "@/components/checkout/payment-method-list";
import { Snackbar } from "@/components/shared/snackbar";

import { CheckoutBottomBar } from "./checkout-bottom-bar";


export function CheckoutMobile(props: CheckoutViewProps) {
  const { product, productImageUrl } = props;
  const {
    email,
    setEmail,
    emailError,
    recentEmails,
    requiredInfoFields,
    requiredInfoLoading,
    requiredInfoValues,
    setRequiredInfoValue,
    requiredInfoErrors,
    quantity,
    setQuantity,
    stock,
    paymentGroups,
    paymentLoading,
    paymentError,
    effectivePaymentId,
    effectiveMethodName,
    setSelectedPaymentId,
    unitPrice,
    baseUnitPrice,
    subtotal,
    selectedFee,
    total,
    wholesaleTier,
    submitting,
    submitError,
    dismissSubmitError,
    handleSubmit,
    productSubtitle,
  } = useCheckout(props);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-2 pb-40">
        <BuyerInfoCard
          bare
          email={email}
          onEmailChange={setEmail}
          error={emailError}
          recentEmails={recentEmails}
        />

        <OrderSummaryCard
          bare
          productName={product.name}
          productSubtitle={productSubtitle}
          productImageUrl={productImageUrl}
          unitPrice={unitPrice}
          basePrice={baseUnitPrice}
          wholesale={wholesaleTier != null}
          quantity={quantity}
          maxQuantity={stock}
          onQuantityChange={setQuantity}
          requiredInfoFields={requiredInfoFields}
          requiredInfoLoading={requiredInfoLoading}
          requiredInfoValues={requiredInfoValues}
          onRequiredInfoChange={setRequiredInfoValue}
          requiredInfoErrors={requiredInfoErrors}
        />

        <PaymentMethodList
          bare
          groups={paymentGroups}
          loading={paymentLoading}
          error={paymentError}
          selectedId={effectivePaymentId}
          onSelect={setSelectedPaymentId}
          amount={subtotal}
        />

        <p className="px-4 py-4 text-center font-[family-name:var(--font-heading)] text-xs leading-4 text-(--color-text-subdued)">
          Dengan melanjutkan, saya setuju dengan{" "}
          <a
            href="https://www.lapakgaming.com/id-id/term-and-condition"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--color-brand)"
          >
            Syarat &amp; Ketentuan
          </a>{" "}
          yang berlaku di Lapakgaming.
        </p>
      </div>

      <CheckoutBottomBar
        total={total}
        subtotal={subtotal}
        adminFee={selectedFee}
        methodName={effectiveMethodName}
        ctaLabel="Bayar"
        ctaDisabled={paymentLoading || effectivePaymentId == null}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <Snackbar message={submitError} onClose={dismissSubmitError} className="bottom-28" />
    </>
  );
}
