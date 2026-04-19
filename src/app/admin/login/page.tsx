import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLoginForm from "@/components/Admin/auth/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In — GetMed",
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "admin") {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
