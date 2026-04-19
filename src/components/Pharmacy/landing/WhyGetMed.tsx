import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  HeartHandshake,
  Percent,
  ScrollText,
  Truck,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const WHY = [
  {
    icon: BadgeCheck,
    title: "Free Onboarding",
    desc: "Zero setup cost. We build and publish your pharmacy profile at no charge. Your first order costs you nothing to unlock.",
  },
  {
    icon: ScrollText,
    title: "No Contracts",
    desc: "Month-to-month only. There is no long-term commitment, no cancellation penalties, and no lock-in period. Leave whenever you want.",
  },
  {
    icon: Percent,
    title: "Zero Commission",
    desc: "We do not take a cut of your prescription revenue. You keep 100% of every sale — we only charge a small delivery fee paid by the patient.",
  },
  {
    icon: Truck,
    title: "Lowest Delivery Charges",
    desc: "Our driver network operates at volume, letting us offer the most competitive delivery rates in the market. Patients pay less, which means more orders for you.",
  },
  {
    icon: Clock,
    title: "Live Within 24 Hours",
    desc: "Submit your application today and your pharmacy can be live on GetMed by tomorrow. We review and approve applications fast.",
  },
  {
    icon: HeartHandshake,
    title: "Built for Independents",
    desc: "Every feature in GetMed was designed for independent pharmacies — not corporate chains. We understand your constraints and your strengths.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Sign Up Free",
    desc: "Create your pharmacy account in minutes. Fill in your details, upload your license, and set your service preferences.",
    cta: null,
  },
  {
    num: "02",
    title: "Quick Onboarding",
    desc: "Our team reviews your application within 24 hours and sets up your public profile on the GetMed platform.",
    cta: null,
  },
  {
    num: "03",
    title: "Start Receiving Orders",
    desc: "Your pharmacy goes live and patients in your area can start placing prescription orders immediately.",
    cta: null,
  },
  {
    num: "04",
    title: "We Handle Deliveries",
    desc: "Our vetted drivers pick up prepared orders from your counter and deliver them to patients. You never need to leave the pharmacy.",
    cta: null,
  },
];

export default function WhyGetMed() {
  return (
    <>
      {/* Why GetMed */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
              Strong Selling Points
            </span>
            <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
              Why Pharmacies Choose GetMed
            </h2>
            <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[520px] mx-auto">
              We built GetMed to remove every barrier that has stopped independent
              pharmacies from going digital.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {WHY.map((w, i) => {
              const Icon = w.icon;
              return (
                <ScrollReveal key={w.title} delay={i * 70}>
                  <div className="h-full rounded-2xl border-2 border-[#e2efed] p-6 group hover:border-[#2a9d8f] hover:bg-[#f8fffe] transition-all">
                    <div className="w-11 h-11 rounded-xl bg-[#e0f5f2] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#2a9d8f]" />
                    </div>
                    <h3 className="text-[1rem] font-bold text-[#0d1f1c] mb-2">{w.title}</h3>
                    <p className="text-sm text-[#6b8280] leading-[1.7]">{w.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[#f0faf8]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
              Simple Process
            </span>
            <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
              How It Works
            </h2>
            <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[480px] mx-auto">
              From signup to your first online order in four simple steps.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-[#e2efed] z-0" />

            {STEPS.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 100}>
                <div className="relative bg-white rounded-2xl border border-[#e2efed] p-6 shadow-sm z-10 h-full">
                  <div className="w-10 h-10 rounded-full bg-[#2a9d8f] text-white text-xs font-extrabold flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(42,157,143,0.3)]">
                    {s.num}
                  </div>
                  <h3 className="text-[1rem] font-bold text-[#0d1f1c] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#6b8280] leading-[1.7]">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-10 text-center">
              <Link
                href="/pharmacy/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2a9d8f] text-white font-bold text-sm hover:bg-[#21867a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(42,157,143,0.3)] transition-all no-underline"
              >
                Start Step 1 — Sign Up Free →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
