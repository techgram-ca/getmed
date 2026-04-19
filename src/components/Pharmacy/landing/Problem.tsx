import { MonitorX, ShoppingCart, Truck, UserMinus } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const PROBLEMS = [
  {
    icon: UserMinus,
    title: "Customers Are Walking Out — Digitally",
    body: "Every day, patients discover PocketPills, Pillway, or Amazon Pharmacy. Once they switch, they rarely come back. You're losing loyal customers to platforms that exist entirely online.",
    stat: "23% of independent pharmacy patients switched to online services in 2023",
  },
  {
    icon: ShoppingCart,
    title: "No Online Ordering System",
    body: "When a patient searches for online prescription refills, you're invisible. Without a digital ordering channel, you can't capture the growing segment of patients who won't visit in person.",
    stat: "Only 12% of independent pharmacies offer any form of online ordering",
  },
  {
    icon: Truck,
    title: "No Delivery Infrastructure",
    body: "Building your own delivery operation is expensive, complex, and time-consuming. Without delivery, you can't serve patients who are housebound, busy, or simply prefer the convenience.",
    stat: "Home delivery is now expected by 61% of pharmacy customers under 45",
  },
  {
    icon: MonitorX,
    title: "Limited Digital Presence",
    body: "Your pharmacy may not appear in online pharmacy searches, maps, or health apps. Big chains and online-only platforms invest millions in SEO and app development. You can't match that alone.",
    stat: "Independent pharmacies receive 7× less online visibility than chain pharmacies",
  },
];

export default function Problem() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-red-500 mb-3">
            The Problem
          </span>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
            Independent Pharmacies Are Missing Out
          </h2>
          <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[560px] mx-auto">
            Without digital tools, independent pharmacies are competing with one
            hand tied behind their back. The gap is growing every year.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <ScrollReveal key={p.title} delay={i * 80}>
                <div className="h-full bg-red-50 border border-red-100 rounded-2xl p-6 group hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-[1.05rem] font-bold text-[#0d1f1c] leading-tight pt-1">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[#6b8280] leading-[1.7] mb-4">{p.body}</p>
                  <div className="flex items-start gap-2 pt-3 border-t border-red-100">
                    <span className="text-red-400 text-sm shrink-0">📊</span>
                    <p className="text-xs text-red-600 font-medium leading-snug">{p.stat}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
