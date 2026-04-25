"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    startTransition(() => {
      router.refresh();
    });
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      title="Refresh"
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#cfe3df] text-[#2a9d8f] text-xs font-semibold hover:bg-[#e8f6f4] transition-colors disabled:opacity-60"
    >
      <RotateCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}
