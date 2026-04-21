import ScrollReveal from "./ScrollReveal";

const STATS = [
  {
    value: "$6.1B",
    label: "Canadian online pharmacy market size projected by 2029",
    sub: "Growing at 14.8% CAGR — one of the fastest expanding healthcare verticals",
    icon: "📈",
  },
  {
    value: "68%",
    label: "of Canadian patients now prefer digital-first pharmacy services",
    sub: "The convenience shift is permanent — patients expect digital options",
    icon: "📱",
  },
  {
    value: "3×",
    label: "growth in online prescription demand from 2020 to 2026",
    sub: "Platforms like PocketPills and Pillway captured millions of patients",
    icon: "🚀",
  },
];

const FACTS = [
  "Online pharmacies processed over 18 million prescriptions in Canada in 2025",
  "40% of patients aged 25–54 have switched to digital pharmacy services",
  "Independent pharmacies account for only 8% of online pharmacy revenue",
  "Today, 1 in 3 prescriptions in Canada is fulfilled digitally",
];

export default function MarketOpportunity() {
  return (
    <section id="opportunity" className="py-20 px-6 bg-[#f0faf8]">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
            Market Reality
          </span>
          <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
            The Shift to Online Pharmacy Is Already Happening
          </h2>
          <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[580px] mx-auto">
            The market has moved. Patients expect the same digital convenience
            from their pharmacy that they get everywhere else — and the data
            confirms it.
          </p>
        </ScrollReveal>

        {/* Big stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {STATS.map((s, i) => (
            <ScrollReveal key={s.value} delay={i * 100}>
              <div className="bg-white rounded-2xl border border-[#e2efed] p-7 h-full shadow-sm">
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="text-5xl font-extrabold text-[#2a9d8f] tracking-tight mb-3">
                  {s.value}
                </div>
                <p className="text-sm font-semibold text-[#0d1f1c] mb-2 leading-snug">{s.label}</p>
                <p className="text-xs text-[#6b8280] leading-relaxed">{s.sub}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Fact strip */}
        <ScrollReveal delay={300}>
          <div className="mt-10 bg-white rounded-2xl border border-[#e2efed] p-6 shadow-sm">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#2a9d8f] mb-4">
              By the Numbers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FACTS.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2a9d8f] shrink-0" />
                  <p className="text-sm text-[#6b8280] leading-relaxed">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
