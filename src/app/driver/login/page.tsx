import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DriverLoginForm from "@/components/Driver/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — GetMed Driver Portal",
  description: "Sign in to your GetMed driver account.",
};

export default async function DriverLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/driver/dashboard");

  return <DriverLoginForm />;
}
