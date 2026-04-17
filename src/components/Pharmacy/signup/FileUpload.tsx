"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export default function FileUpload({
  value,
  onChange,
  accept,
  label = "Upload file",
  hint,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e2efed] bg-[#f0fbf9]">
          <FileText className="w-5 h-5 text-[#2a9d8f] shrink-0" />
          <span className="text-sm text-[#0d1f1c] flex-1 truncate">{value.name}</span>
          <span className="text-xs text-[#6b8280] shrink-0">
            {(value.size / 1024).toFixed(0)} KB
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[#6b8280] hover:text-[#0d1f1c] transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-7 px-4 border-2 border-dashed border-[#e2efed] rounded-xl hover:border-[#2a9d8f] hover:bg-[#f0fbf9] transition-all group"
        >
          <Upload className="w-6 h-6 text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors" />
          <span className="text-sm font-medium text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors">
            {label}
          </span>
          {hint && <span className="text-xs text-[#6b8280]">{hint}</span>}
        </button>
      )}
    </div>
  );
}
