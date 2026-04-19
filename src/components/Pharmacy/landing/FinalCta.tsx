import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";

const TRUST = [
  "No upfront cost",
  "No risk",
  "Cancel anytime",
  "Live in 24 hours",
];

export default function FinalCta() {
  return (
    <>
      {/* CTA section */}
      <section className="py-24 px-6 bg-[#2a9d8f] text-center">
        <div className="max-w-[720px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Join 500+ pharmacies already on GetMed
          </div>

          <h2 className="text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold tracking-tight text-white leading-tight">
            Start Growing Your Pharmacy Today
          </h2>

          <p className="mt-4 text-white/80 text-[1.05rem] max-w-[500px] mx-auto leading-[1.75]">
            The pharmacies that go digital now will own the patients that big
            chains haven&apos;t reached yet. GetMed is the fastest, cheapest way to
            get there.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pharmacy/signup"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-white text-[#2a9d8f] font-extrabold text-base hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-all no-underline"
            >
              Create Your Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:border-white/80 transition-colors no-underline"
            >
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-white/80 text-sm">
                <span className="text-white">✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f0faf8] border-t border-[#e2efed] px-6 py-10">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>

          <ul className="flex flex-wrap gap-6 list-none">
            {[
              { label: "For Patients", href: "/" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "Support", href: "#" },
              { label: "Sign Up", href: "/pharmacy/signup" },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-xs text-[#6b8280] flex items-center gap-1">
            Made with <span className="text-[#2a9d8f]">♥</span> by GetMed &copy; 2026
          </p>
        </div>
      </footer>
    </>
  );
}
