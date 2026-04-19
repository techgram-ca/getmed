"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(
  _prev: { error: string | null },
  fd: FormData
): Promise<{ error: string | null }> {
  const email    = (fd.get("email")    as string).trim();
  const password =  fd.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { error: "Invalid email or password. Please try again." };
  }

  // Fetch the pharmacy row to check approval status
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("status, rejection_reason")
    .eq("user_id", user!.id)
    .single();

  if (!pharmacy) {
    await supabase.auth.signOut();
    return { error: "No pharmacy account found for this email." };
  }

  if (pharmacy.status !== "approved") {
    await supabase.auth.signOut();

    if (pharmacy.status === "rejected") {
      const reason = pharmacy.rejection_reason
        ? ` Reason: ${pharmacy.rejection_reason}`
        : " Please contact support for more information.";
      return { error: `Your application was not approved.${reason}` };
    }

    if (pharmacy.status === "suspended") {
      return { error: "Your account has been suspended. Please contact GetMed support." };
    }

    // pending
    return {
      error:
        "Your application is still under review. You'll receive an email once your account is approved — typically within 24 hours.",
    };
  }

  redirect("/pharmacy/dashboard");
}
