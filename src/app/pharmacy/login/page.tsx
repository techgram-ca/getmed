import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/Pharmacy/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — GetMed Pharmacy Portal",
  description: "Sign in to manage your pharmacy on GetMed.",
};

export default async function PharmacyLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/pharmacy/dashboard");
  }

  return <LoginForm />;
}
