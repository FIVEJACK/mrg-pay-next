"use client";

import { useCheckout, type CheckoutViewProps } from "@/components/checkout/use-checkout";

import { BuyerInfoCard } from "@/components/checkout/buyer-info-card";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { PaymentMethodList } from "@/components/checkout/payment-method-list";

import { CheckoutBottomBar } from "./checkout-bottom-bar";
import { PaymentBreakdownCard } from "./payment-breakdown-card";


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
    setSelectedPaymentId,
    unitPrice,
    subtotal,
    selectedFee,
    total,
    wholesaleTier,
    submitting,
    submitError,
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

        <PaymentBreakdownCard subtotal={subtotal} adminFee={selectedFee} total={total} />
      </div>

      <CheckoutBottomBar
        total={total}
        ctaLabel="Bayar"
        ctaDisabled={paymentLoading || effectivePaymentId == null}
        submitting={submitting}
        errorMessage={submitError}
        onSubmit={handleSubmit}
      />
    </>
  );
}
