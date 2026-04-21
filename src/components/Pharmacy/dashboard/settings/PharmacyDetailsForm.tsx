"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { updatePharmacyDetailsAction } from "@/app/pharmacy/dashboard/settings/actions";

const PAYMENT_OPTIONS = [
  { value: "cash",       label: "Cash" },
  { value: "credit",     label: "Credit Card" },
  { value: "debit",      label: "Debit Card" },
  { value: "etransfer",  label: "E-Transfer" },
  { value: "insurance",  label: "Insurance / Benefits" },
];

interface Props {
  pharmacy: {
    display_name: string;
    contact_name: string;
    phone: string;
    service_online_orders: boolean;
    service_delivery: boolean;
    service_consultation: boolean;
    payment_methods: string[] | null;
  };
}

export default function PharmacyDetailsForm({ pharmacy }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePharmacyDetailsAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="displayName" required
            defaultValue={pharmacy.display_name}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text" name="contactName" required
            defaultValue={pharmacy.contact_name}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel" name="phone" required
            defaultValue={pharmacy.phone}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
          />
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Services</p>
        <div className="space-y-2">
          {[
            { name: "onlineOrders", label: "Online Orders", checked: pharmacy.service_online_orders },
            { name: "delivery",     label: "Delivery",      checked: pharmacy.service_delivery      },
            { name: "consultation", label: "Consultation",  checked: pharmacy.service_consultation  },
          ].map(({ name, label, checked }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name={name}
                defaultChecked={checked}
                className="w-4 h-4 accent-[#2a9d8f]"
              />
              <span className="text-sm text-[#0d1f1c] group-hover:text-[#2a9d8f] transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Accepted Payment Methods</p>
        <div className="flex flex-wrap gap-3">
          {PAYMENT_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-[#e2efed] hover:border-[#2a9d8f]/50 transition-colors"
            >
              <input
                type="checkbox"
                name="paymentMethods"
                value={value}
                defaultChecked={(pharmacy.payment_methods ?? []).includes(value)}
                className="w-4 h-4 accent-[#2a9d8f]"
              />
              <span className="text-sm text-[#0d1f1c]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Pharmacy details updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
