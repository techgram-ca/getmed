"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, HeartPulse, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLoginAction } from "@/app/admin/login/actions";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, { error: null });

  return (
    <div className="min-h-screen bg-[#0d1f1c] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline mb-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#2a9d8f] flex items-center justify-center shadow-[0_4px_16px_rgba(42,157,143,0.4)]">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1.3rem] font-extrabold tracking-tight text-white">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-[0.65rem] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Admin Portal
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <h1 className="text-[1.3rem] font-extrabold text-white tracking-tight mb-1">
            Admin Sign In
          </h1>
          <p className="text-sm text-white/50 mb-7">
            Restricted access — authorized personnel only
          </p>

          {state.error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{state.error}</p>
            </div>
          )}

          <form action={action} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@getmed.ca"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 focus:border-[#2a9d8f]/50 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 focus:border-[#2a9d8f]/50 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full py-3 text-sm font-bold"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In to Admin"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Not an admin?{" "}
          <Link href="/pharmacy/login" className="text-[#2a9d8f] hover:underline no-underline">
            Pharmacy portal
          </Link>
        </p>
      </div>
    </div>
  );
}
