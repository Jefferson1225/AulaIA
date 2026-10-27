# Pruebas

- `unit`: reglas de aplicación, validaciones y cálculo de progreso con datos controlados.
- `integration`: comportamiento visible de las vistas.
- `fixtures`: cursos y matrículas de prueba sin credenciales.

Ejecuta `pnpm test`. Las políticas PostgreSQL se comprueban aparte con `supabase/tests/learning_rls.sql` en una base de pruebas con las migraciones aplicadas. Los casos incluyen duplicados, matrícula requerida, escritura y lectura ajena, desmarcado y eliminación en cascada.

`assessment-actions.test.ts` ejercita el envío usando el cliente real de Supabase con transporte HTTP controlado. Comprueba autenticación, validación y que el payload no acepte notas ni un usuario desde el formulario. `assessment-views.test.tsx` verifica matrícula requerida, opciones sin preselección, navegación, resultados y bloqueo de edición. `supabase/tests/assessments_rls.sql` comprueba la calificación y seguridad ejecutando SQL en una base de pruebas.
