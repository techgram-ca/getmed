"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    category: "Ordering Prescriptions",
    items: [
      {
        q: "How do I order a prescription through GetMed?",
        a: "Simply enter your address on the homepage to find nearby pharmacies. Select a pharmacy, fill in your name, contact details, and delivery address, then submit your prescription order. The pharmacy will contact you to confirm and process your request.",
      },
      {
        q: "Can I transfer my existing prescription from another pharmacy?",
        a: "Yes. On any pharmacy's page, choose the 'Transfer Prescription' option. Provide your current pharmacy details and the pharmacy will handle the transfer on your behalf at no cost.",
      },
      {
        q: "What types of prescriptions can I order?",
        a: "GetMed supports new prescriptions, refills, and transfers for most medications available at Canadian pharmacies. Controlled substances may require additional verification in accordance with provincial regulations.",
      },
      {
        q: "Is there a limit to how many prescriptions I can submit at once?",
        a: "There is no set limit. You can submit multiple prescriptions in a single order by providing the relevant details in the delivery instructions field, or by contacting the pharmacy directly after placing your order.",
      },
    ],
  },
  {
    category: "Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Delivery times vary by pharmacy and location. Most participating pharmacies offer same-day or next-day delivery. You will receive an estimated delivery window when the pharmacy confirms your order.",
      },
      {
        q: "Is delivery available in my area?",
        a: "Enter your address on the homepage to see pharmacies that offer delivery near you. Delivery availability depends on your proximity to participating pharmacies.",
      },
      {
        q: "How much does delivery cost?",
        a: "Delivery fees are set by each individual pharmacy and will be communicated to you when your order is confirmed. Some pharmacies offer free delivery above a minimum order value.",
      },
    ],
  },
  {
    category: "Consulting a Pharmacist",
    items: [
      {
        q: "What is a pharmacist consultation on GetMed?",
        a: "You can book a one-on-one consultation with a licensed Canadian pharmacist via chat, phone, or video. They can advise on medication use, side effects, drug interactions, and minor ailments.",
      },
      {
        q: "How much does a consultation cost?",
        a: "Consultation fees vary by pharmacist — some offer free consultations. The fee is shown clearly on each pharmacist's profile before you book.",
      },
      {
        q: "Are the pharmacists on GetMed licensed?",
        a: "Yes. All pharmacists on GetMed are licensed and regulated by their provincial pharmacy college in Canada. You can view each pharmacist's qualifications and license information on their profile.",
      },
      {
        q: "Can a pharmacist prescribe medication during a consultation?",
        a: "Licensed pharmacists in many Canadian provinces have prescribing authority for certain conditions and medications. Your pharmacist will advise you on what they can prescribe based on provincial regulations and your specific situation.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    items: [
      {
        q: "Do I need to create an account to place an order?",
        a: "No account is required to submit an order or book a consultation. You provide your contact details as part of each order and the pharmacy reaches out to you directly.",
      },
      {
        q: "How is my personal and health information protected?",
        a: "GetMed takes privacy seriously. Your information is transmitted securely and shared only with the pharmacy you select. We comply with Canadian privacy laws including PIPEDA. See our Privacy Policy for full details.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#e2efed] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-[#f8fffe] transition-colors"
      >
        <span className="text-sm font-semibold text-[#0d1f1c]">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#2a9d8f] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-[#6b8280] shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-white border-t border-[#e2efed]">
          <p className="text-sm text-[#6b8280] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="bg-[#f8fffe] min-h-screen pt-16">
      {/* Hero — text left, image right */}
      <section className="max-w-[1200px] mx-auto px-6 pt-[72px] pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
              Help Centre
            </div>
            <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-[#0d1f1c]">
              Frequently Asked <span className="text-[#2a9d8f]">Questions</span>
            </h1>
            <p className="mt-4 text-[1.05rem] text-[#6b8280] max-w-[480px] leading-[1.7]">
              Everything you need to know about ordering prescriptions, booking consultations, and how GetMed works — answered in one place.
            </p>
            <p className="mt-4 text-sm text-[#6b8280]">
              Can't find your answer?{" "}
              <a href="/support" className="text-[#2a9d8f] font-semibold hover:underline">
                Contact our support team
              </a>
            </p>
          </div>

          {/* Right — image */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-[-12px] bg-[#e0f5f2] rounded-[28px] rotate-3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/faq.png"
              alt="FAQ illustration"
              className="relative rounded-2xl w-full object-cover shadow-[0_32px_80px_rgba(42,157,143,0.15)]"
            />
          </div>
        </div>
      </section>

      {/* FAQ accordion sections */}
      <section className="max-w-[800px] mx-auto px-6 pb-20">
        <div className="space-y-10">
          {FAQS.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-4">
                {category}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
