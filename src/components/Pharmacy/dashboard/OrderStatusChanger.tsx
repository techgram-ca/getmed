"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "@/app/pharmacy/dashboard/orders/actions";

const TRANSITIONS: Record<string, { label: string; status: string; style: string }[]> = {
  new: [
    { label: "→ Processing", status: "processing", style: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    { label: "Cancel",       status: "cancelled",  style: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
  ],
  processing: [
    { label: "→ Ready for Delivery", status: "ready",     style: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
    { label: "Cancel",               status: "cancelled", style: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
  ],
  cancelled: [
    { label: "Reopen (Processing)", status: "processing", style: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
  ],
  ready: [
    { label: "Cancel", status: "cancelled", style: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
  ],
  dispatched:       [],
  completed:        [],
  delivery_failed:  [],
};

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusChanger({ orderId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const options = TRANSITIONS[currentStatus] ?? [];

  if (options.length === 0) {
    return <p className="text-xs text-[#6b8280]">No further status changes available.</p>;
  }

  function handleChange(newStatus: string) {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, newStatus);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, status, style }) => (
        <button
          key={status}
          type="button"
          disabled={pending}
          onClick={() => handleChange(status)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
