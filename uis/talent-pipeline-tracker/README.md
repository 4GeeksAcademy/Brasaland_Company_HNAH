# Brasaland · People & Culture — Talent Pipeline

## Propósito

Aplicación interna para consultar y gestionar candidaturas de Brasaland People & Culture. Permite filtrar el listado, revisar el detalle, actualizar estado y etapa, mantener notas internas y crear o editar candidaturas.

## Requisitos y ejecución

Se requiere Node.js 20.9 o posterior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>. Para verificar el proyecto:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Variables de entorno

| Variable              | Propósito                                                                              |
| --------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base de la API del tracker; se usa desde el navegador y no debe contener secretos. |

El archivo `.env.example` incluye el endpoint de Playground utilizado por este hito. `.env.local` es local y está ignorado por Git.

## Endpoints usados

Todos los endpoints parten de `NEXT_PUBLIC_API_URL`:

| Método y ruta                                                     | Uso                                                 |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `GET /records?limit=...&page=...&status=...&stage=...&search=...` | Lista y filtra candidaturas.                        |
| `GET /records/{id}`                                               | Carga el detalle o el formulario de edición.        |
| `POST /records`                                                   | Crea una candidatura.                               |
| `PUT /records/{id}`                                               | Reemplaza los campos editables de una candidatura.  |
| `PATCH /records/{id}`                                             | Actualiza solo `status` o solo `stage`.             |
| `DELETE /records/{id}`                                            | Helper del service; no se expone en la interfaz.    |
| `GET /records/{id}/notes`                                         | Carga las notas de una candidatura.                 |
| `POST /records/{id}/notes`                                        | Añade una nota.                                     |
| `DELETE /records/{id}/notes/{note_id}`                            | Elimina una nota; la API responde `204` sin cuerpo. |

## Estructura

```text
src/
├── app/          Rutas de listado, detalle, alta, edición y errores
├── components/   Componentes de candidaturas, notas y estados de interfaz
├── hooks/        Carga cancelable y coordinación de datos locales
├── lib/          Cliente API, formatos, constantes y validación
├── services/     Llamadas tipadas a los endpoints
└── types/        Modelos de candidaturas, notas y respuestas API
```

Los componentes no llaman a `fetch`; las peticiones se concentran en `services/` a través de `lib/api-client.ts`.

## Decisiones

- **Filtros en URL:** `status`, `stage` y `search` son la fuente de verdad en query params. Los valores de estado/etapa se validan contra `lib/constants.ts`; cambios y limpieza usan navegación del App Router sin recarga.
- **Búsqueda:** el campo conserva un borrador local y aplica debounce de 300 ms antes de actualizar `search`.
- **Paginación:** el API observado devuelve `{ total, page, limit, data }`. El servicio solicita `limit=1000` y continúa por páginas hasta alcanzar `total` o agotar los resultados; también normaliza respuestas array.
- **Volver al listado:** los enlaces de candidatura codifican la ruta filtrada en `?from=...`. El detalle solo acepta como retorno `/` con su query, y vuelve a `/` ante cualquier destino no local. Las mutaciones notifican al listado para que actualice su caché cliente al volver.
- **Estados y etapas:** se conservan los valores de dominio (`received`, `in_progress`, etc.) en los datos y se traducen en presentación. Las etiquetas españolas se basan en las opciones definidas para este hito; `CONTEXT.md` no establece este vocabulario.
- **Enlaces opcionales:** cuando LinkedIn o CV están vacíos, se envía `null`; se comprobó que el endpoint de creación lo acepta.
- **Tipos API:** los servicios declaran los contratos TypeScript de cada respuesta. El cliente genérico centraliza el parseo JSON, pero no valida en runtime cada esquema.

## Suposiciones y limitaciones

- Se usa el API de Playground compartido del proyecto; no incluye autenticación ni autorización implementadas en esta app.
- La cantidad de candidaturas depende de los datos disponibles en el servicio. La inspección del dataset durante el desarrollo encontró 100; no es un límite codificado en la interfaz.
- Los errores HTTP y de red se muestran en español. Cambios incompatibles en el esquema remoto pueden requerir actualizar los tipos y servicios.
- El API debe permitir CORS para el origen donde se ejecute la app.
- Las rutas de edición y creación comparten el esquema de los campos editables del API; estado y etapa se modifican por separado mediante PATCH.
