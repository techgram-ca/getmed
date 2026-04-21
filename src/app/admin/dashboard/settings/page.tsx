import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, MessageSquare, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import AdminPasswordChangeForm from "@/components/Admin/dashboard/AdminPasswordChangeForm";
import SmsTemplateEditor from "@/components/Admin/dashboard/SmsTemplateEditor";
import { updateRadiusAction, toggleSmsAction } from "./actions";
import { SMS_TEMPLATES } from "@/lib/twilio";

export const metadata: Metadata = { title: "Settings — GetMed Admin" };

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 50];

const TEMPLATE_GROUPS = [
  {
    title: "Orders",
    keys: ["order_patient", "order_pharmacy", "status_processing", "status_ready_delivery", "status_ready_pickup", "status_completed", "status_cancelled"],
  },
  {
    title: "Pharmacy Management",
    keys: ["pharmacy_signup", "pharmacy_signup_admin", "pharmacy_approved", "pharmacy_rejected"],
  },
  {
    title: "Driver Management",
    keys: ["driver_signup", "driver_signup_admin", "driver_approved", "driver_rejected", "driver_suspended", "driver_reactivated"],
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const admin = createAdminClient();

  // Load all settings in one query
  const { data: allSettings } = await admin
    .from("app_settings")
    .select("key, value");

  const settingsMap: Record<string, string> = {};
  (allSettings ?? []).forEach((s) => { settingsMap[s.key] = s.value; });

  const currentRadius  = parseInt(settingsMap["search_radius_km"] ?? "10", 10);
  const smsDbEnabled   = settingsMap["sms_enabled"] === "true";
  const smsEnvEnabled  = process.env.ENABLE_SMS === "true";

  const { flash } = await searchParams;

  // Build template overrides map
  const templateOverrides: Record<string, string> = {};
  Object.keys(settingsMap).forEach((key) => {
    if (key.startsWith("sms_tpl_")) {
      templateOverrides[key.replace("sms_tpl_", "")] = settingsMap[key];
    }
  });

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[860px]">
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Platform Settings</h1>
            <p className="text-sm text-[#6b8280] mt-1">Configure global settings for the GetMed platform.</p>
          </div>

          {flash === "saved" && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">Settings saved successfully.</p>
            </div>
          )}

          {/* SMS Settings */}
          <div id="sms" className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2a9d8f]" />
              <h2 className="text-sm font-bold text-[#0d1f1c]">SMS Notifications</h2>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Master switch status */}
              <div className={`flex items-start gap-3 rounded-xl border p-4 ${smsEnvEnabled ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${smsEnvEnabled ? "bg-emerald-500" : "bg-red-400"}`} />
                <div>
                  <p className="text-sm font-semibold text-[#0d1f1c]">
                    Master switch (ENABLE_SMS env var): {smsEnvEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-xs text-[#6b8280] mt-0.5">
                    {smsEnvEnabled
                      ? "The ENABLE_SMS=true environment variable is set. The admin toggle below also controls whether messages are sent."
                      : "ENABLE_SMS is not set to \"true\" in the environment. No messages will be sent regardless of the toggle below."}
                  </p>
                </div>
              </div>

              {/* Admin toggle */}
              <form action={toggleSmsAction}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0d1f1c]">Admin toggle</p>
                    <p className="text-xs text-[#6b8280] mt-0.5">
                      Both this toggle and the env var must be enabled for messages to send.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold ${smsDbEnabled ? "text-emerald-600" : "text-[#6b8280]"}`}>
                      {smsDbEnabled ? "On" : "Off"}
                    </span>
                    <button
                      type="submit"
                      name="sms_enabled"
                      value={smsDbEnabled ? "false" : "true"}
                      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none ${smsDbEnabled ? "bg-[#2a9d8f]" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${smsDbEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Template editor */}
            <div className="border-t border-[#e2efed] px-6 py-6 space-y-8">
              <div>
                <p className="text-sm font-bold text-[#0d1f1c] mb-1">Message Templates</p>
                <p className="text-xs text-[#6b8280]">
                  Customize the text sent for each event. Use <code className="bg-[#f0fbf9] px-1 rounded text-[#2a9d8f]">{"{{varName}}"}</code> placeholders — available variables are listed under each template. Changes are saved instantly.
                </p>
              </div>

              {TEMPLATE_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6b8280] mb-4">{group.title}</p>
                  <div className="space-y-5">
                    {group.keys.map((key) => {
                      const tpl = SMS_TEMPLATES[key];
                      if (!tpl) return null;
                      const override = templateOverrides[key];
                      return (
                        <SmsTemplateEditor
                          key={key}
                          templateKey={key}
                          label={tpl.label}
                          vars={tpl.vars}
                          defaultBody={tpl.body}
                          currentBody={override ?? tpl.body}
                          isCustomized={!!override}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search radius */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2a9d8f]" />
              <h2 className="text-sm font-bold text-[#0d1f1c]">Search Radius</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-[#6b8280] mb-5 leading-relaxed">
                Controls how far from a patient&apos;s entered address the platform searches for approved pharmacies.
              </p>
              <form action={updateRadiusAction}>
                <div className="mb-5">
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
                        <input type="radio" name="radius" value={km} defaultChecked={currentRadius === km} className="sr-only" />
                        {km}
                        <span className="text-[0.6rem] font-normal mt-0.5">km</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors">
                  Save Radius
                </button>
              </form>
            </div>
          </div>

          {/* Password change */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2a9d8f]" />
              <h2 className="text-sm font-bold text-[#0d1f1c]">Change Password</h2>
            </div>
            <div className="px-6 py-6">
              <AdminPasswordChangeForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
