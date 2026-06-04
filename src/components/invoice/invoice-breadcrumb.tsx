import { Link } from "@/i18n/navigation";

export function InvoiceBreadcrumb({ transactionNumber }: { transactionNumber: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-(--color-text-subdued)">
        <li>
          <Link href="/" className="font-bold text-(--color-brand) hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-bold text-(--color-brand)">Transaksi</li>
        <li aria-hidden="true">/</li>
        <li className="truncate">{transactionNumber}</li>
      </ol>
    </nav>
  );
}
