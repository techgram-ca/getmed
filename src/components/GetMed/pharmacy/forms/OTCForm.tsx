"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitOrderAction } from "@/app/(getmed)/[slug]/actions";
import AddressAutocomplete from "@/components/GetMed/AddressAutocomplete";

interface Props {
  pharmacyId: string;
  defaultAddress: string | null;
  hasDelivery: boolean;
}

export default function OTCForm({ pharmacyId, defaultAddress, hasDelivery }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState<string | null>(null);
  const [delivery, setDelivery]    = useState<"pickup" | "delivery">(
    hasDelivery ? "delivery" : "pickup"
  );
  const [address, setAddress] = useState(defaultAddress ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (delivery === "delivery" && !address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitOrderAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
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
          The pharmacy will confirm your OTC order and contact you for next steps.
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
    <form onSubmit={handleSubmit} className="space-y-7">
      <input type="hidden" name="pharmacyId"  value={pharmacyId} />
      <input type="hidden" name="orderType"   value="otc" />
      <input type="hidden" name="deliveryType" value={delivery} />

      {/* Product Info */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Product Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="productName" required placeholder="Advil, Reactine, Vitamin D…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="quantity" required placeholder="1 box, 100 tablets…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Brand Preference
            </label>
            <select
              name="brandPreference"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors bg-white"
            >
              <option value="no-preference">No Preference</option>
              <option value="brand">Brand Name Only</option>
              <option value="generic">Generic / Store Brand</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Symptoms or Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="symptoms" required
              placeholder="Describe the symptoms or reason for this product…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors resize-none"
            />
          </div>
        </div>
      </section>

      {/* Patient Info */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Contact Information
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
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <input type="hidden" name="address" value={address} />
            <AddressAutocomplete
              inputId="otc-address"
              defaultValue={defaultAddress ?? undefined}
              placeholder="Start typing your address…"
              className="w-full min-w-0"
              onAddressChange={(v) => setAddress(v)}
            />
          </div>
        )}
      </section>

      {/* Notes */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Additional Notes
        </h4>
        <textarea
          name="notes"
          placeholder="Any allergies, special requests, or additional information…"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors resize-none"
        />
      </section>

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
        {pending ? "Submitting…" : "Submit OTC Order"}
      </button>
    </form>
  );
}
