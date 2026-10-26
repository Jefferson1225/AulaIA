# Pruebas

- `unit`: reglas de aplicación, validaciones y cálculo de progreso con datos controlados.
- `integration`: comportamiento visible de las vistas.
- `fixtures`: cursos y matrículas de prueba sin credenciales.

Ejecuta `pnpm test`. Las políticas PostgreSQL se comprueban aparte con `supabase/tests/learning_rls.sql` en una base de pruebas con las migraciones aplicadas. Los casos incluyen duplicados, matrícula requerida, escritura y lectura ajena, desmarcado y eliminación en cascada.
