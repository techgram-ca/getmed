import { Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "../SectionCard";
import FileUpload from "../FileUpload";
import OpeningHours, { DEFAULT_HOURS, type OpeningHoursValue } from "../OpeningHours";
import CheckboxItem from "../CheckboxItem";

export interface PharmacistValue {
  fullName: string;
  photo: File | null;
  qualification: string;
  licenseNumber: string;
  yearsOfExperience: string;
  specialization: string;
  languages: string;
  bio: string;
  availabilityHours: OpeningHoursValue;
  modes: { chat: boolean; phone: boolean; video: boolean };
  fee: string;
}

export const DEFAULT_PHARMACIST: PharmacistValue = {
  fullName: "",
  photo: null,
  qualification: "",
  licenseNumber: "",
  yearsOfExperience: "",
  specialization: "",
  languages: "",
  bio: "",
  availabilityHours: DEFAULT_HOURS,
  modes: { chat: false, phone: false, video: false },
  fee: "",
};

interface Props {
  value: PharmacistValue;
  onChange: (v: PharmacistValue) => void;
}

export default function PharmacistDetails({ value, onChange }: Props) {
  function set<K extends keyof PharmacistValue>(key: K, v: PharmacistValue[K]) {
    onChange({ ...value, [key]: v });
  }

  function toggleMode(mode: keyof PharmacistValue["modes"]) {
    onChange({ ...value, modes: { ...value.modes, [mode]: !value.modes[mode] } });
  }

  return (
    <SectionCard
      step={4}
      title="Pharmacist / Professional Profile"
      description="Required since you selected Online Pharmacy Consultation."
      icon={Stethoscope}
    >
      {/* Photo + Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Pharmacist Full Name" required>
          <Input
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Dr. John Doe"
            required
          />
        </Field>

        <Field label="Pharmacist Photo">
          <FileUpload
            value={value.photo}
            onChange={(f) => set("photo", f)}
            accept="image/*"
            label="Upload Photo"
            hint="JPG or PNG · square preferred"
          />
        </Field>
      </div>

      {/* Credentials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Qualification / Degree" required>
          <Input
            value={value.qualification}
            onChange={(e) => set("qualification", e.target.value)}
            placeholder="e.g. PharmD, BScPharm"
            required
          />
        </Field>

        <Field label="License / Registration Number" required>
          <Input
            value={value.licenseNumber}
            onChange={(e) => set("licenseNumber", e.target.value)}
            placeholder="e.g. OCP-12345"
            required
          />
        </Field>

        <Field label="Years of Experience" required>
          <Input
            type="number"
            min={0}
            max={60}
            value={value.yearsOfExperience}
            onChange={(e) => set("yearsOfExperience", e.target.value)}
            placeholder="e.g. 8"
            required
          />
        </Field>

        <Field label="Consultation Languages" required hint="comma-separated">
          <Input
            value={value.languages}
            onChange={(e) => set("languages", e.target.value)}
            placeholder="e.g. English, French, Punjabi"
            required
          />
        </Field>
      </div>

      {/* Specialization */}
      <Field label="Specialization / Consultation Areas" required hint="comma-separated">
        <Input
          value={value.specialization}
          onChange={(e) => set("specialization", e.target.value)}
          placeholder="e.g. Diabetes, Hypertension, Pediatric Care"
          required
        />
      </Field>

      {/* Bio */}
      <Field label="Short Bio" required>
        <Textarea
          value={value.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Brief professional background visible to patients..."
          maxLength={500}
          required
          rows={4}
        />
        <p className="mt-1 text-xs text-[#6b8280] text-right">
          {value.bio.length} / 500
        </p>
      </Field>

      {/* Consultation availability */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Consultation Availability</p>
        <OpeningHours
          value={value.availabilityHours}
          onChange={(v) => set("availabilityHours", v)}
        />
      </div>

      {/* Consultation mode */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">
          Consultation Mode <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {(
            [
              { key: "chat", label: "💬 Chat" },
              { key: "phone", label: "📞 Phone" },
              { key: "video", label: "📹 Video" },
            ] as const
          ).map(({ key, label }) => (
            <CheckboxItem
              key={key}
              label={label}
              checked={value.modes[key]}
              onChange={() => toggleMode(key)}
            />
          ))}
        </div>
      </div>

      {/* Fee */}
      <Field label="Consultation Fee (CAD)" hint="leave blank if free">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6b8280]">
            $
          </span>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={value.fee}
            onChange={(e) => set("fee", e.target.value)}
            placeholder="0.00"
            className="pl-8"
          />
        </div>
      </Field>
    </SectionCard>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 font-normal text-[#6b8280] text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
