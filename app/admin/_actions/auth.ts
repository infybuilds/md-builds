"use server";

import { redirect } from "next/navigation";

import {
  parse,
  text,
  type FormState,
} from "@/lib/actions/form-state";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/schemas";

/** Same copy for every failure, so the form never reveals which emails exist. */
const GENERIC_FAILURE = "Invalid email or password.";

/** Only same-origin admin paths, so `?next=` can't become an open redirect. */
function safeRedirectTarget(value: string): string {
  return /^\/admin(\/[\w\-/[\]]*)?$/.test(value) && !value.startsWith("/admin/login")
    ? value
    : "/admin";
}

export async function signIn(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parse(credentialsSchema, {
    email: text(formData, "email"),
    password: text(formData, "password"),
  });

  if (!parsed.success) return parsed.state;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { message: GENERIC_FAILURE };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    // Valid credentials but no admin rights: drop the session immediately rather
    // than leaving a half-useful one around, and say nothing specific.
    await supabase.auth.signOut();
    return { message: GENERIC_FAILURE };
  }

  // Outside the checks above: redirect() signals by throwing, so it must not sit
  // inside a try/catch that swallows it.
  redirect(safeRedirectTarget(text(formData, "next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
