"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, HeartPulse, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/pharmacy/login/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: null });

  return (
    <div className="min-h-screen bg-[#f0faf8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-[#2a9d8f] flex items-center justify-center shadow-[0_4px_12px_rgba(42,157,143,0.3)]">
              <HeartPulse className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-[1.3rem] font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-[0.6rem] font-bold uppercase tracking-wider">
            Pharmacy Portal
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-[1.4rem] font-extrabold text-[#0d1f1c] tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[#6b8280] mb-7">
            Sign in to your pharmacy dashboard
          </p>

          {state.error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <form action={action} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@pharmacy.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2efed] bg-[#f8fffe] text-sm text-[#0d1f1c] placeholder:text-[#a0b5b2] focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/40 focus:border-[#2a9d8f] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-[#2a9d8f] hover:underline no-underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2efed] bg-[#f8fffe] text-sm text-[#0d1f1c] placeholder:text-[#a0b5b2] focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/40 focus:border-[#2a9d8f] transition"
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
                "Sign In to Dashboard"
              )}
            </Button>
          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-sm text-[#6b8280] mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/pharmacy/signup"
            className="text-[#2a9d8f] font-semibold hover:underline no-underline"
          >
            Create one free
          </Link>
        </p>
        <p className="text-center text-xs text-[#a0b5b2] mt-2">
          Looking for prescriptions?{" "}
          <Link href="/" className="text-[#2a9d8f] hover:underline no-underline">
            Go to GetMed
          </Link>
        </p>
      </div>
    </div>
  );
}
