"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { submitOrderAction } from "@/app/(getmed)/[slug]/actions";

interface Props {
  pharmacyId: string;
  defaultAddress: string | null;
  hasDelivery: boolean;
}

export default function PrescriptionForm({ pharmacyId, defaultAddress, hasDelivery }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState<string | null>(null);
  const [delivery, setDelivery]    = useState<"pickup" | "delivery">(
    hasDelivery ? "delivery" : "pickup"
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileRef           = useRef<HTMLInputElement>(null);
  const formRef           = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError("Please upload at least one prescription file.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    files.forEach((f) => fd.append("files", f));
    startTransition(async () => {
      const res = await submitOrderAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setFiles([]);
        formRef.current?.reset();
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-[#0d1f1c]">Order Submitted!</h3>
        <p className="text-sm text-[#6b8280] mt-2 max-w-sm">
          The pharmacy will contact you shortly to confirm your prescription order.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
      <input type="hidden" name="pharmacyId" value={pharmacyId} />
      <input type="hidden" name="orderType"  value="prescription" />
      <input type="hidden" name="deliveryType" value={delivery} />

      {/* Patient Info */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Patient Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="name" required placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel" name="phone" required placeholder="(416) 555-0100"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Email <span className="text-[#9bbab7] font-normal text-xs">(optional)</span>
            </label>
            <input
              type="email" name="email" placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Prescription Details */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Prescription Details
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Health Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="healthCardNumber" required placeholder="1234-567-890 AB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Prescription &amp; Insurance Files <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const added = Array.from(e.target.files ?? []);
                setFiles((prev) => [...prev, ...added]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-[#e2efed] text-sm text-[#6b8280] hover:border-[#2a9d8f] hover:text-[#2a9d8f] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Click to upload prescription or insurance card
            </button>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#f0fbf9] border border-[#e2efed]">
                    <span className="text-xs text-[#0d1f1c] truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="shrink-0 text-[#6b8280] hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Delivery Preference */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Delivery Preference
        </h4>
        <div className={`grid gap-3 ${hasDelivery ? "grid-cols-2" : "grid-cols-1 max-w-[200px]"}`}>
          <button
            type="button"
            onClick={() => setDelivery("pickup")}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
              delivery === "pickup"
                ? "border-[#2a9d8f] bg-[#f0fbf9] text-[#2a9d8f]"
                : "border-[#e2efed] text-[#6b8280] hover:border-[#2a9d8f]/40"
            }`}
          >
            🏪 Pick Up
          </button>
          {hasDelivery && (
            <button
              type="button"
              onClick={() => setDelivery("delivery")}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                delivery === "delivery"
                  ? "border-[#2a9d8f] bg-[#f0fbf9] text-[#2a9d8f]"
                  : "border-[#e2efed] text-[#6b8280] hover:border-[#2a9d8f]/40"
              }`}
            >
              🚚 Delivery
            </button>
          )}
        </div>

        {delivery === "delivery" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="address" required
                defaultValue={defaultAddress ?? ""}
                placeholder="123 Main St, Toronto, ON M5V 1A1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
                Delivery Instructions <span className="text-[#9bbab7] font-normal text-xs">(optional)</span>
              </label>
              <textarea
                name="deliveryInstructions"
                placeholder="Apt #, buzzer code, leave at door…"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </section>

      {/* Consent */}
      <div className="bg-[#f8fffe] rounded-xl border border-[#e2efed] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-[#2a9d8f] w-4 h-4 shrink-0" />
          <span className="text-sm text-[#6b8280] leading-relaxed">
            I authorize this pharmacy to fill my prescription and consent to the collection of my
            health information for the purpose of providing pharmacy services.
          </span>
        </label>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-[#2a9d8f] text-white font-bold text-sm hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting…" : "Submit Prescription Order"}
      </button>
    </form>
  );
}
