import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import CoreFeatures from "@/components/landing/CoreFeatures";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import NumberedFeatures from "@/components/landing/NumberedFeatures";
import IndustryGallery from "@/components/landing/IndustryGallery";
import CTABanner from "@/components/landing/CTABanner";
import FAQ from "@/components/landing/FAQ";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <CoreFeatures />
      <FeatureShowcase />
      <NumberedFeatures />
      <IndustryGallery />
      <CTABanner />
      <FAQ />
      <ContactSection />
      <Footer />
    </main>
  );
}
