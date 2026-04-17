import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#e2efed] bg-[#f0faf8] py-10 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>

        <ul className="flex gap-6 list-none">
          {["Privacy", "Terms", "Support"].map((label) => (
            <li key={label}>
              <a
                href="#"
                className="text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-[#6b8280] flex items-center gap-1">
          Made with <span className="text-[#2a9d8f]">♥</span> by GetMed &copy; 2026
        </p>
      </div>
    </footer>
  );
}
