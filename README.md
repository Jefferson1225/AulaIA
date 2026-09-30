# AulaIA

AulaIA es una plataforma web de aprendizaje virtual para gestionar cursos, lecciones, evaluaciones y progreso académico. Su propuesta incorpora un Tutor IA contextual dentro de cada lección. El repositorio contiene un recorrido de estudiante con contenido de demostración y el primer módulo funcional: acceso, perfiles y Tutor IA.

## Estado actual

Se pueden recorrer las siguientes vistas:

| Ruta | Vista | Disponible ahora |
|---|---|---|
| `/login` | Acceso | Inicio de sesión con Supabase Auth |
| `/registro` | Registro | Alta de estudiantes por correo y contraseña |
| `/inicio` | Inicio del estudiante | Cursos, progreso y actividades de ejemplo |
| `/catalogo` | Catálogo | Búsqueda y filtros por categoría y nivel |
| `/cursos/fundamentos-python/lecciones/variables-y-tipos` | Lección | Contenido de muestra y Tutor IA al configurar DeepSeek |

La ruta `/` abre `/inicio`. Con Supabase configurado, las rutas de estudiante y lección requieren una sesión verificada. La migración crea un perfil para cada usuario y asigna el rol `student`. El Tutor IA consulta DeepSeek desde el servidor y recibe el contenido de la lección desde el repositorio, no desde el navegador. El catálogo, el progreso y las actividades aún usan datos de demostración.

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

**Dominio** define los conceptos del negocio y el contrato `CourseRepository`. **Aplicación** contiene reglas de validación y preparación del contexto de la lección. **Infraestructura** implementa las integraciones con Supabase y DeepSeek y aún entrega datos académicos de demostración. **Presentación** muestra las vistas y maneja interacciones locales. **App** declara rutas, protege sesiones y conecta las piezas. Los siguientes módulos reemplazarán el repositorio de cursos en memoria por adaptadores persistentes.

```text
AulaIA/
├── public/
│   └── brand/                     Identidad visual pública
├── src/
│   ├── app/
│   │   ├── (auth)/                 Acceso, registro y acciones de sesión
│   │   ├── (student)/              Inicio y catálogo con layout compartido
│   │   ├── (learning)/             Ruta de lección
│   │   ├── api/tutor/              Endpoint autenticado del Tutor IA
│   │   └── page.tsx                Redirección inicial
│   ├── presentation/
│   │   ├── components/             Shell del estudiante, tarjetas y progreso
│   │   └── views/                  Acceso, inicio, catálogo y lección
│   ├── application/                Casos de uso y filtros
│   ├── domain/                     Modelos y contratos
│   └── infrastructure/
│       ├── demo/                   Repositorio de contenido de ejemplo
│       ├── supabase/               Cliente SSR y perfiles
│       └── deepseek/               Cliente del Tutor IA
├── supabase/
│   └── migrations/                Perfiles, políticas RLS y cupo del Tutor IA
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

Abre `http://localhost:3000`. Para activar el acceso real, crea `.env.local` a partir de `.env.example` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Aplica la migración de `supabase/migrations/` en el proyecto de Supabase y habilita el proveedor de correo en Authentication. Configura las URL de redirección de localhost y del despliegue. Para activar el Tutor IA, añade `DEEPSEEK_API_KEY`; `DEEPSEEK_MODEL` permite cambiar el modelo y usa `deepseek-flash` por defecto. Configura las mismas variables en Vercel. No agregues credenciales al repositorio.

Supabase puede pedir confirmación por correo al registrarse, según la configuración del proyecto. Las cuentas nuevas reciben rol `student`; un administrador puede asignar otros roles mediante SQL seguro, fuera del formulario público. La política RLS permite leer el perfil propio y editar únicamente el nombre. El Tutor IA tiene un máximo de 30 preguntas por usuario y día UTC, aplicado en PostgreSQL para compartir el límite entre instancias.

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las pruebas cubren el filtrado del catálogo, la selección del curso en progreso, la búsqueda de una lección, las vistas de ejemplo, la validación de credenciales y la preparación del contexto del Tutor IA. La autenticación real y las políticas SQL requieren un proyecto Supabase configurado para probarlas de extremo a extremo.

## Siguientes etapas

1. Conectar el catálogo y los cursos con tablas y repositorios de Supabase.
2. Implementar matrículas, progreso y evaluaciones con sus políticas RLS.
3. Añadir administración de contenido y pruebas de integración con Supabase.
4. Desplegar en Vercel y validar el flujo completo con credenciales reales.

Proyecto desarrollado con fines académicos. La estructura permite incorporar estas funciones de forma gradual.
