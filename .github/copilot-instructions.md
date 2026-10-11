# Hito 3: Talent Pipeline Tracker

- Todo el trabajo de este hito vive SOLO en `uis/talent-pipeline-tracker/`. No modificar archivos de la raíz del repo (`package.json`, `tsconfig.json`, `tailwind.config.js`, `dist/`, `.github/workflows`, `index.html`, etc.), excepto este archivo de instrucciones.
- Stack permitido: Next.js (App Router), React y TypeScript, con Tailwind CSS. PROHIBIDO Redux, Zustand, Jotai, React Query/SWR o cualquier librería de estado o de fetching. Usar solo hooks de React (`useState`, `useEffect`, `useReducer`, `useMemo`, `useCallback`, `useRef`) y hooks de Next (`useRouter`, `useParams`, `useSearchParams`, `usePathname`).
- Toda llamada a la API usa `async`/`await`. Nunca fallar en silencio: cada operación de lectura expone tres estados en la UI (cargando, éxito, error) y cada mutación muestra feedback de éxito o error.
- Los textos visibles están en español. Los valores de dominio de la API (`status`, `stage`) se conservan tal cual en el código y se traducen solo en la capa de presentación mediante un mapa de etiquetas.
- Evitar prop drilling: el estado vive en el componente que lo usa o en un custom hook; no pasar props a través de más de un nivel intermedio sin necesidad.
- Estructura dentro de `src/`: `components/`, `hooks/`, `types/`, `lib/`, `services/`.
- Los componentes no llaman a `fetch` directamente: usan hooks que usan services.
- Tipado estricto: sin `any`. Definir tipos para toda estructura que venga de la API.
- La interfaz debe sentirse como una herramienta interna de Brasaland People and Culture. Encabezado: `Brasaland · People & Culture`. Título: `Talent Pipeline`. No inventar campos que la API no tenga.
- Nunca commitear `.env.local`. Mantener `.env.example` actualizado.
- Después de cada tarea, ejecutar `npm run lint` y `npm run build` dentro de `uis/talent-pipeline-tracker` y corregir errores.