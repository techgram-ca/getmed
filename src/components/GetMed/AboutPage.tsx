import Link from "next/link";
import {
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
  Zap,
} from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Every pharmacy and pharmacist on GetMed is licensed and regulated. We verify credentials so you never have to wonder.",
  },
  {
    icon: Zap,
    title: "Speed & Convenience",
    desc: "From search to delivery in minutes. We built GetMed so getting your medications is as easy as ordering anything else online.",
  },
  {
    icon: HeartPulse,
    title: "Patient-First Care",
    desc: "We centre every decision around the patient. That means clear information, no hidden fees, and access to real pharmacist advice.",
  },
  {
    icon: Users,
    title: "Community Pharmacies",
    desc: "We partner with local, independent pharmacies — not big-box chains. Supporting community pharmacists supports your neighbourhood.",
  },
];

const STATS = [
  { value: "10,000+", label: "Patients served" },
  { value: "200+",    label: "Partner pharmacies" },
  { value: "50+",     label: "Cities across Canada" },
  { value: "4.9★",    label: "Average patient rating" },
];

const HOW_IT_WORKS = [
  {
    icon: MapPin,
    step: "01",
    title: "Find a nearby pharmacy",
    desc: "Enter your address to instantly see licensed pharmacies offering delivery or consultation in your area.",
  },
  {
    icon: Stethoscope,
    step: "02",
    title: "Order or consult",
    desc: "Submit a prescription order, transfer from another pharmacy, or book a one-on-one consultation with a pharmacist.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Receive your medications",
    desc: "Your pharmacy confirms your order and delivers it straight to your door — same day or next day in most areas.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#f8fffe] min-h-screen pt-16">

      {/* ── Hero ── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-[72px] pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
              Our Story
            </div>
            <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-[#0d1f1c]">
              Making Pharmacy Care <span className="text-[#2a9d8f]">Accessible</span> for Everyone
            </h1>
            <p className="mt-5 text-[1.05rem] text-[#6b8280] leading-[1.7]">
              GetMed was founded on a simple belief: getting your medications and speaking to a pharmacist should be easy, affordable, and stress-free — no matter where you live in Canada.
            </p>
            <p className="mt-4 text-[1.05rem] text-[#6b8280] leading-[1.7]">
              We connect patients with trusted, licensed community pharmacies so they can order prescriptions, arrange home delivery, and consult a pharmacist — all from one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#get-started"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-semibold hover:bg-[#21867a] transition-colors no-underline"
              >
                Find a Pharmacy
              </Link>
              <Link
                href="/consult"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2a9d8f] text-[#2a9d8f] text-sm font-semibold hover:bg-[#e0f5f2] transition-colors no-underline"
              >
                Consult a Pharmacist
              </Link>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-[-12px] bg-[#e0f5f2] rounded-[28px] rotate-3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/about.png"
              alt="GetMed team"
              className="relative rounded-2xl w-full object-cover shadow-[0_32px_80px_rgba(42,157,143,0.15)]"
            />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-y border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-[#2a9d8f]">{value}</p>
                <p className="mt-1 text-sm text-[#6b8280]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-4">Our Mission</p>
          <h2 className="text-3xl font-extrabold text-[#0d1f1c] leading-snug">
            Bridging the gap between patients and pharmacies across Canada
          </h2>
          <p className="mt-5 text-[1.05rem] text-[#6b8280] leading-[1.7]">
            Millions of Canadians struggle to access timely pharmacy services — whether due to distance, mobility, or simply a lack of time. GetMed exists to remove those barriers. We believe every person deserves fast, transparent, and compassionate pharmaceutical care.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-white border-y border-[#e2efed] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3 text-center">What We Stand For</p>
          <h2 className="text-3xl font-extrabold text-[#0d1f1c] text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#f8fffe] rounded-2xl border border-[#e2efed] p-6 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#2a9d8f]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0d1f1c] mb-1">{title}</h3>
                  <p className="text-sm text-[#6b8280] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3 text-center">Simple by Design</p>
        <h2 className="text-3xl font-extrabold text-[#0d1f1c] text-center mb-12">How GetMed Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#2a9d8f]" />
                </div>
                <span className="text-3xl font-extrabold text-[#e0f5f2]">{step}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0d1f1c] mb-2">{title}</h3>
                <p className="text-sm text-[#6b8280] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#2a9d8f] py-16">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to get started?</h2>
          <p className="text-white/80 text-[1.05rem] mb-8 leading-relaxed">
            Find a pharmacy near you and place your first order in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/#get-started"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#2a9d8f] text-sm font-bold hover:bg-[#f0fbf9] transition-colors no-underline"
            >
              Find a Pharmacy
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/40 text-white text-sm font-bold hover:bg-white/10 transition-colors no-underline"
            >
              View FAQs
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
