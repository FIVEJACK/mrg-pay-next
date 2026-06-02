import type { Metadata } from "next";
import { Exo_2, Oxanium } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { DeviceProvider } from "@/components/shared/device-context";
import { getDevice } from "@/lib/device.server";
import { routing } from "@/i18n/routing";

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
  display: "swap",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LocaleLayout" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: "LapakGaming x itemku partner storefront",
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const device = await getDevice();

  return (
    <html
      lang={locale}
      className={`${exo2.variable} ${oxanium.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-(--color-text-title)">
        <NextIntlClientProvider messages={messages}>
          <DeviceProvider device={device}>{children}</DeviceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
