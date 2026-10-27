import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../infrastructure/supabase/server";

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/inicio", base));
  }
  return NextResponse.redirect(new URL("/login?estado=confirmacion_fallida", base));
}
