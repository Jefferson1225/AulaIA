# AulaIA

AulaIA es una plataforma SaaS de aprendizaje virtual que centraliza la gestión de cursos, módulos, lecciones, matrículas, evaluaciones y progreso académico. La plataforma incorporará un Tutor IA contextual para apoyar al estudiante dentro de cada lección.

El proyecto se encuentra en su fase de preparación técnica. La estructura base, las dependencias y las convenciones de desarrollo ya están definidas. Las interfaces y funciones del producto se implementarán progresivamente sobre esta base.

## Objetivos

- Proporcionar una experiencia centralizada de aprendizaje virtual.
- Permitir que los estudiantes consulten cursos, se matriculen y registren su progreso.
- Ofrecer evaluaciones y seguimiento académico.
- Facilitar la administración de usuarios, cursos, categorías, módulos, lecciones y planes.
- Integrar un Tutor IA que responda utilizando el contexto del curso y la lección actual.
- Mantener una arquitectura organizada, escalable y fácil de probar.

## Alcance inicial

El primer producto funcional incluirá:

- Registro e inicio de sesión.
- Roles de estudiante y administrador.
- Catálogo y detalle de cursos.
- Matrícula en cursos.
- Navegación por módulos y lecciones.
- Registro de progreso.
- Evaluaciones básicas y resultados.
- Gestión administrativa del contenido.
- Tutor IA contextual.

No se contempla inicialmente una aplicación móvil nativa, clases en vivo, red social, videollamadas ni pagos reales.

## Tecnologías

| Área | Tecnología |
|---|---|
| Aplicación web | Next.js 16 y React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Autenticación | Supabase Auth |
| Base de datos | Supabase PostgreSQL |
| Archivos | Supabase Storage |
| Inteligencia artificial | DeepSeek mediante API |
| Integración de IA | Vercel AI SDK |
| Despliegue | Vercel |
| Validación | Zod |
| Pruebas | Vitest y Testing Library |
| Gestor de paquetes | pnpm |

## Arquitectura

El proyecto utiliza una arquitectura lógica por capas dentro de Next.js:

```text
Interfaz y componentes
          │
          ▼
Route Handlers y Server Actions
          │
          ▼
Servicios y reglas del negocio
          │
          ├──────────────► Servicio del Tutor IA ─────► DeepSeek API
          │
          ▼
Repositorios de datos
          │
          ▼
Supabase Auth, PostgreSQL y Storage
```

Responsabilidades principales:

- **Presentación:** páginas, layouts y componentes de React.
- **Controladores:** reciben solicitudes, validan entradas y llaman a los servicios.
- **Servicios:** contienen los casos de uso y las reglas del negocio.
- **Repositorios:** concentran el acceso a Supabase.
- **Integraciones:** encapsulan la comunicación con servicios externos.

Los componentes visuales no deben consultar directamente la base de datos ni incluir claves privadas.

## Estructura del repositorio

```text
AulaIA/
├── public/
│   └── brand/                 # Recursos públicos de identidad
├── src/
│   ├── app/
│   │   ├── (auth)/            # Registro e inicio de sesión
│   │   ├── (student)/         # Experiencia del estudiante
│   │   ├── admin/             # Panel administrativo
│   │   └── api/               # Route Handlers
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   ├── layout/            # Estructuras compartidas
│   │   ├── courses/           # Cursos y lecciones
│   │   ├── evaluations/       # Evaluaciones
│   │   ├── tutor/             # Tutor IA
│   │   └── admin/             # Administración
│   ├── services/              # Casos de uso y reglas del negocio
│   ├── repositories/          # Acceso a Supabase
│   ├── lib/
│   │   ├── supabase/          # Clientes y sesión
│   │   └── deepseek/          # Cliente, contexto y prompts
│   ├── hooks/                 # Hooks reutilizables
│   ├── types/                 # Tipos compartidos
│   └── validations/           # Esquemas de validación
├── supabase/
│   └── migrations/            # Esquema y políticas de seguridad
├── prolog/                    # Representación lógica del conocimiento
├── tests/
│   ├── unit/                  # Pruebas unitarias
│   └── integration/           # Pruebas de integración
├── .env.example
├── package.json
└── pnpm-lock.yaml
```

## Requisitos

- Node.js 24 o una versión compatible con Next.js 16.
- pnpm 11 o superior.
- Una cuenta y un proyecto de Supabase.
- Una clave de API de DeepSeek.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Jefferson1225/AulaIA.git
cd AulaIA
```

Instalar las dependencias:

```bash
pnpm install
```

Crear el archivo local de variables de entorno:

```bash
cp .env.example .env.local
```

En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Completar las variables y ejecutar el entorno de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Uso | Exposición |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | Cliente y servidor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | Cliente y servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones administrativas controladas | Solo servidor |
| `DEEPSEEK_API_KEY` | Autenticación con DeepSeek | Solo servidor |
| `DEEPSEEK_MODEL` | Modelo utilizado por el Tutor IA | Solo servidor |
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación | Cliente y servidor |

Las claves privadas deben almacenarse en `.env.local` y en la configuración segura de Vercel. Nunca deben añadirse al repositorio ni enviarse al navegador.

## Comandos disponibles

| Comando | Función |
|---|---|
| `pnpm dev` | Inicia el entorno de desarrollo |
| `pnpm build` | Genera la compilación de producción |
| `pnpm start` | Ejecuta la compilación de producción |
| `pnpm lint` | Revisa las reglas de calidad del código |
| `pnpm typecheck` | Comprueba los tipos de TypeScript |
| `pnpm test` | Ejecuta las pruebas automatizadas |

## Convenciones de desarrollo

- La interfaz y los textos visibles se escriben en español.
- Los componentes React utilizan `PascalCase`.
- Las funciones y variables utilizan `camelCase`.
- Las tablas y columnas de PostgreSQL utilizan `snake_case`.
- Los archivos de rutas utilizan nombres descriptivos en minúsculas.
- Los controladores delegan la lógica a los servicios.
- Los servicios acceden a los datos mediante repositorios.
- Las integraciones externas se encapsulan detrás de interfaces propias.
- Las entradas se validan antes de ejecutar reglas del negocio.
- Las claves privadas solo se utilizan en código del servidor.

## Flujo de trabajo con Git

La rama principal es `main`. El trabajo nuevo debe desarrollarse en ramas breves:

```text
feature/nombre-funcionalidad
fix/nombre-correccion
chore/nombre-tarea
```

Los commits deben describir una sola modificación y utilizar mensajes claros:

```text
feat: implementa catálogo de cursos
fix: corrige cálculo del progreso
chore: configura Supabase
test: agrega pruebas del servicio de matrículas
docs: actualiza instrucciones de instalación
```

Antes de integrar cambios en `main` se debe ejecutar:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Seguridad

- Utilizar Supabase Auth para las credenciales.
- Aplicar políticas Row Level Security a las tablas expuestas.
- Validar datos en el servidor.
- Mantener las claves privadas fuera del cliente.
- Limitar el contexto enviado al modelo de IA.
- Evitar almacenar información sensible en conversaciones.
- Registrar errores sin incluir credenciales ni contenido privado.

## Próximas etapas

1. Implementar el sistema visual y los layouts sobre la estructura actual.
2. Configurar los clientes de Supabase.
3. Crear el esquema inicial y las políticas de seguridad.
4. Implementar autenticación y roles.
5. Desarrollar el catálogo, cursos, módulos y lecciones.
6. Incorporar matrículas, progreso y evaluaciones.
7. Integrar el Tutor IA contextual.
8. Preparar pruebas, datos de demostración y despliegue.

## Estado académico

Proyecto desarrollado con fines académicos. La arquitectura y el alcance podrán evolucionar durante las siguientes etapas del curso.
