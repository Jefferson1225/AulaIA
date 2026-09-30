import { NextResponse, type NextRequest } from "next/server";
import { prepareTutorQuestion } from "../../../application/tutor";
import { demoCourseRepository } from "../../../infrastructure/demo/course-repository";
import { askDeepSeek } from "../../../infrastructure/deepseek/tutor";
import { getSupabaseConfig } from "../../../infrastructure/supabase/config";
import { createSupabaseServerClient } from "../../../infrastructure/supabase/server";

export async function POST(request: NextRequest) {
  if (!getSupabaseConfig()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Inicia sesión para usar el Tutor IA." }, { status: 401 });
  if (!process.env.DEEPSEEK_API_KEY) return NextResponse.json({ error: "El Tutor IA aún no está configurado." }, { status: 503 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });

  try {
    const raw = await request.text();
    if (raw.length > 2000) return NextResponse.json({ error: "Solicitud demasiado larga." }, { status: 413 });
    const payload: unknown = JSON.parse(raw);
    const body = payload as { courseSlug?: unknown; lessonSlug?: unknown; question?: unknown };
    if (typeof body?.courseSlug !== "string" || typeof body.lessonSlug !== "string" || typeof body.question !== "string") {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    const lesson = await demoCourseRepository.findLesson(body.courseSlug, body.lessonSlug);
    if (!lesson) return NextResponse.json({ error: "Lección no encontrada." }, { status: 404 });
    const course = (await demoCourseRepository.list()).find((item) => item.slug === body.courseSlug);
    const prompt = prepareTutorQuestion(lesson, body.question, course?.title ?? body.courseSlug);
    const { data: allowed, error: usageError } = await supabase.rpc("claim_tutor_request");
    if (usageError) return NextResponse.json({ error: "El Tutor IA no está listo. Revisa la migración de Supabase." }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: "Alcanzaste el límite de 30 preguntas por hoy. Vuelve mañana." }, { status: 429 });
    const answer = await askDeepSeek(prompt.system, prompt.question);
    return NextResponse.json({ answer });
  } catch (caught) {
    if (caught instanceof Error && ["Escribe una pregunta.", "Pregunta demasiado larga."].includes(caught.message)) {
      return NextResponse.json({ error: caught.message }, { status: 400 });
    }
    return NextResponse.json({ error: "No pudimos obtener una respuesta. Inténtalo de nuevo." }, { status: 502 });
  }
}
