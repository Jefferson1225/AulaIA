"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAssessmentId, parseAssessmentInput, parseQuestionInput } from "../../../../application/assessments";
import { requireContentAdmin } from "../../../../infrastructure/supabase/admin-access";
import { saveAssessment,saveAssessmentQuestion,deleteAssessmentQuestion,setAssessmentPublished,deleteAssessment } from "../../../../infrastructure/supabase/admin-assessment-repository";

const value = (form: FormData,key: string) => String(form.get(key) ?? "");
const path = (id: string) => `/admin/evaluaciones/${id}`;
function failurePath(form: FormData) {
  try { return path(parseAssessmentId(form.get("assessmentId"))); } catch { return "/admin/evaluaciones"; }
}
async function mutate(form: FormData, work: (client: Awaited<ReturnType<typeof requireContentAdmin>>) => Promise<string>): Promise<void> {
  const client = await requireContentAdmin();
  let destination: string;
  try { destination = await work(client); } catch { redirect(`${failurePath(form)}?estado=error`); }
  revalidatePath("/admin/evaluaciones");
  revalidatePath("/admin/evaluaciones/[evaluacion]", "page");
  revalidatePath("/cursos/[curso]", "page");
  revalidatePath("/cursos/[curso]/evaluaciones/[evaluacion]", "page");
  redirect(`${destination}?estado=guardado`);
}
export async function saveAssessmentAction(form: FormData): Promise<void> {
  await mutate(form, async (client) => {
    const input = parseAssessmentInput({ id: value(form,"assessmentId") || undefined, courseSlug: value(form,"courseSlug"), title: value(form,"title"), description: value(form,"description"), passingScore: value(form,"passingScore") });
    return path(parseAssessmentId(await saveAssessment(client,input)));
  });
}
export async function saveQuestionAction(form: FormData): Promise<void> {
  await mutate(form, async (client) => {
    const input = parseQuestionInput({ id: value(form,"questionId") || undefined, assessmentId: value(form,"assessmentId"), prompt: value(form,"prompt"), options: [0,1,2,3].map((index)=>value(form,`option${index}`)), correctOption: value(form,"correctOption"), position: value(form,"position") });
    await saveAssessmentQuestion(client,input);
    return path(input.assessmentId);
  });
}
export async function deleteQuestionAction(form: FormData): Promise<void> {
  await mutate(form, async (client) => {
    if (form.get("confirm")!=="on") throw new Error("Confirma la eliminación.");
    const id = parseAssessmentId(form.get("assessmentId"));
    await deleteAssessmentQuestion(client,id,parseAssessmentId(form.get("questionId")));
    return path(id);
  });
}
export async function publishAssessmentAction(form: FormData): Promise<void> {
  await mutate(form, async (client) => {
    const id = parseAssessmentId(form.get("assessmentId"));
    const state = form.get("published");
    if (state!=="true" && state!=="false") throw new Error("Estado inválido.");
    await setAssessmentPublished(client,id,state==="true");
    return path(id);
  });
}
export async function deleteAssessmentAction(form: FormData): Promise<void> {
  await mutate(form, async (client) => {
    if (form.get("confirm")!=="on") throw new Error("Confirma la eliminación.");
    await deleteAssessment(client,parseAssessmentId(form.get("assessmentId")));
    return "/admin/evaluaciones";
  });
}
