"use server";

import { redirect } from "next/navigation";
import { validateLogin, validateRegistration } from "../../application/auth";
import { createSupabaseServerClient } from "../../infrastructure/supabase/server";

function authRedirect(code: string, registration = false): never {
  redirect(`/${registration ? "registro" : "login"}?estado=${code}`);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (validateLogin(email, password)) authRedirect("datos_invalidos");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authRedirect("credenciales_invalidas");
  redirect("/inicio");
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (validateRegistration(fullName, email, password)) authRedirect("datos_invalidos", true);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) authRedirect("registro_fallido", true);
  if (!data.session) authRedirect("confirma_correo");
  redirect("/inicio");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
