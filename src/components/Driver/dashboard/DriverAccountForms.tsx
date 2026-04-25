"use client";

import { useState, useTransition } from "react";
import { redirect } from "next/navigation";
import { CheckCircle2, LogOut, User } from "lucide-react";
import { updateDriverProfileAction, changeDriverPasswordAction } from "@/app/driver/dashboard/account/actions";
import RefreshButton from "@/components/shared/RefreshButton";

interface Driver {
  full_name: string;
  phone: string;
  city: string;
  province: string;
  postal_code: string;
  vehicle_type: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate: string | null;
  photo_url: string | null;
  email: string | null;
}

interface Props {
  driver: Driver;
  provinces: string[];
  vehicleTypes: string[];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0d1f1c] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 rounded-xl border border-[#e2efed] text-sm text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] transition-colors";

export default function DriverAccountForms({ driver, provinces, vehicleTypes }: Props) {
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwMsg,      setPwMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [profilePending, startProfileTx] = useTransition();
  const [pwPending,      startPwTx]      = useTransition();

  function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    const fd = new FormData(e.currentTarget);
    startProfileTx(async () => {
      const { error } = await updateDriverProfileAction(fd);
      setProfileMsg(error ? { type: "err", text: error } : { type: "ok", text: "Profile saved." });
    });
  }

  function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    startPwTx(async () => {
      const { error } = await changeDriverPasswordAction(fd);
      if (error) {
        setPwMsg({ type: "err", text: error });
      } else {
        setPwMsg({ type: "ok", text: "Password changed." });
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#f0faf8] pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold text-[#0d1f1c]">My Account</p>
          <RefreshButton />
        </div>

        {/* Avatar + email */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 flex items-center gap-4">
          {driver.photo_url ? (
            <img src={driver.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#e2efed] shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#e0f5f2] flex items-center justify-center border-2 border-[#e2efed] shrink-0">
              <User className="w-6 h-6 text-[#2a9d8f]" />
            </div>
          )}
          <div>
            <p className="text-sm font-extrabold text-[#0d1f1c]">{driver.full_name}</p>
            <p className="text-xs text-[#6b8280]">{driver.email ?? ""}</p>
          </div>
        </div>

        {/* Profile edit */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2efed]">
            <p className="text-sm font-bold text-[#0d1f1c]">Edit Profile</p>
          </div>
          <form onSubmit={handleProfile} className="px-5 py-5 space-y-4">
            {profileMsg && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl ${
                profileMsg.type === "ok"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {profileMsg.type === "ok" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name">
                <input name="full_name" defaultValue={driver.full_name} required className={INPUT} />
              </Field>
              <Field label="Phone">
                <input name="phone" type="tel" defaultValue={driver.phone} required className={INPUT} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input name="city" defaultValue={driver.city} required className={INPUT} />
              </Field>
              <Field label="Province">
                <select name="province" defaultValue={driver.province} className={INPUT}>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Postal Code">
              <input name="postal_code" defaultValue={driver.postal_code} required className={`${INPUT} max-w-[160px]`} />
            </Field>

            <div className="border-t border-[#f0f7f5] pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b8280] mb-3">Vehicle</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select name="vehicle_type" defaultValue={driver.vehicle_type ?? ""} className={INPUT}>
                    <option value="">— Select —</option>
                    {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Make">
                  <input name="vehicle_make" defaultValue={driver.vehicle_make ?? ""} className={INPUT} placeholder="e.g. Toyota" />
                </Field>
                <Field label="Model">
                  <input name="vehicle_model" defaultValue={driver.vehicle_model ?? ""} className={INPUT} placeholder="e.g. Corolla" />
                </Field>
                <Field label="Year">
                  <input name="vehicle_year" type="number" defaultValue={driver.vehicle_year ?? ""} min={1990} max={2030} className={INPUT} placeholder="e.g. 2020" />
                </Field>
                <Field label="License Plate">
                  <input name="vehicle_plate" defaultValue={driver.vehicle_plate ?? ""} className={INPUT} />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={profilePending}
              className="w-full py-3 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold disabled:opacity-50"
            >
              {profilePending ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2efed]">
            <p className="text-sm font-bold text-[#0d1f1c]">Change Password</p>
          </div>
          <form onSubmit={handlePassword} className="px-5 py-5 space-y-4">
            {pwMsg && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl ${
                pwMsg.type === "ok"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {pwMsg.type === "ok" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                {pwMsg.text}
              </div>
            )}
            <Field label="New Password">
              <input name="newPassword" type="password" required minLength={8} className={INPUT} placeholder="Min 8 characters" />
            </Field>
            <Field label="Confirm Password">
              <input name="confirmPassword" type="password" required minLength={8} className={INPUT} placeholder="Repeat new password" />
            </Field>
            <button
              type="submit"
              disabled={pwPending}
              className="w-full py-3 rounded-xl bg-[#0d1f1c] text-white text-sm font-bold disabled:opacity-50"
            >
              {pwPending ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
