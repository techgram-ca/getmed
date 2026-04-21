"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function driverLoginAction(
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

  const { data: { user } } = await supabase.auth.getUser();
  const { data: driver } = await supabase
    .from("drivers")
    .select("status, rejection_reason")
    .eq("user_id", user!.id)
    .single();

  if (!driver) {
    await supabase.auth.signOut();
    return { error: "No driver account found for this email." };
  }

  if (driver.status !== "approved") {
    await supabase.auth.signOut();

    if (driver.status === "rejected") {
      const reason = driver.rejection_reason
        ? ` Reason: ${driver.rejection_reason}`
        : " Please contact support for more information.";
      return { error: `Your application was not approved.${reason}` };
    }

    if (driver.status === "suspended") {
      return { error: "Your account has been suspended. Please contact GetMed support." };
    }

    return {
      error: "Your application is still under review. You'll receive an email once approved — typically within 24 hours.",
    };
  }

  redirect("/driver/dashboard");
}
