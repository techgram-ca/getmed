import Link from "next/link";
import { ArrowRight, HeartPulse, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "$6.1B", label: "Canadian online pharmacy market by 2029" },
  { value: "68%", label: "of patients now prefer digital pharmacy options" },
  { value: "3×", label: "growth in online prescription orders since 2020" },
];

export default function Hero() {
  return (
    <section className="pt-28 pb-16 px-6 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* ── Left ────────────────────────────────────── */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              The online pharmacy shift is accelerating
            </div>

            <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-[#0d1f1c]">
              Pharmacies Are{" "}
              <span className="text-red-500">Losing Patients</span>{" "}
              to Online Platforms —{" "}
              <span className="text-[#2a9d8f]">Don&apos;t Get Left Behind</span>
            </h1>

            <p className="mt-5 text-[1.1rem] text-[#6b8280] leading-[1.75] max-w-[520px]">
              Online prescription ordering and home delivery are becoming the
              default. Big players are capturing your patients. GetMed gives
              independent pharmacies the tools to compete — instantly and for
              free.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="flex items-center gap-2">
                <Link href="/pharmacy/signup">
                  Join GetMed Today
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#e2efed] text-sm font-semibold text-[#6b8280] hover:border-[#2a9d8f] hover:text-[#2a9d8f] transition-colors no-underline"
              >
                See how it works
              </a>
            </div>

            <p className="mt-4 text-xs text-[#6b8280]">
              ✓ Free onboarding &nbsp;·&nbsp; ✓ No contracts &nbsp;·&nbsp; ✓ No commissions
            </p>
          </div>

          {/* ── Right: dashboard mockup ──────────────────── */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-[-16px] bg-[#e0f5f2] rounded-[32px] rotate-2" />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(42,157,143,0.14)] border border-[#e2efed] overflow-hidden">
              {/* Window chrome */}
              <div className="bg-[#f8fffe] border-b border-[#e2efed] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#2a9d8f] flex items-center justify-center">
                    <HeartPulse className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-[#0d1f1c]">GetMed Pharmacy Dashboard</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              <div className="p-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Orders Today", value: "42", trend: "+23% this week" },
                    { label: "Revenue",       value: "$2,840", trend: "+18% this month" },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#f8fffe] rounded-xl p-3.5 border border-[#e2efed]">
                      <div className="text-[0.65rem] text-[#6b8280] font-medium mb-1">{s.label}</div>
                      <div className="text-2xl font-extrabold text-[#0d1f1c]">{s.value}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-[0.6rem] text-emerald-600 font-semibold">{s.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="mb-1">
                  <p className="text-[0.6rem] font-bold text-[#6b8280] uppercase tracking-wider mb-2">
                    Recent Orders
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: "John D.", med: "Metformin 500mg",    badge: "Delivered",   color: "bg-emerald-100 text-emerald-700" },
                      { name: "Sarah M.", med: "Lisinopril 10mg",   badge: "In Transit",  color: "bg-blue-100 text-blue-700"     },
                      { name: "Mike T.", med: "Atorvastatin 20mg",  badge: "Processing",  color: "bg-amber-100 text-amber-700"   },
                    ].map((o) => (
                      <div key={o.name} className="flex items-center justify-between py-1.5 border-b border-[#e2efed] last:border-0">
                        <div>
                          <div className="text-xs font-semibold text-[#0d1f1c]">{o.name}</div>
                          <div className="text-[0.6rem] text-[#6b8280]">{o.med}</div>
                        </div>
                        <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${o.color}`}>
                          {o.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-[#e2efed]">
                  <div className="flex justify-between text-[0.6rem] text-[#6b8280] mb-1">
                    <span>New patients this month</span>
                    <span className="font-bold text-[#2a9d8f]">78 / 100</span>
                  </div>
                  <div className="h-1.5 bg-[#e2efed] rounded-full">
                    <div className="h-full w-[78%] bg-[#2a9d8f] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-[#2a9d8f] text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              Your pharmacy, live
            </div>
          </div>
        </div>

        {/* ── Stats bar ──────────────────────────────────── */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e2efed] rounded-2xl overflow-hidden border border-[#e2efed]">
          {STATS.map((s) => (
            <div key={s.value} className="bg-white px-8 py-5 text-center sm:text-left">
              <div className="text-3xl font-extrabold text-[#2a9d8f] tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-[#6b8280] leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
