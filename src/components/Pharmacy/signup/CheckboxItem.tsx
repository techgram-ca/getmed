"use client";

interface Props {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function CheckboxItem({ label, checked, onChange }: Props) {
  return (
    <label
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium select-none ${
        checked
          ? "border-[#2a9d8f] bg-[#f0fbf9] text-[#2a9d8f]"
          : "border-[#e2efed] bg-white text-[#6b8280] hover:border-[#2a9d8f]/40"
      }`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-[#2a9d8f] border-[#2a9d8f]" : "border-[#d1e8e5]"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}
