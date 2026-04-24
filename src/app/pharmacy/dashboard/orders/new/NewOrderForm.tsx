"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createManualOrderAction } from "./actions";
import AddressAutocomplete from "@/components/GetMed/AddressAutocomplete";

const ORDER_TYPES = [
  { value: "prescription", label: "Prescription" },
  { value: "transfer",     label: "Transfer Rx"  },
  { value: "otc",          label: "OTC Products"  },
] as const;

export default function NewOrderForm() {
  const router                        = useRouter();
  const [pending, startTransition]    = useTransition();
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [delivery, setDelivery]       = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress]         = useState("");
  const formRef                       = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (delivery === "delivery" && !address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createManualOrderAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        setAddress("");
        setDelivery("pickup");
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-[#0d1f1c]">Order Created!</h3>
        <p className="text-sm text-[#6b8280] mt-1 mb-6">The order has been added to your queue.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors"
          >
            Create Another
          </button>
          <button
            onClick={() => router.push("/pharmacy/dashboard/orders")}
            className="px-5 py-2.5 rounded-xl border border-[#e2efed] text-[#0d1f1c] text-sm font-semibold hover:bg-[#f0fbf9] transition-colors"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-7 max-w-[640px]">
      <input type="hidden" name="deliveryType" value={delivery} />
      <input type="hidden" name="address"      value={address}  />

      {/* Patient Information */}
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
              type="email" name="email" placeholder="patient@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Order Type */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Order Type
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {ORDER_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="relative flex cursor-pointer"
            >
              <input
                type="radio"
                name="orderType"
                value={value}
                required
                defaultChecked={value === "prescription"}
                className="peer sr-only"
              />
              <span className="w-full py-3 px-4 rounded-xl border-2 border-[#e2efed] text-sm font-semibold text-center text-[#6b8280] transition-all peer-checked:border-[#2a9d8f] peer-checked:bg-[#f0fbf9] peer-checked:text-[#2a9d8f] hover:border-[#2a9d8f]/40 cursor-pointer">
                {label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Delivery Preference */}
      <section>
        <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
          Delivery Preference
        </h4>
        <div className="grid grid-cols-2 gap-3 max-w-[280px]">
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
        </div>

        {delivery === "delivery" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <AddressAutocomplete
                inputId="manual-order-address"
                placeholder="Start typing the address…"
                className="w-full min-w-0"
                onAddressChange={(v) => setAddress(v)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
                Delivery Instructions{" "}
                <span className="text-[#9bbab7] font-normal text-xs">(optional)</span>
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

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-xl bg-[#2a9d8f] text-white font-bold text-sm hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Creating…" : "Create Order"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-[#e2efed] text-[#0d1f1c] text-sm font-semibold hover:bg-[#f0fbf9] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
