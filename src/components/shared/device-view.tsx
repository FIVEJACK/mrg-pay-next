import { getDevice } from "@/lib/device.server";

type DeviceViewProps = {
  /** Rendered when the request resolves to a desktop viewport (dweb). */
  desktop: React.ReactNode;
  /** Rendered when the request resolves to a mobile viewport (mweb). */
  mobile: React.ReactNode;
};

/**
 * Server-side switch between a desktop (dweb) and mobile (mweb) subtree.
 *
 * The unchosen branch's JSX element is still constructed by the caller, so its
 * code is part of the bundle, but only the selected subtree is rendered. For
 * heavy variants you can pass `next/dynamic` components to also split the
 * client bundle.
 *
 * Most features instead expose their own typed server switcher (e.g.
 * `CheckoutView`) so they can forward props with full type-safety; reach for
 * this helper for one-off or prop-less splits.
 */
export async function DeviceView({ desktop, mobile }: DeviceViewProps) {
  const device = await getDevice();
  return device === "mobile" ? mobile : desktop;
}
