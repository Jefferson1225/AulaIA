# AulaIA

AulaIA es una plataforma web de aprendizaje virtual para gestionar cursos, lecciones, evaluaciones y progreso académico. Su propuesta incorpora un Tutor IA contextual dentro de cada lección. El repositorio incluye acceso, perfiles, catálogo, gestión de contenido, matrículas, progreso, evaluaciones y resultados.

## Estado actual

Se pueden recorrer las siguientes vistas:

| Ruta | Vista | Disponible ahora |
|---|---|---|
| `/login` | Acceso | Inicio de sesión con Supabase Auth |
| `/registro` | Registro | Alta de estudiantes por correo y contraseña |
| `/inicio` | Inicio del estudiante | Matrículas, progreso, siguiente lección pendiente y recomendaciones desde Supabase |
| `/catalogo` | Catálogo | Cursos publicados y categorías desde Supabase, con búsqueda y filtros |
| `/cursos/[curso]` | Detalle de curso | Contenido publicado, matrícula y resumen del avance propio |
| `/cursos/[curso]/lecciones/[leccion]` | Lección | Contenido persistente, marcar o desmarcar como completada y Tutor IA al configurar DeepSeek |
| `/admin/cursos` | Gestión de contenido | Crear, editar y publicar cursos; administrar módulos y lecciones con rol `admin` |
| `/admin/evaluaciones` | Gestión de evaluaciones | Crear borradores, administrar preguntas y publicar con rol `admin` |
| `/cursos/[curso]/evaluaciones/[evaluacion]` | Evaluación | Responder preguntas de opción múltiple y consultar intentos propios |
| `/cursos/[curso]/evaluaciones/[evaluacion]/resultados/[intento]` | Resultado | Nota y revisión de respuestas del intento propio |
| `/resultados` | Mis resultados | Historial personal, incluso de evaluaciones despublicadas |

La ruta `/` abre `/inicio`. Con Supabase configurado, las rutas de estudiante y lección requieren una sesión verificada. Las cuentas nuevas reciben el rol `student`. El catálogo y el contenido publicado se leen desde Supabase. Cada cuenta puede matricularse, completar lecciones y retomar la primera pendiente; los datos se conservan entre sesiones. La gestión de contenido exige rol `admin` tanto en las acciones del servidor como en PostgreSQL. El Tutor IA consulta DeepSeek desde el servidor con el contenido de la lección.

El porcentaje de avance se calcula con las lecciones actuales del curso, sin almacenar un porcentaje editable por el navegador. Las claves compuestas impiden duplicar matrículas y completados. Las políticas RLS restringen el avance a su propietario y exigen una matrícula para completar lecciones. Si se elimina una lección, se elimina su completado asociado; si se agrega contenido, el avance se recalcula. Las actividades del inicio son lecciones pendientes reales.

Las evaluaciones admiten hasta 50 preguntas de cuatro alternativas, con una respuesta correcta por pregunta. PostgreSQL comprueba la matrícula y calcula `aciertos × 20 / preguntas`, con dos decimales y un mínimo aprobatorio configurable entre 1 y 20. Las claves correctas se guardan en un esquema privado sin permisos para los clientes. Los intentos conservan una copia de las preguntas respondidas y el criterio de aprobación. Cada envío tiene un identificador para evitar duplicados y una versión para rechazar formularios anteriores a una edición. Solo se editan borradores sin intentos; despublicar conserva el historial. El menú “Mis resultados” permite recuperar los intentos anteriores.

Sin credenciales, `pnpm dev` permite recorrer las vistas de ejemplo localmente. En producción, las rutas de estudio no se abren sin Supabase configurado.

## Tecnologías

| Área | Tecnología |
|---|---|
| Aplicación web | Next.js 16 y React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 y CSS global |
| Iconos | Lucide React |
| Autenticación y perfiles | Supabase Auth y PostgreSQL con RLS |
| Tutor IA | DeepSeek API, modelo `deepseek-flash` por defecto |
| Despliegue previsto | Vercel |
| Pruebas | Vitest y Testing Library |
| Gestor de paquetes | pnpm |

## Diseño por capas

```text
src/app             Rutas, layouts, acciones de servidor y endpoint del Tutor IA
    │
    ▼
src/presentation    Vistas y componentes React
    │
    ▼
src/application     Reglas de acceso, catálogo, panel, lección y Tutor IA
    │
    ▼
src/domain          Entidades y contratos de repositorio
    ▲
    │
src/infrastructure  Implementaciones de datos e integraciones
```

**Dominio** define los conceptos del negocio y los contratos de repositorio. **Aplicación** contiene reglas de validación, filtrado y preparación del contexto de la lección. **Infraestructura** implementa el catálogo en Supabase, la integración con DeepSeek y los adaptadores de demostración para las funciones pendientes. **Presentación** muestra las vistas y maneja interacciones locales. **App** declara rutas, protege sesiones y conecta las piezas.

```text
AulaIA/
├── public/
│   └── brand/                     Identidad visual pública
├── src/
│   ├── app/
│   │   ├── (auth)/                 Acceso, registro y acciones de sesión
│   │   ├── (student)/              Inicio y catálogo con layout compartido
│   │   ├── (learning)/             Rutas de curso y lección
│   │   ├── (admin)/                Gestión de contenido para administradores
│   │   ├── api/tutor/              Endpoint autenticado del Tutor IA
│   │   └── page.tsx                Redirección inicial
│   ├── presentation/
│   │   ├── components/             Shell del estudiante, tarjetas y progreso
│   │   └── views/                  Acceso, inicio, catálogo, cursos, lección y administración
│   ├── application/                Casos de uso y filtros
│   ├── domain/                     Modelos y contratos
│   └── infrastructure/
│       ├── demo/                   Repositorio de contenido de ejemplo
│       ├── supabase/               Cliente SSR, perfiles, contenido, avance y evaluaciones
│       └── deepseek/               Cliente del Tutor IA
├── supabase/
│   ├── migrations/                Perfiles, contenido, avance, evaluaciones y políticas RLS
│   └── tests/                     Comprobaciones SQL de aislamiento y relaciones
├── prolog/                         Reservado para representación lógica
└── tests/
    ├── unit/                       Reglas de aplicación
    └── integration/                Comportamiento de las vistas
```

### Reglas de dependencia

- El dominio no importa código de Next.js, React, Supabase ni DeepSeek.
- Los casos de uso dependen de contratos del dominio.
- La infraestructura implementa esos contratos.
- Las rutas conectan casos de uso, adaptadores y vistas.
- Las claves privadas y llamadas a IA deben permanecer en el servidor.

## Ejecución local

Requiere Node.js compatible con Next.js 16 y pnpm 11.

```bash
git clone https://github.com/Jefferson1225/AulaIA.git
cd AulaIA
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. Para activar el acceso real, crea `.env.local` a partir de `.env.example` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Aplica las migraciones de `supabase/migrations/` en orden y habilita el proveedor de correo en Authentication. `20261026000000_assessments.sql` requiere las migraciones de contenido y matrículas; incluye una evaluación de muestra en el curso de Python. Configura las URL de redirección de localhost y del despliegue. DeepSeek es opcional para probar matrículas, avance y evaluaciones; para activar el tutor añade `DEEPSEEK_API_KEY`. Configura las mismas variables en Vercel. No agregues credenciales al repositorio.

Supabase puede pedir confirmación por correo al registrarse, según la configuración del proyecto. Las cuentas nuevas reciben rol `student`; para gestionar contenido hay que asignar `admin` a una cuenta desde el editor SQL de Supabase, después de verificar su UUID en Authentication. No se cambia el rol desde el formulario público. La política RLS permite leer el perfil propio y editar únicamente el nombre. El Tutor IA tiene un máximo de 30 preguntas por usuario y día UTC, aplicado en PostgreSQL para compartir el límite entre instancias.

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las pruebas cubren el catálogo, el avance, las vistas, los formularios y las acciones de envío de evaluaciones, las validaciones y el contexto del Tutor IA. Los scripts de `supabase/tests/` comprueban matrículas, aislamiento entre usuarios, permisos de edición, calificación, versiones y conservación de resultados en una base PostgreSQL de pruebas con las migraciones aplicadas. El flujo completo de correo, sesión y API de Supabase se valida con un proyecto configurado.

## Siguientes etapas

1. Validar el recorrido completo con cuentas reales y ampliar las pruebas de integración con Supabase.
2. Completar el contenido académico y la revisión del Tutor IA.
3. Desplegar en Vercel y validar la configuración de producción.

Proyecto desarrollado con fines académicos. La estructura permite incorporar estas funciones de forma gradual.
