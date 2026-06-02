import { InvoiceBanner } from "@/components/invoice/invoice-banner";
import { InvoiceView } from "@/components/invoice/invoice-view";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ transaction_uuid?: string }>;
};

export default async function InvoicePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const transactionUuid = sp.transaction_uuid?.trim();

  if (!transactionUuid) {
    return (
      <InvoiceShell>
        <MissingParamsState />
      </InvoiceShell>
    );
  }

  return (
    <InvoiceShell>
      <InvoiceView transactionUuid={transactionUuid} />
    </InvoiceShell>
  );
}

function InvoiceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-(--color-bg-subtle)">
      <InvoiceHeader />
      <InvoiceBanner />
      <main className="flex-1 bg-(--color-bg-subtle)">{children}</main>
      <CheckoutFooter />
    </div>
  );
}

function MissingParamsState() {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
        Parameter invoice hilang
      </h1>
      <p className="mt-3 text-(--color-text-body)">
        Buka halaman ini dengan <code>/invoice?transaction_uuid=&lt;uuid&gt;</code>.
      </p>
    </div>
  );
}
