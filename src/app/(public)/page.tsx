import type { Metadata } from "next";

import { SaasHeroSection } from "@/components/public/SaasHeroSection";
import { NicheSection } from "@/components/public/NicheSection";
import { TargetAudienceSection } from "@/components/public/TargetAudienceSection";
import { ValuePropositionSection } from "@/components/public/ValuePropositionSection";
import { FeatureBreakdownSection } from "@/components/public/FeatureBreakdownSection";
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
      {/* 1. Hero — SaaS positioning with dashboard preview */}
      <SaasHeroSection />

      {/* 2. Niche — platform identity, industries served, business pillars */}
      <NicheSection />

      {/* 3. Target Audience — who it's for */}
      <TargetAudienceSection />

      {/* 4. Value Proposition — 4 key benefits */}
      <ValuePropositionSection />

      {/* 5. Feature Breakdown — zig-zag layout with mockups */}
      <FeatureBreakdownSection />

      {/* 6. Advanced Features — competitive edge grid */}
      <AdvancedFeaturesSection />

      {/* 7. Multi-Tenant — SaaS selling point */}
      <MultiTenantSection />

      {/* 8. Pricing — 3 tiers */}
      <PricingSection />

      {/* 9. ROI / Business Impact */}
      <RoiSection />

      {/* 10. Testimonials */}
      <SaasTestimonialsSection />

      {/* 11. FAQ */}
      <FaqSection />
    </>
  );
}
