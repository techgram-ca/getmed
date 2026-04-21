import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, HeartPulse, LogOut, MapPin, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/driver/login");
}

export default async function DriverDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/driver/login");

  const admin = createAdminClient();
  const { data: driver } = await admin
    .from("drivers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!driver) redirect("/driver/login");
  if (driver.status !== "approved") redirect("/driver/login");

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#e2efed]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="flex items-center gap-1.5 text-xs text-[#6b8280] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex items-center gap-4 mb-8">
          {driver.photo_url ? (
            <img src={driver.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#e2efed]" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#e0f5f2] flex items-center justify-center border-2 border-[#e2efed]">
              <User className="w-6 h-6 text-[#2a9d8f]" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-[#0d1f1c] tracking-tight">Welcome, {driver.full_name}</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[0.65rem] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Driver
            </span>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: MapPin, label: "Service Area", value: `${driver.city}, ${driver.province}` },
            { icon: Car, label: "Vehicle", value: [driver.vehicle_make, driver.vehicle_model, driver.vehicle_year].filter(Boolean).join(" ") || driver.vehicle_type || "—" },
            { icon: Phone, label: "Phone", value: driver.phone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#e2efed] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-[#2a9d8f]" />
                <p className="text-xs font-bold text-[#6b8280] uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-sm font-semibold text-[#0d1f1c]">{value}</p>
            </div>
          ))}
        </div>

        {/* Placeholder */}
        <div className="bg-white rounded-2xl border border-[#e2efed] p-10 shadow-sm text-center">
          <Car className="w-12 h-12 text-[#e2efed] mx-auto mb-4" />
          <p className="text-base font-bold text-[#0d1f1c]">No deliveries yet</p>
          <p className="text-sm text-[#6b8280] mt-1">
            Delivery assignments will appear here once orders are ready in your area.
          </p>
        </div>
      </main>
    </div>
  );
}
