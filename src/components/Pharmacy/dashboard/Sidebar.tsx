"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PackageCheck,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/pharmacy/dashboard/actions";

const NAV = [
  { href: "/pharmacy/dashboard",              icon: LayoutDashboard, label: "Overview"      },
  { href: "/pharmacy/dashboard/orders",       icon: PackageCheck,    label: "Orders"        },
  { href: "/pharmacy/dashboard/patients",     icon: Users,           label: "Patients"      },
  { href: "/pharmacy/dashboard/messages",     icon: MessageSquare,   label: "Messages"      },
  { href: "/pharmacy/dashboard/consultations",icon: Stethoscope,     label: "Consultations" },
  { href: "/pharmacy/dashboard/settings",     icon: Settings,        label: "Settings"      },
];

interface Props {
  pharmacyName: string;
  status: string;
}

export default function Sidebar({ pharmacyName, status }: Props) {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline ${
              active
                ? "bg-[#2a9d8f] text-white shadow-[0_2px_8px_rgba(42,157,143,0.3)]"
                : "text-[#6b8280] hover:bg-[#e0f5f2] hover:text-[#0d1f1c]"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const logo = (
    <div className="px-4 py-5 border-b border-[#e2efed]">
      <Link href="/" className="flex items-center gap-2.5 no-underline mb-3">
        <div className="w-8 h-8 rounded-[9px] bg-[#2a9d8f] flex items-center justify-center">
          <HeartPulse className="w-4 h-4 text-white" />
        </div>
        <span className="text-[1.1rem] font-extrabold tracking-tight text-[#0d1f1c]">
          Get<span className="text-[#2a9d8f]">Med</span>
        </span>
      </Link>
      <div className="bg-[#f0faf8] rounded-xl px-3 py-2.5">
        <p className="text-[0.75rem] font-bold text-[#0d1f1c] truncate">{pharmacyName}</p>
        <span
          className={`inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider mt-0.5 ${
            status === "approved"
              ? "text-emerald-600"
              : status === "suspended"
              ? "text-red-500"
              : status === "rejected"
              ? "text-red-500"
              : "text-amber-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === "approved"
                ? "bg-emerald-500"
                : status === "suspended" || status === "rejected"
                ? "bg-red-500"
                : "bg-amber-500 animate-pulse"
            }`}
          />
          {status === "approved" ? "Active" : status === "suspended" ? "Suspended" : status === "rejected" ? "Rejected" : "Pending Approval"}
        </span>
      </div>
    </div>
  );

  const signOut = (
    <div className="px-3 py-4 border-t border-[#e2efed]">
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b8280] hover:bg-red-50 hover:text-red-600 transition-colors"
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
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-[#e2efed] min-h-screen sticky top-0">
        {logo}
        {nav}
        {signOut}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#e2efed] h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>
        <button
          className="p-2 text-[#0d1f1c] bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#e2efed]">
              <span className="text-sm font-bold text-[#0d1f1c]">Menu</span>
              <button
                className="p-1 bg-transparent border-none cursor-pointer text-[#6b8280]"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-[#e2efed]">
              <p className="text-[0.75rem] font-bold text-[#0d1f1c] truncate">{pharmacyName}</p>
            </div>
            {nav}
            {signOut}
          </aside>
        </div>
      )}
    </>
  );
}
