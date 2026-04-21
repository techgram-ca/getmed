import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DriverSignupForm from "@/components/Driver/auth/SignupForm";

export const metadata: Metadata = {
  title: "Apply to Drive — GetMed",
  description: "Apply to join the GetMed driver network and deliver medications in your city.",
};

export default async function DriverSignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/driver/dashboard");

  return <DriverSignupForm />;
}
