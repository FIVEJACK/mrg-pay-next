import { getDevice } from "@/lib/device.server";

import { CheckoutDesktop, type CheckoutViewProps } from "./dweb/checkout-desktop";
import { CheckoutMobile } from "./mweb/checkout-mobile";

/**
 * Server entry for the checkout feature. Resolves the request's device class and
 * renders the dweb or mweb composition. Pages should import this rather than a
 * specific variant.
 */
export async function CheckoutView(props: CheckoutViewProps) {
  const device = await getDevice();
  return device === "mobile" ? <CheckoutMobile {...props} /> : <CheckoutDesktop {...props} />;
}
