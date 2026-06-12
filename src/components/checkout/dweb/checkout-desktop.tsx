"use client";

import { useCheckout, type CheckoutViewProps } from "@/components/checkout/use-checkout";

import { BuyerInfoCard } from "@/components/checkout/buyer-info-card";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { PaymentDetailSidebar } from "@/components/checkout/payment-detail-sidebar";
import { PaymentMethodList } from "@/components/checkout/payment-method-list";
import { Snackbar } from "@/components/shared/snackbar";

export type { CheckoutViewProps };

export function CheckoutDesktop(props: CheckoutViewProps) {
  const {
    product,
    productImageUrl,
  } = props;
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
    baseUnitPrice,
    wholesaleTier,
    submitting,
    submitError,
    dismissSubmitError,
    handleSubmit,
    productSubtitle,
  } = useCheckout(props);

  return (
    <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_427px] lg:px-12 lg:py-10">
      <div className="flex flex-col gap-6">
        <BuyerInfoCard
          email={email}
          onEmailChange={setEmail}
          error={emailError}
          recentEmails={recentEmails}
        />

        <OrderSummaryCard
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
          groups={paymentGroups}
          loading={paymentLoading}
          error={paymentError}
          selectedId={effectivePaymentId}
          onSelect={setSelectedPaymentId}
          amount={subtotal}
        />
      </div>

      <PaymentDetailSidebar
        subtotal={subtotal}
        adminFee={selectedFee}
        total={total}
        ctaLabel="Lanjut ke Pembayaran"
        ctaDisabled={paymentLoading || effectivePaymentId == null}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <Snackbar message={submitError} onClose={dismissSubmitError} />
    </div>
  );
}
