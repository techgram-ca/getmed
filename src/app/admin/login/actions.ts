"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function adminLoginAction(
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
    return { error: "Invalid email or password." };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Access denied. This portal is for administrators only." };
  }

  redirect("/admin/dashboard");
}

export async function adminLogoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
