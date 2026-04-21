import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PharmacyRootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/pharmacy/dashboard");
  }

  redirect("/pharmacy/get-started");
}
