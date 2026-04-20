import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import { updateRadiusAction } from "./actions";

export const metadata: Metadata = { title: "Settings — GetMed Admin" };

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 50];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const admin = createAdminClient();
  const { data: setting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "search_radius_km")
    .single();

  const currentRadius = parseInt(setting?.value ?? "10", 10);
  const { flash } = await searchParams;

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[640px]">
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
              Platform Settings
            </h1>
            <p className="text-sm text-[#6b8280] mt-1">
              Configure global settings for the GetMed platform.
            </p>
          </div>

          {flash === "saved" && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">Settings saved successfully.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2a9d8f]" />
              <h2 className="text-sm font-bold text-[#0d1f1c]">Search Radius</h2>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-[#6b8280] mb-5 leading-relaxed">
                Controls how far from a patient&apos;s entered address the platform searches for approved pharmacies.
                A larger radius shows more results but may include pharmacies that are too far for practical delivery.
              </p>

              <form action={updateRadiusAction}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide mb-3">
                    Search Radius
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {RADIUS_OPTIONS.map((km) => (
                      <label
                        key={km}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-bold ${
                          currentRadius === km
                            ? "border-[#2a9d8f] bg-[#f0fbf9] text-[#2a9d8f]"
                            : "border-[#e2efed] text-[#6b8280] hover:border-[#2a9d8f]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="radius"
                          value={km}
                          defaultChecked={currentRadius === km}
                          className="sr-only"
                        />
                        {km}
                        <span className="text-[0.6rem] font-normal mt-0.5">km</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors"
                >
                  Save Settings
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
