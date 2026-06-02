import { getDevice } from "@/lib/device.server";

import { InvoiceDesktop, type InvoiceViewProps } from "./dweb/invoice-desktop";
import { InvoiceMobile } from "./mweb/invoice-mobile";

/**
 * Server entry for the invoice feature. Resolves the request's device class and
 * renders the dweb or mweb composition.
 */
export async function InvoiceView(props: InvoiceViewProps) {
  const device = await getDevice();
  return device === "mobile" ? <InvoiceMobile {...props} /> : <InvoiceDesktop {...props} />;
}
