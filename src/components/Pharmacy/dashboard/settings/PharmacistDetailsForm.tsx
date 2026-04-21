"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Edit2, Loader2, Upload, X } from "lucide-react";
import { updatePharmacistAction } from "@/app/pharmacy/dashboard/settings/actions";

const MODES = [
  { value: "chat",  label: "Chat"  },
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video" },
];

interface PharmacistData {
  full_name: string;
  photo_url: string | null;
  qualification: string;
  license_number: string;
  years_of_experience: number | null;
  specialization: string[];
  languages: string[];
  bio: string | null;
  consultation_modes: string[];
  consultation_fee: number | null;
}

interface Props {
  pharmacist: PharmacistData | null;
}

export default function PharmacistDetailsForm({ pharmacist }: Props) {
  const [editing, setEditing]        = useState(false);
  const [pending, startTransition]   = useTransition();
  const [success, setSuccess]        = useState(false);
  const [error, setError]            = useState<string | null>(null);

  const init = pharmacist ?? {
    full_name: "", photo_url: null, qualification: "", license_number: "",
    years_of_experience: null, specialization: [], languages: [], bio: null,
    consultation_modes: [], consultation_fee: null,
  };

  const [fullName, setFullName]             = useState(init.full_name);
  const [qualification, setQualification]   = useState(init.qualification);
  const [licenseNum, setLicenseNum]         = useState(init.license_number);
  const [years, setYears]                   = useState(init.years_of_experience?.toString() ?? "");
  const [specialization, setSpecialization] = useState(init.specialization.join(", "));
  const [languages, setLanguages]           = useState(init.languages.join(", "));
  const [bio, setBio]                       = useState(init.bio ?? "");
  const [modes, setModes]                   = useState<Set<string>>(new Set(init.consultation_modes));
  const [fee, setFee]                       = useState(init.consultation_fee?.toString() ?? "");
  const [photoFile, setPhotoFile]           = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]     = useState<string | null>(init.photo_url);

  function handleCancel() {
    setEditing(false);
    setError(null);
    setFullName(init.full_name);
    setQualification(init.qualification);
    setLicenseNum(init.license_number);
    setYears(init.years_of_experience?.toString() ?? "");
    setSpecialization(init.specialization.join(", "));
    setLanguages(init.languages.join(", "));
    setBio(init.bio ?? "");
    setModes(new Set(init.consultation_modes));
    setFee(init.consultation_fee?.toString() ?? "");
    setPhotoFile(null);
    setPhotoPreview(init.photo_url);
  }

  function toggleMode(val: string) {
    setModes((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("fullName", fullName);
    fd.set("qualification", qualification);
    fd.set("licenseNumber", licenseNum);
    fd.set("years", years);
    fd.set("specialization", specialization);
    fd.set("languages", languages);
    fd.set("bio", bio);
    modes.forEach((m) => fd.append("modes", m));
    fd.set("fee", fee);
    if (photoFile) fd.set("photoFile", photoFile);

    startTransition(async () => {
      const res = await updatePharmacistAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setEditing(false);
        setPhotoFile(null);
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
          <h3 className="text-sm font-bold text-[#0d1f1c]">Pharmacist Profile</h3>
          <button
            type="button"
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2a9d8f] border border-[#2a9d8f]/30 hover:bg-[#e0f5f2] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {pharmacist ? "Edit" : "Set Up"}
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Pharmacist profile updated successfully.
          </div>
        )}

        {!pharmacist ? (
          <p className="text-sm text-[#6b8280]">No pharmacist profile set up yet. Click "Set Up" to add one.</p>
        ) : (
          <>
            {photoPreview && (
              <div className="flex items-center gap-3">
                <img src={photoPreview} alt={fullName} className="w-14 h-14 rounded-full object-cover border-2 border-[#e2efed]" />
                <div>
                  <p className="text-sm font-semibold text-[#0d1f1c]">{fullName}</p>
                  <p className="text-xs text-[#2a9d8f]">{qualification}</p>
                </div>
              </div>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {!photoPreview && (
                <div className="sm:col-span-2">
                  <dt className="text-[#6b8280] text-xs mb-0.5">Full Name</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{fullName}</dd>
                </div>
              )}
              <div>
                <dt className="text-[#6b8280] text-xs mb-0.5">Qualification</dt>
                <dd className="font-semibold text-[#0d1f1c]">{qualification || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#6b8280] text-xs mb-0.5">License #</dt>
                <dd className="font-semibold text-[#0d1f1c]">{licenseNum || "—"}</dd>
              </div>
              {years && (
                <div>
                  <dt className="text-[#6b8280] text-xs mb-0.5">Experience</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{years} years</dd>
                </div>
              )}
              {fee && (
                <div>
                  <dt className="text-[#6b8280] text-xs mb-0.5">Consultation Fee</dt>
                  <dd className="font-semibold text-[#0d1f1c]">${parseFloat(fee).toFixed(2)}</dd>
                </div>
              )}
            </dl>

            {specialization && (
              <div>
                <p className="text-xs text-[#6b8280] mb-1">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {specialization.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {modes.size > 0 && (
              <div>
                <p className="text-xs text-[#6b8280] mb-1">Consultation Modes</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...modes].map((m) => (
                    <span key={m} className="px-2.5 py-1 border border-[#e2efed] text-[#406460] text-xs font-medium rounded-full capitalize">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  /* ── Edit mode ─────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0d1f1c]">Pharmacist Profile</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6b8280] border border-[#e2efed] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      {/* Photo upload */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Pharmacist Photo</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e0f5f2] border-2 border-[#e2efed] flex items-center justify-center overflow-hidden shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-5 h-5 text-[#2a9d8f]" />
            )}
          </div>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e2efed] bg-white text-sm font-medium text-[#6b8280] hover:border-[#2a9d8f]/50 hover:text-[#2a9d8f] transition-colors">
            <Upload className="w-4 h-4" />
            {photoFile ? "Change Photo" : "Upload Photo"}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
          {photoFile && <span className="text-xs text-[#6b8280] truncate max-w-[140px]">{photoFile.name}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Qualification <span className="text-red-500">*</span></label>
          <input type="text" required value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. Pharm.D." className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">License # <span className="text-red-500">*</span></label>
          <input type="text" required value={licenseNum} onChange={(e) => setLicenseNum(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Years of Experience</label>
          <input type="number" min={0} max={100} value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Consultation Fee ($)</label>
          <input type="number" min={0} step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Specializations <span className="text-xs font-normal text-[#6b8280]">(comma-separated)</span></label>
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Diabetes, Cardiology" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Languages <span className="text-xs font-normal text-[#6b8280]">(comma-separated)</span></label>
          <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, French" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief description about the pharmacist..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors resize-none"
          />
        </div>
      </div>

      {/* Consultation modes */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Consultation Modes</p>
        <div className="flex flex-wrap gap-3">
          {MODES.map(({ value, label }) => {
            const selected = modes.has(value);
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
                  onChange={() => toggleMode(value)}
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
          {pending ? "Saving…" : "Save Profile"}
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
