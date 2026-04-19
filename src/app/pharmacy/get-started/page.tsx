import type { Metadata } from "next";
import PharmacyNavbar from "@/components/Pharmacy/landing/PharmacyNavbar";
import Hero from "@/components/Pharmacy/landing/Hero";
import MarketOpportunity from "@/components/Pharmacy/landing/MarketOpportunity";
import Problem from "@/components/Pharmacy/landing/Problem";
import Solution from "@/components/Pharmacy/landing/Solution";
import Features from "@/components/Pharmacy/landing/Features";
import WhyGetMed from "@/components/Pharmacy/landing/WhyGetMed";
import FinalCta from "@/components/Pharmacy/landing/FinalCta";

export const metadata: Metadata = {
  title: "Grow Your Pharmacy Online — Join GetMed",
  description:
    "Don't let online platforms take your patients. GetMed helps independent pharmacies compete with free onboarding, no contracts, and zero commissions. Go live in 24 hours.",
};

export default function PharmacyGetStartedPage() {
  return (
    <div className="min-h-screen bg-white">
      <PharmacyNavbar />
      <main>
        <Hero />
        <MarketOpportunity />
        <Problem />
        <Solution />
        <Features />
        <WhyGetMed />
        <FinalCta />
      </main>
    </div>
  );
}
