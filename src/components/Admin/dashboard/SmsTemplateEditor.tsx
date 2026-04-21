"use client";

import { useState, useTransition, useRef } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { updateSmsTemplateAction, resetSmsTemplateAction } from "@/app/admin/dashboard/settings/actions";

interface Props {
  templateKey: string;
  label: string;
  vars: string[];
  defaultBody: string;
  currentBody: string;
  isCustomized: boolean;
}

export default function SmsTemplateEditor({
  templateKey,
  label,
  vars,
  defaultBody,
  currentBody,
  isCustomized,
}: Props) {
  const [body, setBody]       = useState(currentBody);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [customized, setCustomized] = useState(isCustomized);
  const [pending, startTransition]  = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("templateKey", templateKey);
      fd.set("body", body);
      const result = await updateSmsTemplateAction(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setCustomized(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  function handleReset() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("templateKey", templateKey);
      await resetSmsTemplateAction(fd);
      setBody(defaultBody);
      setCustomized(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const isDirty = body !== currentBody;

  return (
    <div className="border border-[#e2efed] rounded-xl overflow-hidden">
      <div className="bg-[#f8fffe] px-4 py-3 flex items-center justify-between gap-3 border-b border-[#e2efed]">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs font-semibold text-[#0d1f1c] truncate">{label}</p>
          {customized && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#2a9d8f] text-white shrink-0">
              Customized
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          {customized && (
            <button
              type="button"
              onClick={handleReset}
              disabled={pending}
              title="Reset to default"
              className="flex items-center gap-1 text-[11px] text-[#6b8280] hover:text-red-500 transition-colors disabled:opacity-50 bg-transparent border-none cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full text-xs text-[#0d1f1c] border border-[#e2efed] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2a9d8f] resize-y font-mono leading-relaxed bg-white"
        />

        {/* Available variables */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
          <span className="text-[10px] text-[#6b8280]">Variables:</span>
          {vars.map((v) => (
            <button
              key={v}
              type="button"
              title="Click to insert"
              onClick={() => setBody((prev) => `${prev}{{${v}}}`)}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f0fbf9] border border-[#cce8e4] text-[#2a9d8f] hover:bg-[#e0f5f2] cursor-pointer border-none"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !isDirty}
          className="px-4 py-2 rounded-lg bg-[#2a9d8f] text-white text-xs font-bold hover:bg-[#21867a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : "Save Template"}
        </button>
      </div>
    </div>
  );
}
