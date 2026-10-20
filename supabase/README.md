# Supabase

La migración `migrations/20260929000000_profiles.sql` crea perfiles, políticas RLS y el cupo diario del Tutor IA. Aplícala con Supabase CLI o desde el editor SQL del proyecto antes de probar el registro.

Al registrarse un usuario, un trigger crea su perfil con rol `student`, sin aceptar el rol enviado por el navegador. Las políticas permiten leer el perfil propio y editar solo `full_name`. El contador del Tutor IA se actualiza mediante `claim_tutor_request()` y limita a 30 preguntas por usuario y día UTC.

Para comprobar la instalación, crea una cuenta desde `/registro`, confirma el correo si el proyecto lo exige, entra por `/login` y comprueba que el perfil aparece en `public.profiles`. Después verifica que un usuario no puede consultar otro perfil ni cambiar su rol con la clave pública.

La migración `migrations/20261006000000_catalog.sql` crea categorías y cursos. La migración `migrations/20261010000000_course_content.sql` agrega módulos, lecciones y políticas de administración; aplícalas en ese orden una sola vez. Para habilitar el panel `/admin/cursos`, crea primero la cuenta en la aplicación y verifica su UUID en Authentication. Luego, desde el editor SQL con permisos de propietario, ejecuta `update public.profiles set role = 'admin' where id = '<UUID_VERIFICADO>';` reemplazando el marcador por ese UUID. La sesión de esa cuenta podrá administrar contenido. Las cuentas nuevas continúan siendo estudiantes.
