import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  "We onboard your pharmacy profile in under 24 hours",
  "Instant online prescription ordering system — no coding required",
  "GetMed manages all delivery logistics with our driver network",
  "Clean dashboard to accept, track, and manage every order",
  "Automatic patient notifications for order status",
  "Built-in online consultation module for pharmacists",
  "No technical knowledge or staff training needed",
  "Your pharmacy stays in full control of every prescription",
];

export default function Solution() {
  return (
    <section className="py-20 px-6 bg-[#2a9d8f]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <ScrollReveal>
            <span className="block text-[0.7rem] font-bold tracking-[.12em] uppercase text-white/60 mb-3">
              The Solution
            </span>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-white leading-tight">
              GetMed Brings Your Pharmacy Online — Instantly
            </h2>
            <p className="mt-4 text-white/80 text-[1.05rem] leading-[1.75]">
              We handle the complexity so you can focus on what matters —
              your patients. No expensive setup, no long-term contracts, no
              technical headaches. Go live in 24 hours.
            </p>

            <div className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pharmacy/signup"
              className="inline-flex items-center gap-2 mt-10 px-8 py-3.5 rounded-full bg-white text-[#2a9d8f] font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all no-underline"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          {/* Right: comparison card */}
          <ScrollReveal delay={150}>
            <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-white/20">
                <div className="p-5">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">
                    Without GetMed
                  </p>
                  {[
                    "Walk-in only",
                    "No online ordering",
                    "No delivery",
                    "Manual tracking",
                    "Lost patients",
                    "Declining revenue",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 py-2 border-b border-white/10 last:border-0">
                      <span className="text-red-400 text-base">✕</span>
                      <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    With GetMed
                  </p>
                  {[
                    "Online + in-store",
                    "24/7 prescription orders",
                    "Managed delivery",
                    "Real-time dashboard",
                    "Expanding patient base",
                    "Growing revenue",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 py-2 border-b border-white/10 last:border-0">
                      <span className="text-emerald-400 text-base">✓</span>
                      <span className="text-sm text-white font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
