import "./globals.css";
import type { Metadata, Viewport } from "next";
import PageTransition from "@/components/PageTransition";
import BrandPreloader from "@/components/BrandPreloader";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/components/StoreProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageHtmlLang } from "@/components/LanguageHtmlLang";

const SITE_URL = "https://posulation.com";
const SITE_NAME = "posulation";
const TITLE = "posulation — The Smartest POS System for Your Business";
const DESCRIPTION =
  "Manage sales, inventory, invoices, and reports — all from one powerful dashboard. Trusted by 10,000+ businesses in Bangladesh.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "posulation",
    "POS",
    "point of sale",
    "retail management",
    "inventory",
    "invoicing",
    "Bangladesh POS",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "posulation — Smart Retail Management",
    description:
      "Process sales, track inventory, generate invoices, and grow your business with posulation.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "posulation — Smart Retail Management",
    description:
      "Process sales, track inventory, generate invoices, and grow your business with posulation.",
    creator: "@posulation",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#004AF2" },
    { media: "(prefers-color-scheme: dark)", color: "#061433" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider>
            <LanguageProvider>
              <LanguageHtmlLang>
                <BrandPreloader />
                <PageTransition>{children}</PageTransition>
              </LanguageHtmlLang>
            </LanguageProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
