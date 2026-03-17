"use client";
import CTASection from "@/components/cta";
import FAQSection from "@/components/faq";
import FeaturesSection from "@/components/features";
import HeroSection from "@/components/hero";
import HowItWorks from "@/components/howitworks";
import StatsSection from "@/components/stats";
import Testimonials from "@/components/testimonials";

export default function Home() {
  return (
    <div className="relative">
      <div className="grid-background"></div>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <HowItWorks />
        <Testimonials />
        <FAQSection />
        <CTASection />
    </div>
  );
}
