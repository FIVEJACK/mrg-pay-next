import { CheckoutView } from "@/components/checkout/checkout-view";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { VisitPageTracker } from "@/components/shared/visit-page-tracker";
import { CLIENT_NAME, EVENT } from "@/lib/amplitude";
import { isMobile } from "@/lib/device.server";
import { getItemCategoryName } from "@/lib/item-category";
import { tryDecodeB2b2cHash } from "@/lib/partner-api/b2b2c-hash";
import {
  partnerApi,
  PartnerApiError,
  pickProductCoverImage,
} from "@/lib/partner-api";
import type { Product } from "@/lib/partner-api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    product_id?: string;
    hash_code?: string;
    qty?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const hashCode = sp.hash_code?.trim();
  const productId = numOrUndef(sp.product_id);
  const initialQuantity = Math.max(1, Number(sp.qty ?? "1") || 1);

  if (!hashCode || !productId) {
    return (
      <CheckoutShell>
        <MissingParamsState />
      </CheckoutShell>
    );
  }

  const listing = await safeCall(() =>
    partnerApi.getProducts(
      { id: productId, per_page: 1 },
      { hashCode },
    ),
  );
  const product: Product | undefined = listing?.data?.[0];
  console.log(product);
  if (!product) {
    return (
      <CheckoutShell>
        <ErrorState title="Produk tidak ditemukan">
          Tidak ada produk untuk product_id={productId}.
        </ErrorState>
      </CheckoutShell>
    );
  }

  const scope = tryDecodeB2b2cHash(hashCode);
  const country = scope?.country_code ?? "ID";
  const currency = scope?.currency ?? "IDR";
  const mobile = await isMobile();
  const categoryId = product.item_category_id;

  return (
    <CheckoutShell>
      <VisitPageTracker
        eventName={EVENT.VISIT_CHECKOUT_PAGE}
        properties={{
          "Client Name": CLIENT_NAME,
          Game: product.game?.name ?? null,
          "Item Type": product.item_type?.name ?? null,
          "Item Category": getItemCategoryName(categoryId),
          "Device Env": mobile ? "Mobile" : "Desktop",
          "Product ID": product.id,
          "Product Name": product.name,
          Country: country,
        }}
      />
      <CheckoutView
        product={product}
        productImageUrl={pickProductCoverImage(product)}
        initialQuantity={initialQuantity}
        hashCode={hashCode}
        buyerCountry={country}
        buyerCurrency={currency}
        itemCategoryId={categoryId}
      />
    </CheckoutShell>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-bg-subtle)">
      <CheckoutHeader />
      <main className="flex-1">{children}</main>
      <CheckoutFooter />
    </div>
  );
}

function numOrUndef(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof PartnerApiError) {
      console.warn(`[partner-api] ${err.statusCode} (${err.httpStatus}): ${err.message}`);
    } else {
      console.warn(`[partner-api] unexpected error:`, err);
    }
    return null;
  }
}

function MissingParamsState() {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
        Parameter checkout hilang
      </h1>
      <p className="mt-3 text-(--color-text-body)">
        Buka halaman ini dengan{" "}
        <code>
          /checkout?product_id=&lt;id&gt;&amp;hash_code=&lt;hash&gt;
        </code>
        .
      </p>
    </div>
  );
}

function ErrorState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-(--color-promotion)">
        {title}
      </h1>
      <p className="mt-3 text-(--color-text-body)">{children}</p>
    </div>
  );
}
