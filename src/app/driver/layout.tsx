import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import DriverBottomNav from "@/components/Driver/dashboard/DriverBottomNav";

export const metadata: Metadata = {
  title: "GetMed Driver",
  description: "GetMed delivery driver app",
  manifest: "/driver-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GetMed Driver",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a9d8f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0faf8]">
      {children}
      <DriverBottomNav />
    </div>
  );
}
