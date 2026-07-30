import "./globals.css";
import type { Metadata } from "next";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/components/StoreProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageHtmlLang } from "@/components/LanguageHtmlLang";

export const metadata: Metadata = {
  title: "Sohoj POS — The Smartest POS System for Your Business",
  description:
    "Manage sales, inventory, invoices, and reports — all from one powerful dashboard. Trusted by 10,000+ businesses in Bangladesh.",
  openGraph: {
    title: "Sohoj POS — Smart Retail Management",
    description:
      "Process sales, track inventory, generate invoices, and grow your business with Sohoj POS.",
    url: "https://sohojpos.com",
    siteName: "Sohoj POS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <ThemeProvider>
            <LanguageProvider>
              <LanguageHtmlLang>
                <PageTransition>{children}</PageTransition>
              </LanguageHtmlLang>
            </LanguageProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
