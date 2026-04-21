"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Edit2, Eye, EyeOff, X } from "lucide-react";
import { adminChangePasswordAction } from "@/app/admin/dashboard/settings/actions";

export default function AdminPasswordChangeForm() {
  const [editing, setEditing]         = useState(false);
  const [pending, startTransition]    = useTransition();
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await adminChangePasswordAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setEditing(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  const inputCls =
    "w-full pr-11 px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors";

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b8280]">••••••••</p>
          <button
            type="button"
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2a9d8f] border border-[#2a9d8f]/30 hover:bg-[#e0f5f2] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Change
          </button>
        </div>
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password changed successfully.
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-[#0d1f1c]">New password</span>
        <button
          type="button"
          onClick={() => { setEditing(false); setError(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6b8280] border border-[#e2efed] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8280] hover:text-[#0d1f1c] transition-colors cursor-pointer"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            required
            minLength={8}
            placeholder="Repeat new password"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8280] hover:text-[#0d1f1c] transition-colors cursor-pointer"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {pending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
