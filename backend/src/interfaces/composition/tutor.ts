import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTutorService, TutorRequestError } from "../../application/tutor-service";
import { askDeepSeek } from "../../infrastructure/deepseek/tutor";
import { getPublishedCourse } from "../../infrastructure/supabase/content-repository";
import { createLearningRepository } from "../../infrastructure/supabase/learning-repository";
import { createTutorRequestStore, readTutorHistory, saveTutorFeedback } from "../../infrastructure/supabase/tutor-repository";

/** Une los puertos del negocio con sus adaptadores; los adaptadores no se llaman entre sí. */
export function createSessionTutorService(client: SupabaseClient, userId: string) {
  return createTutorService(userId, {
    context: {
      findCourse: getPublishedCourse,
      readLearning: () => createLearningRepository(client, userId).read(),
      readHistory: (scope, conversationId) => readTutorHistory(client, userId, scope.courseSlug, scope.lessonSlug, conversationId),
      async saveFeedback(id, feedback, comment) {
        try { await saveTutorFeedback(client, id, feedback, comment); }
        catch { throw new TutorRequestError(403, "No se pudo guardar la valoración de esta respuesta."); }
      },
    },
    // La clave privilegiada solo se necesita al enviar una pregunta, no al leer el historial.
    requests: {
      begin: (input, reservation) => createTutorRequestStore().begin(input, reservation),
      finish: (id, completion) => createTutorRequestStore().finish(id, completion),
    },
    provider: askDeepSeek,
  });
}
