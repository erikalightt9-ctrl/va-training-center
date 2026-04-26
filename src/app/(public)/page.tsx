import type { Metadata } from "next";

import { SaasHeroSection } from "@/components/public/SaasHeroSection";
import { SocialProofSection } from "@/components/public/SocialProofSection";
import { ProblemSolutionSection } from "@/components/public/ProblemSolutionSection";
import { FeatureHighlightsSection } from "@/components/public/FeatureHighlightsSection";
import { HowItWorksNewSection } from "@/components/public/HowItWorksNewSection";
import { PricingTeaserSection } from "@/components/public/PricingTeaserSection";
import { LandingTestimonialsSection } from "@/components/public/LandingTestimonialsSection";
import { FinalCtaSection } from "@/components/public/FinalCtaSection";

export const metadata: Metadata = {
  title: "HUMI Hub — Run Your Entire Company From One System",
  description:
    "HUMI Hub is the centralized operating system for your entire company — connecting Operations, Finance, Sales, IT, Training, and HR into one real-time environment with full executive visibility.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <SaasHeroSection />

      {/* 2. Social Proof — company marquee + animated stat counters */}
      <SocialProofSection />

      {/* 3. Problem → Solution */}
      <ProblemSolutionSection />

      {/* 4. Feature Highlights — 6 module cards */}
      <FeatureHighlightsSection />

      {/* 5. How It Works — 3-step numbered flow */}
      <HowItWorksNewSection />

      {/* 6. Pricing Teaser — 3-tier cards */}
      <PricingTeaserSection />

      {/* 7. Testimonials — dark background quote cards */}
      <LandingTestimonialsSection />

      {/* 8. Final CTA */}
      <FinalCtaSection />
    </>
  );
}
