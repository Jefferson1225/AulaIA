# Supabase

La migración `migrations/20260929000000_profiles.sql` crea perfiles, políticas RLS y el cupo diario del Tutor IA. Aplícala con Supabase CLI o desde el editor SQL del proyecto antes de probar el registro.

Al registrarse un usuario, un trigger crea su perfil con rol `student`, sin aceptar el rol enviado por el navegador. Las políticas permiten leer el perfil propio y editar solo `full_name`. El contador del Tutor IA se actualiza mediante `claim_tutor_request()` y limita a 30 preguntas por usuario y día UTC.

Para comprobar la instalación, crea una cuenta desde `/registro`, confirma el correo si el proyecto lo exige, entra por `/login` y comprueba que el perfil aparece en `public.profiles`. Después verifica que un usuario no puede consultar otro perfil ni cambiar su rol con la clave pública.

La migración `migrations/20261006000000_catalog.sql` crea categorías y cursos. La migración `migrations/20261010000000_course_content.sql` agrega módulos, lecciones y políticas de administración; aplícalas en ese orden una sola vez. Para habilitar el panel `/admin/cursos`, crea primero la cuenta en la aplicación y verifica su UUID en Authentication. Luego, desde el editor SQL con permisos de propietario, ejecuta `update public.profiles set role = 'admin' where id = '<UUID_VERIFICADO>';` reemplazando el marcador por ese UUID. La sesión de esa cuenta podrá administrar contenido. Las cuentas nuevas continúan siendo estudiantes.

La migración `migrations/20261021000000_enrollments_progress.sql` agrega `enrollments` y `lesson_completions`. Cada usuario solo puede leer sus matrículas y su avance, matricularse en cursos publicados y completar sus lecciones después de matricularse. Puede desmarcar sus propios completados. No se otorga acceso anónimo ni permiso para reasignar matrículas o editar un porcentaje. Se conservan los permisos existentes de cursos y perfiles.

Para validar el recorrido, entra con una cuenta de estudiante, abre un curso publicado desde el catálogo y pulsa “Matricularme en este curso”. Abre una lección, márcala como completada y regresa a `/inicio`: deben aparecer el curso y el porcentaje real. Desmarca la lección y comprueba que el avance se actualice. Repite con otra cuenta para verificar que empieza sin las matrículas del primer usuario. Estas funciones usan la sesión y la clave publicable; no necesitan una clave `service_role` ni DeepSeek.

`tests/learning_rls.sql` se ejecuta únicamente en una base de pruebas, después de aplicar las migraciones. Usa usuarios ficticios, cambia de rol para comprobar RLS y revierte sus datos con `ROLLBACK`. No sustituye la prueba completa de autenticación contra Supabase.
