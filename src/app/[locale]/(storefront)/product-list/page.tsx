import { ProductListShell } from "@/components/pdp/product-list-shell";
import { tryDecodeB2b2cHash } from "@/lib/partner-api/b2b2c-hash";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hash_code?: string }>;
};

export default async function ProductListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const hashCode = sp.hash_code?.trim();

  // SSR gate: reject early if the hash is missing or doesn't decode. The
  // iframe page does the heavy fetching (game-info, products, etc.).
  if (!hashCode || !tryDecodeB2b2cHash(hashCode)) return <MissingHashState />;

  return <ProductListShell hashCode={hashCode} />;
}

function MissingHashState() {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
        Missing or invalid <code>hash_code</code>
      </h1>
      <p className="mt-3 text-(--color-text-subdued)">
        Open this page with a B2B2C hash, e.g.{" "}
        <code>/product-list?hash_code=&lt;your-hash&gt;</code>.
      </p>
    </div>
  );
}
