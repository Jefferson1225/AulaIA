# AulaIA

AulaIA es una plataforma web de aprendizaje virtual para gestionar cursos, lecciones, evaluaciones y progreso académico. Su propuesta incorpora un Tutor IA contextual dentro de cada lección. Este repositorio contiene la base de la aplicación y un recorrido visual de estudiante con datos de demostración.

## Estado actual

Se pueden recorrer cuatro vistas:

| Ruta | Vista | Disponible ahora |
|---|---|---|
| `/login` | Acceso | Presentación y entrada a la demostración |
| `/inicio` | Inicio del estudiante | Cursos, progreso y actividades de ejemplo |
| `/catalogo` | Catálogo | Búsqueda y filtros por categoría y nivel |
| `/cursos/fundamentos-python/lecciones/variables-y-tipos` | Lección | Contenido de muestra y vista previa del Tutor IA |

La ruta `/` abre `/inicio`. Los datos actuales provienen de un repositorio en memoria. El acceso, el progreso persistente y las respuestas del Tutor IA se conectarán a Supabase y DeepSeek en las siguientes etapas. La interfaz distingue las funciones de demostración de las integraciones todavía pendientes.

## Tecnologías

| Área | Tecnología |
|---|---|
| Aplicación web | Next.js 16 y React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 y CSS global |
| Iconos | Lucide React |
| Autenticación, base de datos y archivos previstos | Supabase |
| Tutor IA previsto | DeepSeek mediante API y Vercel AI SDK |
| Despliegue previsto | Vercel |
| Pruebas | Vitest y Testing Library |
| Gestor de paquetes | pnpm |

## Diseño por capas

```text
src/app             Rutas, layouts y composición de Next.js
    │
    ▼
src/presentation    Vistas y componentes React
    │
    ▼
src/application     Casos de uso de catálogo, panel y lección
    │
    ▼
src/domain          Entidades y contratos de repositorio
    ▲
    │
src/infrastructure  Implementaciones de datos e integraciones
```

**Dominio** define los conceptos del negocio y el contrato `CourseRepository`. **Aplicación** aplica las reglas de consulta, filtrado y selección sin conocer dónde se guardan los datos. **Infraestructura** implementa el contrato; por ahora entrega datos de demostración. **Presentación** muestra las vistas y maneja interacciones locales. **App** declara rutas y conecta las piezas. Al integrar Supabase, se reemplazará el adaptador de demostración sin trasladar consultas de datos a los componentes.

```text
AulaIA/
├── public/
│   └── brand/                     Identidad visual pública
├── src/
│   ├── app/
│   │   ├── (auth)/login/           Ruta de acceso
│   │   ├── (student)/              Inicio y catálogo con layout compartido
│   │   ├── (learning)/             Ruta de lección
│   │   └── page.tsx                Redirección inicial
│   ├── presentation/
│   │   ├── components/             Shell del estudiante, tarjetas y progreso
│   │   └── views/                  Acceso, inicio, catálogo y lección
│   ├── application/                Casos de uso y filtros
│   ├── domain/                     Modelos y contratos
│   └── infrastructure/
│       └── demo/                   Repositorio de datos de ejemplo
├── supabase/
│   └── migrations/                Reservado para el esquema y las políticas
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

Abre `http://localhost:3000`. Las vistas actuales funcionan sin configurar servicios externos.

Cuando se integren Supabase y DeepSeek, crea `.env.local` a partir de `.env.example` y completa las variables correspondientes. No agregues credenciales al repositorio.

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las pruebas cubren el filtrado del catálogo, la selección del curso en progreso, la búsqueda de una lección y el comportamiento visible de las vistas de ejemplo.

## Siguientes etapas

1. Implementar autenticación y roles con Supabase Auth.
2. Crear el esquema PostgreSQL, las políticas RLS y los repositorios persistentes.
3. Conectar matrículas, progreso, evaluaciones y administración.
4. Integrar el Tutor IA contextual con DeepSeek mediante un endpoint de servidor.
5. Añadir pruebas de integración y desplegar en Vercel.

Proyecto desarrollado con fines académicos. La estructura permite incorporar estas funciones de forma gradual.
