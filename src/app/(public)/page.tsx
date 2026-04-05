import type { Metadata } from "next";

import { SaasHeroSection } from "@/components/public/SaasHeroSection";
import { NicheSection } from "@/components/public/NicheSection";
import { TargetAudienceSection } from "@/components/public/TargetAudienceSection";
import { ValuePropositionSection } from "@/components/public/ValuePropositionSection";
import { FeatureBreakdownSection } from "@/components/public/FeatureBreakdownSection";
import { HowItWorksSection } from "@/components/public/HowItWorksSection";
import { AdvancedFeaturesSection } from "@/components/public/AdvancedFeaturesSection";
import { MultiTenantSection } from "@/components/public/MultiTenantSection";
import { PricingSection } from "@/components/public/PricingSection";
import { RoiSection } from "@/components/public/RoiSection";
import { SaasTestimonialsSection } from "@/components/public/SaasTestimonialsSection";
import { FaqSection } from "@/components/public/FaqSection";

export const metadata: Metadata = {
  title: "HUMI Hub — All-in-One Business Operations Platform",
  description:
    "One platform to manage your entire business. HR, finance, IT, sales, admin, and learning management — built for training centers and SMEs ready to scale.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — multi-industry positioning with business dashboard preview */}
      <SaasHeroSection />

      {/* 2. Niche — platform identity, industries served, business pillars */}
      <NicheSection />

      {/* 3. Target Audience — who it's for (6 industry cards) */}
      <TargetAudienceSection />

      {/* 4. Value Proposition — 4 key benefits + checkmarks */}
      <ValuePropositionSection />

      {/* 5. Feature Breakdown — 6 modules with zig-zag mockups */}
      <FeatureBreakdownSection />

      {/* 6. How It Works — 3-step setup, manage, scale */}
      <HowItWorksSection />

      {/* 7. Advanced Features — competitive edge grid */}
      <AdvancedFeaturesSection />

      {/* 8. Multi-Tenant — SaaS selling point */}
      <MultiTenantSection />

      {/* 9. Pricing — 3 tiers */}
      <PricingSection />

      {/* 10. ROI / Business Impact */}
      <RoiSection />

      {/* 11. Testimonials */}
      <SaasTestimonialsSection />

      {/* 12. FAQ */}
      <FaqSection />
    </>
  );
}
