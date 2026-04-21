import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Mail, Clock, ShieldCheck, Users } from "lucide-react";
import Navbar from "@/components/GetMed/Navbar";
import Footer from "@/components/GetMed/Footer";

export const metadata: Metadata = {
  title: "Support — GetMed",
  description: "Get help from a real GetMed team member — by phone, email, or WhatsApp. No bots, no scripts, just humans.",
};

const CHANNELS = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+1 (800) 438-6332",
    desc: "Speak directly with a GetMed team member. No phone trees, no hold music — we pick up.",
    action: "tel:+18004386332",
    cta: "Call now",
    accent: "#2a9d8f",
    bg: "#e0f5f2",
    hours: "Mon – Fri, 8 am – 8 pm ET",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    desc: "Send us a message on WhatsApp and a real team member will reply — usually within a few minutes.",
    action: "https://wa.me/18004386332",
    cta: "Open WhatsApp",
    accent: "#25D366",
    bg: "#e8fbee",
    hours: "Mon – Fri, 8 am – 8 pm ET",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "support@getmed.ca",
    desc: "For non-urgent questions, documentation requests, or detailed issues — we respond within one business day.",
    action: "mailto:support@getmed.ca",
    cta: "Send email",
    accent: "#7c3aed",
    bg: "#ede9fe",
    hours: "Response within 1 business day",
  },
];

const FAQS = [
  {
    q: "How do I place a prescription order?",
    a: "Search for a pharmacy near you, upload your prescription photo, and confirm your delivery address. The pharmacy will contact you to verify before filling the order.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders are delivered within 2–4 hours of pharmacy confirmation. Delivery times depend on your location and the pharmacy's preparation time.",
  },
  {
    q: "Can I consult a pharmacist without placing an order?",
    a: "Yes. Visit the Consult a Pharmacist page, enter your address, and book a consultation with a licensed pharmacist near you.",
  },
  {
    q: "What if my pharmacy can't fill my prescription?",
    a: "The pharmacy will contact you directly. You can also reach our support team and we'll help you find an alternative.",
  },
  {
    q: "How do I register my pharmacy on GetMed?",
    a: "Visit getmed.ca/pharmacy/signup and complete the registration form. Our team reviews applications within 1–2 business days.",
  },
  {
    q: "Is my health information kept private?",
    a: "Absolutely. Your prescription and health data is encrypted and shared only with the pharmacy or pharmacist fulfilling your request. We never sell your data.",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#e0f5f2] via-[#f0fbf9] to-white pt-28 pb-16 px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              <Users className="w-3.5 h-3.5" />
              Real people, real help
            </div>
            <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold tracking-tight text-[#0d1f1c] leading-[1.15]">
              We&apos;re here when you need us
            </h1>
            <p className="mt-4 text-[1.05rem] text-[#6b8280] max-w-[520px] mx-auto leading-[1.75]">
              Every message you send reaches a real GetMed team member.
              No AI bots, no scripted responses — just humans who actually care.
            </p>

            {/* Trust bar */}
            <div className="mt-8 inline-flex flex-wrap justify-center gap-6 text-sm text-[#6b8280]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2a9d8f]" />
                No AI chatbots
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2a9d8f]" />
                Fast response times
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2a9d8f]" />
                Friendly human support
              </span>
            </div>
          </div>
        </section>

        {/* Contact channels */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="rounded-2xl border-2 border-[#e2efed] p-7 flex flex-col hover:border-[#2a9d8f]/40 hover:shadow-[0_8px_32px_rgba(42,157,143,0.08)] transition-all"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shrink-0"
                      style={{ backgroundColor: c.bg }}
                    >
                      <Icon className="w-7 h-7" style={{ color: c.accent }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c.accent }}>
                      {c.label}
                    </p>
                    <p className="text-lg font-extrabold text-[#0d1f1c] mb-3">{c.value}</p>
                    <p className="text-sm text-[#6b8280] leading-[1.7] flex-1">{c.desc}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs text-[#6b8280]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {c.hours}
                    </div>
                    <a
                      href={c.action}
                      target={c.action.startsWith("http") ? "_blank" : undefined}
                      rel={c.action.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 no-underline"
                      style={{ backgroundColor: c.accent }}
                    >
                      {c.cta}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Human promise banner */}
        <section className="py-12 px-6 bg-[#0d1f1c]">
          <div className="max-w-[760px] mx-auto text-center">
            <div className="text-3xl mb-4">👋</div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              You&apos;ll always talk to a real person
            </h2>
            <p className="mt-3 text-[#6b8280] text-sm leading-[1.75] max-w-[480px] mx-auto">
              We don&apos;t use AI chatbots or automated response systems. When you reach out,
              a GetMed team member reads your message personally and replies with a real answer —
              not a script, not a bot, not a canned response.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[#f0faf8]">
          <div className="max-w-[760px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">
                Common Questions
              </p>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-extrabold tracking-tight text-[#0d1f1c]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-[#e2efed] p-6 shadow-sm"
                >
                  <p className="text-sm font-bold text-[#0d1f1c] mb-2">{faq.q}</p>
                  <p className="text-sm text-[#6b8280] leading-[1.75]">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-[#6b8280]">
                Still have questions?{" "}
                <a
                  href="mailto:support@getmed.ca"
                  className="text-[#2a9d8f] font-semibold hover:underline"
                >
                  Email us
                </a>{" "}
                or{" "}
                <a
                  href="https://wa.me/18004386332"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2a9d8f] font-semibold hover:underline"
                >
                  chat on WhatsApp
                </a>{" "}
                — a real person will reply.
              </p>
            </div>
          </div>
        </section>

        {/* Pharmacy support note */}
        <section className="py-12 px-6 bg-white border-t border-[#e2efed]">
          <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#2a9d8f]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#0d1f1c]">Are you a pharmacy partner?</p>
              <p className="text-sm text-[#6b8280] mt-1 leading-[1.7]">
                For pharmacy-specific support, dashboard issues, or onboarding help, email us at{" "}
                <a href="mailto:pharmacies@getmed.ca" className="text-[#2a9d8f] font-semibold hover:underline">
                  pharmacies@getmed.ca
                </a>{" "}
                or visit your dashboard for in-app assistance.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
