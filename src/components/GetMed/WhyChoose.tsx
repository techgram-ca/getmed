import { Home, ShieldCheck, Zap } from "lucide-react";

const benefits = [
  {
    icon: Home,
    title: "Local Pharmacies",
    desc: "Support trusted neighborhood pharmacies you already know. We connect you with verified local stores.",
    delay: "",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Get your medicines delivered quickly — often within the same day. No more long pharmacy queues.",
    delay: "delay-1",
  },
  {
    icon: ShieldCheck,
    title: "Secure Prescriptions",
    desc: "Your prescription data is kept safe and handled only by licensed pharmacies. Privacy comes first.",
    delay: "delay-2",
  },
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
          Our Advantages
        </span>
        <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
          Why Choose GetMed
        </h2>
        <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[520px] mx-auto">
          We&#39;re building a better way to get your medicines — convenient, safe, and community-focused.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-14">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`animate-fade-in-up ${b.delay} flex flex-col items-center text-center group`}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-[-6px] bg-[#e0f5f2] rounded-[20px] rotate-6 transition-transform duration-300 group-hover:rotate-12" />
                  <div className="relative w-16 h-16 rounded-[18px] bg-[#2a9d8f] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-[1.15rem] font-bold text-[#0d1f1c] mb-2.5">{b.title}</div>
                <p className="text-sm text-[#6b8280] leading-[1.7] max-w-[280px]">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
