"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, RotateCcw, XCircle } from "lucide-react";
import {
  approveDriverAction,
  rejectDriverAction,
  suspendDriverAction,
  reactivateDriverAction,
} from "@/app/admin/dashboard/drivers/[id]/actions";

interface Props {
  driverId: string;
  status: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  flash?: string;
  error?: string;
}

export default function DriverReviewActions({ driverId, status, rejectionReason, reviewedAt, flash, error }: Props) {
  const [showReject, setShowReject] = useState(false);
  const [approving, startApprove]   = useTransition();
  const [rejecting, startReject]    = useTransition();
  const [suspending, startSuspend]  = useTransition();
  const [reactivating, startReactivate] = useTransition();

  const submit = (action: (fd: FormData) => Promise<void>, form: HTMLFormElement) =>
    action(new FormData(form));

  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e2efed]">
        <h2 className="text-sm font-bold text-[#0d1f1c]">Review Decision</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Flash messages */}
        {flash === "approved" && (
          <Alert type="success">Driver approved successfully.</Alert>
        )}
        {flash === "rejected" && (
          <Alert type="error">Driver application rejected.</Alert>
        )}
        {flash === "suspended" && (
          <Alert type="warn">Driver account suspended.</Alert>
        )}
        {flash === "reactivated" && (
          <Alert type="success">Driver account reactivated.</Alert>
        )}
        {error === "reason_required" && (
          <Alert type="warn">Please enter a rejection reason.</Alert>
        )}

        {/* Status badge */}
        <StatusBadge status={status} reviewedAt={reviewedAt} rejectionReason={rejectionReason} />

        {/* Pending → approve / reject */}
        {status === "pending" && (
          <>
            <form onSubmit={(e) => { e.preventDefault(); startApprove(() => submit(approveDriverAction, e.currentTarget)); }}>
              <input type="hidden" name="driverId" value={driverId} />
              <button
                type="submit" disabled={approving || rejecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60"
              >
                {approving ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</> : <><CheckCircle2 className="w-4 h-4" /> Approve Driver</>}
              </button>
            </form>

            <div>
              <button
                type="button" onClick={() => setShowReject(!showReject)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Reject Application</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showReject ? "rotate-180" : ""}`} />
              </button>

              {showReject && (
                <form
                  onSubmit={(e) => { e.preventDefault(); startReject(() => submit(rejectDriverAction, e.currentTarget)); }}
                  className="mt-3 space-y-3"
                >
                  <input type="hidden" name="driverId" value={driverId} />
                  <div>
                    <label className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide mb-1.5">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason" required rows={3}
                      placeholder="Explain why this application is being rejected…"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2efed] bg-[#f8fffe] text-sm text-[#0d1f1c] placeholder:text-[#a0b5b2] focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={approving || rejecting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {rejecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting…</> : "Confirm Rejection"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Approved → suspend */}
        {status === "approved" && (
          <form onSubmit={(e) => { e.preventDefault(); startSuspend(() => submit(suspendDriverAction, e.currentTarget)); }}>
            <input type="hidden" name="driverId" value={driverId} />
            <button
              type="submit" disabled={suspending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors disabled:opacity-60"
            >
              {suspending ? <><Loader2 className="w-4 h-4 animate-spin" /> Suspending…</> : "Suspend Driver"}
            </button>
          </form>
        )}

        {/* Suspended → reactivate */}
        {status === "suspended" && (
          <form onSubmit={(e) => { e.preventDefault(); startReactivate(() => submit(reactivateDriverAction, e.currentTarget)); }}>
            <input type="hidden" name="driverId" value={driverId} />
            <button
              type="submit" disabled={reactivating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {reactivating ? <><Loader2 className="w-4 h-4 animate-spin" /> Reactivating…</> : <><RotateCcw className="w-4 h-4" /> Reactivate Driver</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Alert({ type, children }: { type: "success" | "error" | "warn"; children: React.ReactNode }) {
  const styles = {
    success: { cls: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />, text: "text-emerald-700" },
    error:   { cls: "bg-red-50 border-red-200",         icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,        text: "text-red-700"     },
    warn:    { cls: "bg-amber-50 border-amber-200",      icon: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,  text: "text-amber-700"   },
  }[type];
  return (
    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${styles.cls}`}>
      {styles.icon}
      <p className={`text-sm font-medium ${styles.text}`}>{children}</p>
    </div>
  );
}

function StatusBadge({ status, reviewedAt, rejectionReason }: { status: string; reviewedAt?: string | null; rejectionReason?: string | null }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    pending:   { label: "Pending Review", cls: "bg-amber-50 border-amber-200 text-amber-700",      dot: "bg-amber-500 animate-pulse" },
    approved:  { label: "Approved",       cls: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500"            },
    rejected:  { label: "Rejected",       cls: "bg-red-50 border-red-200 text-red-700",             dot: "bg-red-500"               },
    suspended: { label: "Suspended",      cls: "bg-orange-50 border-orange-200 text-orange-700",    dot: "bg-orange-500"            },
  };
  const s = map[status] ?? map.pending;
  return (
    <div className={`rounded-xl border px-4 py-3 ${s.cls}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className="text-sm font-bold">{s.label}</span>
      </div>
      {reviewedAt && (
        <p className="text-xs opacity-70 mt-0.5">
          Reviewed {new Date(reviewedAt).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      )}
      {rejectionReason && (
        <p className="text-xs mt-2 pt-2 border-t border-current/20 opacity-80 leading-relaxed">
          <span className="font-semibold">Reason:</span> {rejectionReason}
        </p>
      )}
    </div>
  );
}
