"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { adminLogoutAction } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin/dashboard",             icon: LayoutDashboard, label: "Overview"    },
  { href: "/admin/dashboard/pharmacies",  icon: Building2,       label: "Pharmacies"  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen]   = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline ${
            isActive(href)
              ? "bg-[#2a9d8f] text-white shadow-[0_2px_8px_rgba(42,157,143,0.3)]"
              : "text-[#9bbab7] hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const logo = (
    <div className="px-4 py-5 border-b border-white/10">
      <Link href="/" className="flex items-center gap-2.5 no-underline mb-3">
        <div className="w-8 h-8 rounded-[9px] bg-[#2a9d8f] flex items-center justify-center">
          <HeartPulse className="w-4 h-4 text-white" />
        </div>
        <span className="text-[1.1rem] font-extrabold tracking-tight text-white">
          Get<span className="text-[#2a9d8f]">Med</span>
        </span>
      </Link>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2a9d8f]/20 text-[#2a9d8f] text-[0.6rem] font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3" />
        Admin Portal
      </span>
    </div>
  );

  const signOut = (
    <div className="px-3 py-4 border-t border-white/10">
      <form action={adminLogoutAction}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9bbab7] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#0d1f1c] border-r border-white/10 min-h-screen sticky top-0">
        {logo}
        {nav}
        {signOut}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d1f1c] border-b border-white/10 h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
          <span className="ml-1 text-[0.6rem] text-white/40 font-bold uppercase tracking-wider">Admin</span>
        </Link>
        <button
          className="p-2 text-white bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-[#0d1f1c] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
              <span className="text-sm font-bold text-white">Admin Menu</span>
              <button
                className="p-1 bg-transparent border-none cursor-pointer text-white/50"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {nav}
            {signOut}
          </aside>
        </div>
      )}
    </>
  );
}
