import "./globals.css";
import type { Metadata } from "next";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "BrandName - Premium SaaS Platform",
  description:
    "Enterprise-grade Next.js 16 SaaS starter with SEO optimization and scalable architecture.",
  openGraph: {
    title: "BrandName SaaS",
    description: "Modern scalable Next.js application.",
    url: "https://yourdomain.com",
    siteName: "BrandName",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider >
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
