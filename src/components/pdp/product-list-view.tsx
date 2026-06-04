import { getDevice } from "@/lib/device.server";
import { type ProductListViewProps } from "@/components/pdp/dweb/product-list-desktop";
import { ProductListViewClient } from "@/components/pdp/product-list-view-client";

export async function ProductListView(props: ProductListViewProps) {
  const device = await getDevice();
  return <ProductListViewClient initialMobile={device === "mobile"} {...props} />;
}
