"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, Clock, User } from "lucide-react";

const LINKS = [
  { href: "/driver/dashboard",         icon: Truck,  label: "Active"   },
  { href: "/driver/dashboard/history", icon: Clock,  label: "History"  },
  { href: "/driver/dashboard/account", icon: User,   label: "Account"  },
];

export default function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2efed] safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {LINKS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 no-underline transition-colors ${
                active ? "text-[#2a9d8f]" : "text-[#9bb3b0]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[0.6rem] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
