import { UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import SectionCard from "../SectionCard";

export interface BasicInfoValue {
  contactName: string;
  email: string;
  phone: string;
  password: string;
}

interface Props {
  value: BasicInfoValue;
  onChange: (v: BasicInfoValue) => void;
}

export default function BasicInfo({ value, onChange }: Props) {
  function set<K extends keyof BasicInfoValue>(key: K, v: BasicInfoValue[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <SectionCard
      step={1}
      title="Basic Account Info"
      description="This will be your login credentials for the pharmacy portal."
      icon={UserCircle}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Person Name" required>
          <Input
            value={value.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            placeholder="Jane Smith"
            required
          />
        </Field>

        <Field label="Email Address" required>
          <Input
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@pharmacy.com"
            required
          />
        </Field>

        <Field label="Phone Number" required>
          <Input
            type="tel"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (416) 555-0100"
            required
          />
        </Field>

        <Field label="Password" required>
          <Input
            type="password"
            value={value.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
        </Field>
      </div>
    </SectionCard>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
