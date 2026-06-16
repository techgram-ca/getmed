export default function CtaStrip() {
  return (
    <section id="get-started" className="py-20 px-6 bg-[#2a9d8f] text-center">
      <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-white">
        Support Local Pharmacies
      </h2>
      <p className="mt-3 text-base text-white/80 max-w-[540px] mx-auto">
        Every order placed through GetMed goes directly to an independent,
        community-owned pharmacy. Choose local — and help your neighbourhood
        grow together.
      </p>
      <a
        href="/pharmacy/get-started"
        className="mt-7 inline-block bg-white text-[#2a9d8f] font-bold text-[0.9rem] px-9 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      >
        Partner With Us →
      </a>
    </section>
  );
}
