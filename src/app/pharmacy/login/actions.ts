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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password. Please try again." };
  }

  redirect("/pharmacy/dashboard");
}
