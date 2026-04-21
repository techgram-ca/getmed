import {
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    icon: PackageCheck,
    title: "Online Prescription Ordering",
    desc: "Patients upload their prescriptions and place orders directly through GetMed. Every order lands in your dashboard — you contact the patient, verify the prescription, and stay in full control.",
  },
  {
    icon: Truck,
    title: "GetMed Delivery Network",
    desc: "Our vetted drivers handle last-mile delivery to patients' doors. You prepare the order; we take care of getting it there safely and on time.",
  },
  {
    icon: LayoutDashboard,
    title: "Pharmacy Dashboard",
    desc: "A single clean dashboard to accept orders, track deliveries, manage your profile, view earnings, and communicate with patients — all in one place.",
  },
  {
    icon: Users,
    title: "Expand Your Patient Reach",
    desc: "GetMed lists your pharmacy to patients in your delivery area. Reach new customers who would never have walked through your door.",
  },
  {
    icon: Stethoscope,
    title: "Online Consultations",
    desc: "Offer virtual pharmacist consultations for minor ailments via chat, phone, or video. Build recurring relationships with patients who can't come in.",
  },
  {
    icon: MessageSquare,
    title: "Patient Messaging",
    desc: "Keep patients informed at every step — prescription received, order confirmed, out for delivery. Automated and manual notifications built in.",
  },
];

export default function Features() {
  return (
    <>
      {/* Features grid */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <span className="block text-center text-[0.7rem] font-bold tracking-[.12em] uppercase text-[#2a9d8f] mb-3">
              Features & Benefits
            </span>
            <h2 className="text-center text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-tight text-[#0d1f1c]">
              Everything You Need to Compete Online
            </h2>
            <p className="text-center mt-3 text-[1.05rem] text-[#6b8280] max-w-[520px] mx-auto">
              Tools that big chains pay millions to build — available to your
              independent pharmacy from day one.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={f.title} delay={i * 70}>
                  <div className="h-full bg-[#f8fffe] rounded-2xl border border-[#e2efed] p-6 group hover:border-[#2a9d8f]/40 hover:shadow-[0_8px_32px_rgba(42,157,143,0.08)] transition-all">
                    <div className="relative mb-5 w-fit">
                      <div className="absolute inset-[-5px] bg-[#e0f5f2] rounded-[16px] rotate-6 transition-transform duration-300 group-hover:rotate-12" />
                      <div className="relative w-12 h-12 rounded-[14px] bg-[#2a9d8f] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-[1rem] font-bold text-[#0d1f1c] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#6b8280] leading-[1.7]">{f.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consultation callout */}
      <section className="py-16 px-6 bg-[#f0faf8]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: teal accent */}
                <div className="bg-gradient-to-br from-[#2a9d8f] to-[#21867a] p-10 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                    Offer Online Consultations
                  </h3>
                  <p className="mt-3 text-white/80 text-sm leading-[1.75]">
                    Patients increasingly want to consult a pharmacist without
                    leaving home. With GetMed, your licensed pharmacists can
                    provide remote consultations and build lasting patient
                    relationships — all from your existing pharmacy.
                  </p>
                </div>

                {/* Right: benefits */}
                <div className="p-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-5">
                    Consultation Benefits
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Handle Minor Ailments Remotely",
                        body: "Cold, flu, minor infections, medication queries — handle them digitally and keep patients engaged with your pharmacy.",
                      },
                      {
                        title: "Build Trust & Recurring Customers",
                        body: "Patients who consult with you online are far more likely to fill prescriptions with you. Personal relationships drive loyalty.",
                      },
                      {
                        title: "Chat, Phone & Video Support",
                        body: "Choose which consultation modes you offer. Start with chat and add video as your team grows comfortable.",
                      },
                      {
                        title: "Set Your Own Availability & Fees",
                        body: "Full control over consultation hours and whether to charge a fee or offer it free to attract new patients.",
                      },
                    ].map((b) => (
                      <div key={b.title} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#e0f5f2] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0d1f1c]">{b.title}</p>
                          <p className="text-xs text-[#6b8280] mt-0.5 leading-relaxed">{b.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
