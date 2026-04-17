"use client";

export default function CtaStrip() {
  function scrollToSearch() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[autocomplete="street-address"]');
      input?.focus();
    }, 600);
  }

  return (
    <section id="get-started" className="py-20 px-6 bg-[#2a9d8f] text-center">
      <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-white">
        Ready to Get Started?
      </h2>
      <p className="mt-3 text-base text-white/80 max-w-[460px] mx-auto">
        Enter your address and find pharmacies delivering to you right now.
      </p>
      <button
        onClick={scrollToSearch}
        className="mt-7 inline-block bg-white text-[#2a9d8f] font-bold text-[0.9rem] px-9 py-3.5 rounded-full cursor-pointer border-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      >
        Find Nearby Pharmacies →
      </button>
    </section>
  );
}
