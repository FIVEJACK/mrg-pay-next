import { getDevice } from "@/lib/device.server";

import { ProductListDesktop, type ProductListViewProps } from "./dweb/product-list-desktop";
import { ProductListMobile } from "./mweb/product-list-mobile";

/**
 * Server entry for the product-list feature. Resolves the request's device class
 * and renders the dweb or mweb composition.
 */
export async function ProductListView(props: ProductListViewProps) {
  const device = await getDevice();
  return device === "mobile" ? (
    <ProductListMobile {...props} />
  ) : (
    <ProductListDesktop {...props} />
  );
}
