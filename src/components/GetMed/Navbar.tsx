"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8fffe]/88 backdrop-blur-[16px] border-b border-[#e2efed]">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          <li>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#why-choose"
              className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
            >
              Why GetMed
            </a>
          </li>
          <li>
            <Link
              href="/consult"
              className="text-sm font-medium text-[#2a9d8f] hover:text-[#21867a] transition-colors no-underline"
            >
              Consult a Pharmacist
            </Link>
          </li>
          <li>
            <Button asChild size="default">
              <a href="#get-started">Get Started</a>
            </Button>
          </li>
        </ul>

        <button
          className="md:hidden p-2 text-[#0d1f1c] bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#e2efed] bg-[#f8fffe] px-6 py-4 flex flex-col gap-4">
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#6b8280] no-underline"
          >
            How It Works
          </a>
          <a
            href="#why-choose"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#6b8280] no-underline"
          >
            Why GetMed
          </a>
          <Link
            href="/consult"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#2a9d8f] no-underline"
          >
            Consult a Pharmacist
          </Link>
          <Button asChild size="default" className="w-fit">
            <a href="#get-started" onClick={() => setOpen(false)}>
              Get Started
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
}
