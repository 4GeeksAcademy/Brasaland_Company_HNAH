# Utilidades TypeScript y panel de operaciones de Brasaland

## Funcionalidades

- Cálculos temporales puros con `referenceDate` y agrupación por zonas IANA explícitas.
- Validadores de entradas `unknown`: estructura parcial, null/undefined, fechas inválidas y números no finitos devuelven errores sin excepciones.
- Conteos por categoría, total, promedio y extremos genéricos con selectores y resultados vacíos explícitos.
- Ordenamiento estable por varios campos, ascendente/descendente, sin mutar los datos.
- Modelos de clientes, proveedores, empleados, ingredientes, stock y recetas; trazabilidad y supuestos documentados en ambos READMEs.
- Reportes de ventas semanales de Florida, sede con mayor ticket medio mensual y totales COP/USD por sede.
- Interfaz Tailwind integrada en `index.html#operaciones`: filtros, búsquedas lineal/binaria, ordenamiento y reportes con resultados y estados vacíos.
- Build de módulos ES en `dist`, incluido el despliegue GitHub Pages; demo con 47 pruebas y limpieza del archivo accidental.

## Desafíos y soluciones

- El contexto no contiene un esquema ni reglas formales: los campos propuestos y las restricciones heredadas se identifican como supuestos, sin atribuirlos al negocio.
- Dos países y cambios horarios: días civiles en `America/Bogota`/`America/New_York`, semana lunes-domingo y pruebas de límites durante el cambio de horario de Florida.
- Pureza: fecha de referencia explícita en lugar del reloj global; los puntajes se repiten para la misma entrada.
- Datos incompletos: guardas de estructura antes de leer campos, `Number.isFinite` y errores acumulados.
- Imports en navegador: rutas `.js` para módulos compilados y build completo antes del despliegue. El servidor estático no recompila automáticamente.
- Vacíos y duplicados: promedio/extremos genéricos vacíos devuelven `undefined`, total vacío cero, búsqueda binaria retorna cualquier índice coincidente y los empates de orden mantienen estabilidad.

## Verificación

```bash
npm ci
npm run typecheck
npm run build
npm run demo
npx http-server . -p 3000 -a 0.0.0.0
```

- Typecheck y build completados sin errores; demo: 47 casos correctos.
- Chromium de escritorio (1440px) y móvil (390px): controles y todos los reportes verificados, sin errores de consola, imports fallidos ni desbordamiento de página.
- Semana de Florida del 5 de octubre de 2026: tres ventas, 74.50 USD y 298000 COP en los datos ficticios.

## Capturas

### Filtrado

![Dos productos de carne](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/filter-menu.png)

### Búsqueda lineal

![Sede Miami encontrada por ID](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/search-linear.png)

### Búsqueda binaria

![Sede encontrada por capacidad con índice visible](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/search-binary.png)

### Ordenamiento multicampo

![Capacidad y nombre en orden descendente](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/sort-multifield.png)

### Reporte de Florida

![Ventas semanales en COP y USD](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/report-florida.png)

### Vista móvil

![Controles y reporte en pantalla estrecha](https://raw.githubusercontent.com/4GeeksAcademy/Brasaland_Company_HNAH/feature/domain-models/docs/screenshots/operations-mobile.png)

## Alcance y pendientes

Los datos son ficticios. No se implementan CRM/HR completos, API, pronósticos, reglas laborales ni envío automático los lunes a las 07:00. Las restricciones heredadas y la conversión fija se documentan como supuestos pendientes de confirmación. Los márgenes negativos se conservan como resultados financieros; solo su componente del puntaje se acota. Persisten ocho alertas de dependencias de desarrollo; no se han aplicado actualizaciones incompatibles de Tailwind. El workflow actualizado queda sujeto a la ejecución real de GitHub Actions tras integrar la rama.

Destino previsto: `feature/domain-models` → `main` en `4GeeksAcademy/Brasaland_Company_HNAH`. Este documento es un borrador; no crea ni publica un Pull Request.
