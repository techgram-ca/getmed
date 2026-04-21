"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/app/pharmacy/dashboard/settings/actions";

export default function PasswordChangeForm() {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await changePasswordAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
          New Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password" name="newPassword" required minLength={8}
          placeholder="Min. 8 characters"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password" name="confirmPassword" required minLength={8}
          placeholder="Repeat new password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Password changed successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
