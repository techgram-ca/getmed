import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import SectionCard from "../SectionCard";
import PharmacyAddressField, { type AddressValue } from "../PharmacyAddressField";
import OpeningHours, { DEFAULT_HOURS, type OpeningHoursValue } from "../OpeningHours";
import FileUpload from "../FileUpload";
import CheckboxItem from "../CheckboxItem";

const PAYMENT_OPTIONS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "E-Transfer",
  "Insurance / Benefits",
];

export interface PharmacyDetailsValue {
  legalName: string;
  displayName: string;
  address: AddressValue;
  licenseNumber: string;
  licenseFile: File | null;
  openingHours: OpeningHoursValue;
  paymentMethods: string[];
}

export const DEFAULT_PHARMACY_DETAILS: PharmacyDetailsValue = {
  legalName: "",
  displayName: "",
  address: { fullAddress: "", unit: "", city: "", province: "", postalCode: "", lat: 0, lng: 0 },
  licenseNumber: "",
  licenseFile: null,
  openingHours: DEFAULT_HOURS,
  paymentMethods: [],
};

interface Props {
  value: PharmacyDetailsValue;
  onChange: (v: PharmacyDetailsValue) => void;
}

export default function PharmacyDetails({ value, onChange }: Props) {
  function set<K extends keyof PharmacyDetailsValue>(key: K, v: PharmacyDetailsValue[K]) {
    onChange({ ...value, [key]: v });
  }

  function togglePayment(method: string) {
    const next = value.paymentMethods.includes(method)
      ? value.paymentMethods.filter((m) => m !== method)
      : [...value.paymentMethods, method];
    set("paymentMethods", next);
  }

  return (
    <SectionCard
      step={2}
      title="Pharmacy Details"
      description="Legal and operational information about your pharmacy."
      icon={Building2}
    >
      {/* Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Pharmacy Legal Name" required>
          <Input
            value={value.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            placeholder="e.g. HealthFirst Pharmacy Inc."
            required
          />
        </Field>
        <Field label="Display Name" required hint="Shown to customers on GetMed">
          <Input
            value={value.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            placeholder="e.g. HealthFirst Pharmacy"
            required
          />
        </Field>
      </div>

      {/* Address */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Pharmacy Address</p>
        <PharmacyAddressField
          value={value.address}
          onChange={(v) => set("address", v)}
        />
      </div>

      {/* License */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Pharmacy License</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="License Number" required>
            <Input
              value={value.licenseNumber}
              onChange={(e) => set("licenseNumber", e.target.value)}
              placeholder="e.g. ON-PHM-12345"
              required
            />
          </Field>
          <Field label="License Document" required>
            <FileUpload
              value={value.licenseFile}
              onChange={(f) => set("licenseFile", f)}
              accept=".pdf,.jpg,.jpeg,.png"
              label="Upload License"
              hint="PDF, JPG or PNG · max 10 MB"
            />
          </Field>
        </div>
      </div>

      {/* Opening hours */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">Opening Hours</p>
        <OpeningHours
          value={value.openingHours}
          onChange={(v) => set("openingHours", v)}
        />
      </div>

      {/* Payment methods */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-3">
          Accepted Payment Methods <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {PAYMENT_OPTIONS.map((method) => (
            <CheckboxItem
              key={method}
              label={method}
              checked={value.paymentMethods.includes(method)}
              onChange={() => togglePayment(method)}
            />
          ))}
        </div>
      </div>
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
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 font-normal text-[#6b8280]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
