"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function LogoUpload({ value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="flex items-start gap-5">
      <input
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {/* Preview / placeholder */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#e2efed] bg-[#f8fffe] hover:border-[#2a9d8f] hover:bg-[#f0fbf9] transition-all flex items-center justify-center overflow-hidden group"
          aria-label="Upload pharmacy logo"
        >
          {preview ? (
            <img
              src={preview}
              alt="Pharmacy logo preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <ImagePlus className="w-6 h-6 text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors" />
              <span className="text-[0.6rem] font-semibold text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors uppercase tracking-wide">
                Add logo
              </span>
            </div>
          )}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#e2efed] shadow-sm flex items-center justify-center text-[#6b8280] hover:text-red-500 transition-colors"
            aria-label="Remove logo"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-[#0d1f1c]">Pharmacy Logo</p>
        <p className="text-xs text-[#6b8280] mt-1 leading-relaxed">
          Shown to patients on the GetMed platform. Use a square image for best results.
        </p>
        <p className="text-xs text-[#a0b5b2] mt-1">JPG, PNG or WebP · max 5 MB</p>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="mt-2.5 text-xs font-semibold text-[#2a9d8f] hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          {value ? "Change image" : "Browse files"}
        </button>
      </div>
    </div>
  );
}
