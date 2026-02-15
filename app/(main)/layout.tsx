
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import PageTransition from "@/components/PageTransition";

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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <div className="pt-24 px-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
