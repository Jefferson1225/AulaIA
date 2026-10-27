# Supabase

La migración `migrations/20260929000000_profiles.sql` crea perfiles, políticas RLS y el cupo diario del Tutor IA. Aplícala con Supabase CLI o desde el editor SQL del proyecto antes de probar el registro.

Al registrarse un usuario, un trigger crea su perfil con rol `student`, sin aceptar el rol enviado por el navegador. Las políticas permiten leer el perfil propio y editar solo `full_name`. El contador del Tutor IA se actualiza mediante `claim_tutor_request()` y limita a 30 preguntas por usuario y día UTC.

Para comprobar la instalación, crea una cuenta desde `/registro`, confirma el correo si el proyecto lo exige, entra por `/login` y comprueba que el perfil aparece en `public.profiles`. Después verifica que un usuario no puede consultar otro perfil ni cambiar su rol con la clave pública.

La migración `migrations/20261006000000_catalog.sql` crea categorías y cursos. La migración `migrations/20261010000000_course_content.sql` agrega módulos, lecciones y políticas de administración; aplícalas en ese orden una sola vez. Para habilitar el panel `/admin/cursos`, crea primero la cuenta en la aplicación y verifica su UUID en Authentication. Luego, desde el editor SQL con permisos de propietario, ejecuta `update public.profiles set role = 'admin' where id = '<UUID_VERIFICADO>';` reemplazando el marcador por ese UUID. La sesión de esa cuenta podrá administrar contenido. Las cuentas nuevas continúan siendo estudiantes.

La migración `migrations/20261021000000_enrollments_progress.sql` agrega `enrollments` y `lesson_completions`. Cada usuario solo puede leer sus matrículas y su avance, matricularse en cursos publicados y completar sus lecciones después de matricularse. Puede desmarcar sus propios completados. No se otorga acceso anónimo ni permiso para reasignar matrículas o editar un porcentaje. Se conservan los permisos existentes de cursos y perfiles.

Para validar el recorrido, entra con una cuenta de estudiante, abre un curso publicado desde el catálogo y pulsa “Matricularme en este curso”. Abre una lección, márcala como completada y regresa a `/inicio`: deben aparecer el curso y el porcentaje real. Desmarca la lección y comprueba que el avance se actualice. Repite con otra cuenta para verificar que empieza sin las matrículas del primer usuario. Estas funciones usan la sesión y la clave publicable; no necesitan una clave `service_role` ni DeepSeek.

`tests/learning_rls.sql` se ejecuta únicamente en una base de pruebas, después de aplicar las migraciones. Usa usuarios ficticios, cambia de rol para comprobar RLS y revierte sus datos con `ROLLBACK`. No sustituye la prueba completa de autenticación contra Supabase.

La migración `migrations/20261026000000_assessments.sql` agrega evaluaciones, preguntas e intentos. Debe aplicarse después de la migración de matrículas. Las respuestas correctas se guardan en `aulaia_private.assessment_answer_keys`, sin permisos para `anon` ni `authenticated`. Las funciones administrativas verifican el rol `admin`; solo permiten editar borradores sin intentos. Una evaluación con historial puede despublicarse, pero sus preguntas y el mínimo aprobatorio quedan protegidos. La base también impide eliminar cursos o evaluaciones que tengan resultados asociados.

`submit_assessment()` obtiene el usuario de `auth.uid()`, comprueba matrícula, publicación y versión, valida una respuesta por pregunta y calcula la nota sobre 20. El cliente no envía notas ni un usuario que pueda sustituir al autenticado. La combinación de usuario e identificador de envío evita duplicar intentos. Cada intento conserva la nota, el mínimo y una instantánea de sus preguntas y respuestas; no expone las claves correctas de las preguntas falladas.

Para comprobarlo, matricúlate en el curso de Python, abre la evaluación desde su detalle y responde sus tres preguntas. Revisa la nota y el menú `/resultados`. Con una segunda cuenta comprueba que no aparezcan esos intentos. Con la cuenta administradora usa `/admin/evaluaciones` para crear un borrador, añadir preguntas y publicarlo. Si ya existen intentos, crea una nueva evaluación para cambiar su contenido.

`tests/assessments_rls.sql` valida las funciones y políticas en una base de pruebas con las migraciones aplicadas. Incluye calificaciones de 0, 13.33 y 20, versiones antiguas, duplicados, acceso ajeno y bloqueo de edición. Sus datos se revierten al finalizar.
