import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
