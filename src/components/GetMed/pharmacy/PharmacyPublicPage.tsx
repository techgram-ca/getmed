"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Award,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  Menu,
  Phone,
  Quote,
  ShoppingBag,
  Stethoscope,
  Truck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TransferForm from "./forms/TransferForm";
import PrescriptionForm from "./forms/PrescriptionForm";

interface Pharmacy {
  id: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
}

interface Props {
  pharmacy: Pharmacy;
  slug: string;
}

// Static placeholder — will be dynamic (from DB) later
const QUOTE = "Your health, our priority — trusted care for every family.";

// Static placeholder — will be dynamic (from DB) later
const TRUST_STATS = [
  { icon: Clock, value: "15+",     label: "Years serving the community" },
  { icon: Users, value: "15,000+", label: "Patients served" },
  { icon: Award, value: "#1",      label: "Rated pharmacy in the city" },
] as const;

export default function PharmacyPublicPage({ pharmacy, slug }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const services = [
    pharmacy.service_online_orders && { label: "Online Orders",             icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50"   },
    pharmacy.service_delivery      && { label: "Home Delivery",             icon: Truck,       color: "text-purple-600", bg: "bg-purple-50" },
    pharmacy.service_consultation  && { label: "Pharmacist Consultation",   icon: Stethoscope, color: "text-teal-600",   bg: "bg-teal-50"   },
  ].filter(Boolean) as Array<{ label: string; icon: React.ElementType; color: string; bg: string }>;

  return (
    <div className="min-h-screen bg-[#f8fffe]">

      {/* ── 1. Global GetMed Navbar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#f8fffe]/90 backdrop-blur-[16px] border-b border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <a href="/#how-it-works" className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline">
                How It Works
              </a>
            </li>
            <li>
              <a href="/#why-choose" className="text-sm font-medium text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline">
                Why GetMed
              </a>
            </li>
            <li>
              <Link href="/consult" className="text-sm font-medium text-[#2a9d8f] hover:text-[#21867a] transition-colors no-underline">
                Consult a Pharmacist
              </Link>
            </li>
            <li>
              <Button asChild size="default">
                <Link href="/search">Get Started</Link>
              </Button>
            </li>
          </ul>

          <button
            className="md:hidden p-2 text-[#0d1f1c] bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#e2efed] bg-[#f8fffe] px-6 py-4 flex flex-col gap-4">
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[#6b8280] no-underline">
              How It Works
            </a>
            <a href="/#why-choose" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[#6b8280] no-underline">
              Why GetMed
            </a>
            <Link href="/consult" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[#2a9d8f] no-underline">
              Consult a Pharmacist
            </Link>
            <Button asChild size="default" className="w-fit">
              <Link href="/search" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* ── 2. Pharmacy Sub-Header ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#e2efed] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Pharmacy logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
              {pharmacy.logo_url ? (
                <img src={pharmacy.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-extrabold text-[#2a9d8f]">
                  {pharmacy.display_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm font-extrabold text-[#0d1f1c] truncate">{pharmacy.display_name}</span>
          </div>

          {/* Phone — social icons will replace this when available (dynamic later) */}
          <a
            href={`tel:${pharmacy.phone}`}
            className="flex items-center gap-2 text-sm font-semibold text-[#2a9d8f] hover:text-[#21867a] transition-colors no-underline shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">{pharmacy.phone}</span>
          </a>
        </div>
      </div>

      {/* ── 3. Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[480px] md:min-h-[580px] flex items-end">
        {/* Background — pharmacy hero image (dynamic later) */}
        <div className="absolute inset-0">
          <img
            src="/images/hero.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1c]/88 via-[#0d1f1c]/45 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pb-16 pt-32">
          <p className="text-[#a8e6df] text-xs font-bold uppercase tracking-widest mb-3">
            Your trusted pharmacy
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            {pharmacy.display_name}
          </h1>
          {/* Tagline — dynamic later */}
          <p className="text-white/80 text-lg md:text-xl font-medium mb-8 max-w-xl">
            Personalized care for you and your family, right in your neighbourhood.
          </p>

          {/* Quote — dynamic later */}
          <blockquote className="flex items-start gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 max-w-lg">
            <Quote className="w-5 h-5 text-[#2a9d8f] shrink-0 mt-0.5" />
            <p className="text-white/90 text-sm italic leading-relaxed">{QUOTE}</p>
          </blockquote>
        </div>
      </section>

      {/* ── 4. Pharmacy Overview Section ────────────────────────────── */}
      <section className="bg-white border-b border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left: About + Services + Address */}
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">About Us</p>
                <h2 className="text-2xl font-extrabold text-[#0d1f1c] mb-3">
                  Caring for {pharmacy.city} since day one
                </h2>
                {/* Description — dynamic later */}
                <p className="text-[#6b8280] leading-relaxed">
                  We are a trusted community pharmacy committed to providing personalized,
                  compassionate care to every patient who walks through our doors. Our team
                  is dedicated to your health and wellbeing — from filling prescriptions
                  quickly and accurately, to offering expert consultations and advice.
                </p>
              </div>

              {services.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6b8280] mb-3">Our Services</p>
                  <div className="flex flex-wrap gap-2.5">
                    {services.map(({ label, icon: Icon, color, bg }) => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${bg} ${color} px-3.5 py-2 rounded-xl`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-[#f8fffe] rounded-2xl border border-[#e2efed]">
                <MapPin className="w-5 h-5 text-[#2a9d8f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#0d1f1c]">{pharmacy.display_name}</p>
                  <p className="text-sm text-[#6b8280] mt-0.5">{pharmacy.full_address}</p>
                  <p className="text-sm text-[#6b8280]">{pharmacy.city}, {pharmacy.province}</p>
                </div>
              </div>
            </div>

            {/* Right: Trust stats — dynamic later */}
            <div className="grid grid-cols-1 gap-5">
              {TRUST_STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-5 bg-[#f8fffe] rounded-2xl border border-[#e2efed] p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#2a9d8f]" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#0d1f1c]">{value}</p>
                    <p className="text-sm text-[#6b8280] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Action Cards ─────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">Quick Actions</p>
            <h2 className="text-3xl font-extrabold text-[#0d1f1c]">How can we help you today?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1 — Transfer Prescription */}
            <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-6 flex flex-col gap-5 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-[#2a9d8f]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[#0d1f1c] mb-2">Transfer Prescription</h3>
                <p className="text-sm text-[#6b8280] leading-relaxed">
                  Move your existing prescriptions from another pharmacy quickly, easily, and at no cost.
                </p>
              </div>
              <Button asChild className="w-full" size="default">
                <a href={`/pharmacy/${slug}#transfer`}>Transfer Prescription</a>
              </Button>
            </div>

            {/* Card 2 — Order Prescription */}
            <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-6 flex flex-col gap-5 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#2a9d8f]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[#0d1f1c] mb-2">Order Prescription</h3>
                <p className="text-sm text-[#6b8280] leading-relaxed">
                  Refill your medications online for convenient pickup or home delivery right to your door.
                </p>
              </div>
              <Button asChild className="w-full" size="default">
                <a href={`/pharmacy/${slug}#prescription`}>Order Prescription</a>
              </Button>
            </div>

            {/* Card 3 — Consult a Pharmacist */}
            <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-6 flex flex-col gap-5 hover:shadow-md hover:border-[#2a9d8f]/30 transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-[#2a9d8f]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[#0d1f1c] mb-2">Consult a Pharmacist</h3>
                <p className="text-sm text-[#6b8280] leading-relaxed">
                  Get professional pharmacist advice from the comfort of your home via video or phone.
                </p>
              </div>
              <Button asChild className="w-full" size="default">
                <Link href={`/consult/${slug}`}>Book Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Transfer Form Section ────────────────────────────────── */}
      <section id="transfer" className="bg-white border-t border-[#e2efed] py-16 scroll-mt-32">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-5 h-5 text-[#2a9d8f]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0d1f1c]">Transfer a Prescription</h2>
            </div>
            <p className="text-[#6b8280]">
              Fill out the form below and we will handle the rest — no hassle, no extra cost.
            </p>
          </div>
          <TransferForm
            pharmacyId={pharmacy.id}
            defaultAddress={null}
            hasDelivery={pharmacy.service_delivery}
          />
        </div>
      </section>

      {/* ── 7. Order Prescription Section ───────────────────────────── */}
      <section id="prescription" className="border-t border-[#e2efed] py-16 bg-[#f8fffe] scroll-mt-32">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#2a9d8f]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0d1f1c]">Order a Prescription</h2>
            </div>
            <p className="text-[#6b8280]">
              Submit your prescription details below and choose pickup or delivery at checkout.
            </p>
          </div>
          <PrescriptionForm
            pharmacyId={pharmacy.id}
            defaultAddress={null}
            hasDelivery={pharmacy.service_delivery}
          />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e2efed] bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6b8280]">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-[#0d1f1c]">Get<span className="text-[#2a9d8f]">Med</span></span>
          </Link>
          <p>© {new Date().getFullYear()} GetMed. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Terms</Link>
            <Link href="/support" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
