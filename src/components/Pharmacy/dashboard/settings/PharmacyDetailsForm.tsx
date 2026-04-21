"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Edit2, Loader2, Upload, X } from "lucide-react";
import { updatePharmacyDetailsAction } from "@/app/pharmacy/dashboard/settings/actions";

const PAYMENT_OPTIONS = [
  { value: "cash",      label: "Cash" },
  { value: "credit",    label: "Credit Card" },
  { value: "debit",     label: "Debit Card" },
  { value: "etransfer", label: "E-Transfer" },
  { value: "insurance", label: "Insurance / Benefits" },
];

interface Props {
  pharmacy: {
    display_name: string;
    contact_name: string;
    phone: string;
    logo_url: string | null;
    service_online_orders: boolean;
    service_delivery: boolean;
    service_consultation: boolean;
    payment_methods: string[] | null;
  };
}

export default function PharmacyDetailsForm({ pharmacy }: Props) {
  const [editing, setEditing]           = useState(false);
  const [pending, startTransition]      = useTransition();
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Controlled state mirrors props; kept in sync on cancel
  const [displayName, setDisplayName]   = useState(pharmacy.display_name);
  const [contactName, setContactName]   = useState(pharmacy.contact_name);
  const [phone, setPhone]               = useState(pharmacy.phone);
  const [onlineOrders, setOnlineOrders] = useState(pharmacy.service_online_orders);
  const [delivery, setDelivery]         = useState(pharmacy.service_delivery);
  const [consultation, setConsultation] = useState(pharmacy.service_consultation);
  const [payments, setPayments]         = useState<Set<string>>(
    new Set(pharmacy.payment_methods ?? [])
  );
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(pharmacy.logo_url);

  function handleCancel() {
    setEditing(false);
    setError(null);
    setDisplayName(pharmacy.display_name);
    setContactName(pharmacy.contact_name);
    setPhone(pharmacy.phone);
    setOnlineOrders(pharmacy.service_online_orders);
    setDelivery(pharmacy.service_delivery);
    setConsultation(pharmacy.service_consultation);
    setPayments(new Set(pharmacy.payment_methods ?? []));
    setLogoFile(null);
    setLogoPreview(pharmacy.logo_url);
  }

  function togglePayment(val: string) {
    setPayments((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("displayName", displayName);
    fd.set("contactName", contactName);
    fd.set("phone", phone);
    if (onlineOrders)  fd.set("onlineOrders",  "on");
    if (delivery)      fd.set("delivery",       "on");
    if (consultation)  fd.set("consultation",   "on");
    payments.forEach((m) => fd.append("paymentMethods", m));
    if (logoFile) fd.set("logoFile", logoFile);

    startTransition(async () => {
      const res = await updatePharmacyDetailsAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setEditing(false);
        setLogoFile(null);
      }
    });
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors";

  /* ── View mode ─────────────────────────────────────────────── */
  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0d1f1c]">Edit Details</h3>
          <button
            type="button"
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2a9d8f] border border-[#2a9d8f]/30 hover:bg-[#e0f5f2] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Pharmacy details updated successfully.
          </div>
        )}

        {logoPreview && (
          <div className="flex items-center gap-3">
            <img
              src={logoPreview}
              alt="Pharmacy logo"
              className="w-14 h-14 rounded-2xl object-cover border border-[#e2efed]"
            />
            <p className="text-xs text-[#6b8280]">Pharmacy Logo</p>
          </div>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">Display Name</dt>
            <dd className="font-semibold text-[#0d1f1c]">{displayName}</dd>
          </div>
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">Contact Name</dt>
            <dd className="font-semibold text-[#0d1f1c]">{contactName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[#6b8280] text-xs mb-0.5">Phone</dt>
            <dd className="font-semibold text-[#0d1f1c]">{phone}</dd>
          </div>
        </dl>

        <div>
          <p className="text-xs text-[#6b8280] mb-2">Services</p>
          <div className="flex flex-wrap gap-2">
            {onlineOrders  && <span className="px-2.5 py-1 bg-blue-50   text-blue-600   text-xs font-semibold rounded-full">Online Orders</span>}
            {delivery      && <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full">Delivery</span>}
            {consultation  && <span className="px-2.5 py-1 bg-teal-50   text-teal-600   text-xs font-semibold rounded-full">Consultation</span>}
            {!onlineOrders && !delivery && !consultation && <span className="text-xs text-[#a0b5b2]">No services enabled</span>}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#6b8280] mb-2">Payment Methods</p>
          <div className="flex flex-wrap gap-2">
            {payments.size > 0 ? (
              [...payments].map((m) => {
                const opt = PAYMENT_OPTIONS.find((o) => o.value === m);
                return (
                  <span key={m} className="px-2.5 py-1 bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold rounded-full">
                    {opt?.label ?? m}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-[#a0b5b2]">None selected</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Edit mode ─────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0d1f1c]">Edit Details</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6b8280] border border-[#e2efed] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      {/* Logo upload */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Pharmacy Logo</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-5 h-5 text-[#2a9d8f]" />
            )}
          </div>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e2efed] bg-white text-sm font-medium text-[#6b8280] hover:border-[#2a9d8f]/50 hover:text-[#2a9d8f] transition-colors">
            <Upload className="w-4 h-4" />
            {logoFile ? "Change Logo" : "Upload New Logo"}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>
          {logoFile && <span className="text-xs text-[#6b8280] truncate max-w-[140px]">{logoFile.name}</span>}
        </div>
      </div>

      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Services</p>
        <div className="space-y-2">
          {([
            { label: "Online Orders", val: onlineOrders, set: setOnlineOrders },
            { label: "Delivery",      val: delivery,      set: setDelivery      },
            { label: "Consultation",  val: consultation,  set: setConsultation  },
          ] as const).map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => set(e.target.checked)}
                className="w-4 h-4 accent-[#2a9d8f] cursor-pointer"
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
          {PAYMENT_OPTIONS.map(({ value, label }) => {
            const selected = payments.has(value);
            return (
              <label
                key={value}
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-colors ${
                  selected ? "border-[#2a9d8f] bg-[#f0fbf9]" : "border-[#e2efed] hover:border-[#2a9d8f]/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => togglePayment(value)}
                  className="w-4 h-4 accent-[#2a9d8f] cursor-pointer"
                />
                <span className="text-sm text-[#0d1f1c]">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-[#e2efed] text-sm font-semibold text-[#6b8280] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
