"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartPulse, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PharmacyNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/92 backdrop-blur-[16px] border-b border-[#e2efed]">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
          <span className="hidden sm:inline-flex items-center ml-1.5 px-2.5 py-0.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-[0.6rem] font-bold uppercase tracking-wider">
            For Pharmacies
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-7 list-none">
          {[
            { href: "#opportunity", label: "Opportunity" },
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
          ].map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/pharmacy/login"
              className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
            >
              Sign In
            </Link>
          </li>
          <li>
            <Button asChild size="default">
              <Link href="/pharmacy/signup">Create Free Account</Link>
            </Button>
          </li>
        </ul>

        <button
          className="md:hidden p-2 bg-transparent border-none cursor-pointer text-[#0d1f1c]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#e2efed] bg-white px-6 py-4 flex flex-col gap-4">
          <a href="#opportunity" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6b8280] no-underline">Opportunity</a>
          <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6b8280] no-underline">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6b8280] no-underline">How It Works</a>
          <Link href="/pharmacy/login" className="text-sm font-medium text-[#6b8280] no-underline">Sign In</Link>
          <Button asChild size="default" className="w-fit">
            <Link href="/pharmacy/signup">Create Free Account</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
