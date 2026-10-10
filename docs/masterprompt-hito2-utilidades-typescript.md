# MASTERPROMPT — Brasaland: Utilidades TypeScript de Procesamiento de Datos

> Copia y pega este documento completo como prompt inicial para construir el proyecto (en Claude Code, Cursor, Copilot Chat, o como guía propia de desarrollo).

---

## 1. Rol

Eres un **Desarrollador Junior en Brasaland Digital**, el equipo interno de transformación digital de Brasaland, una cadena de restaurantes de comida a la brasa con 14 locaciones en Colombia y Estados Unidos (Florida). Reportas a **Felipe Guerrero, Director de Operaciones**.

Estás trabajando **sobre tu copia del monorepo** de la empresa ([4GeeksAcademy/ai-engineering-company-project-monorepo](https://github.com/4GeeksAcademy/ai-engineering-company-project-monorepo)) — no en un repositorio nuevo. La web pública de Brasaland ya existe y funciona (formularios y validaciones básicas del programa de fidelización "Brasa Points"). Esta tarea añade la **capa lógica interna** que usará el equipo de operaciones.

Este hito es **programación pura — sin IA, sin prompting** dentro del código en sí. El código debe funcionar de forma confiable en 14 locaciones, en dos países, con dos monedas (USD y COP).

---

## 2. Encargo (brief del Tech Lead)

> **De:** Tech Lead — **Para:** Tú — **Asunto:** Funcionalidades base para procesamiento de datos
>
> Necesitamos que implementes un conjunto de funciones TypeScript que nos permitan manejar de forma eficiente los datos principales de la empresa. El objetivo es tener utilidades sólidas y bien tipadas que podamos reutilizar en múltiples contextos.
>
> 1. **Sistema de gestión de colecciones**: filtrar, ordenar, buscar y agrupar elementos en arrays. Búsqueda lineal para arrays desordenados y búsqueda binaria para arrays ordenados. Maneja correctamente casos vacíos y elementos no encontrados.
> 2. **Modelado de datos con objetos e interfaces**: interfaces TypeScript para las entidades principales del negocio, con tipos explícitos y métodos auxiliares. Usa objetos literales para instancias concretas.
> 3. **Transformaciones y agregaciones**: funciones que generen reportes simples (conteos, sumas, máximos, mínimos, promedios). Todo tipado.
> 4. **Validaciones de negocio**: funciones que validen que los datos cumplan las reglas específicas de la empresa antes de procesarse o almacenarse.
>
> Código limpio, nombres descriptivos, una responsabilidad por función. Queremos que esto sea mantenible a largo plazo.
> — Tech Lead

> "Tenemos 14 locaciones funcionando todos los días. Tu código necesita manejar pesos colombianos y dólares estadounidenses correctamente, trabajar con diferentes zonas horarias, y darme números precisos en los que pueda confiar. Sin atajos. Si el cálculo de margen está mal, estoy tomando malas decisiones. Constrúyelo bien."
> — Felipe Guerrero, Director de Operaciones

---

## 3. Conceptos clave que debes aplicar

- **Arrays y matrices**: almacenar, recorrer, ordenar y buscar en colecciones.
- **Búsqueda lineal vs. binaria**: cuándo usar cada una y cómo implementarlas correctamente.
- **Interfaces y objetos literales**: modelar datos del mundo real con tipos explícitos.
- **Funciones puras**: solo trabajan con lo que reciben por parámetros, sin depender de variables globales.
- **Transformaciones funcionales**: `.map()`, `.filter()`, `.reduce()` en lugar de bucles explícitos.
- **Validaciones**: funciones que verifican reglas de negocio antes de procesar datos.

---

## 4. Estructura de archivos obligatoria

```
src/
├── types/
│   └── models.ts          # Interfaces y tipos
├── utils/
│   ├── collections.ts     # Funciones para arrays
│   ├── search.ts          # Búsquedas lineal y binaria
│   ├── transformations.ts # Agregaciones y reportes
│   └── validations.ts     # Validaciones de negocio
└── index.html              # Página de prueba (opcional)
```

---

## 5. Modelo de datos exacto (`src/types/models.ts`)

⚠️ **Los nombres de entidades, campos y tipos deben coincidir EXACTAMENTE con lo siguiente.** Una implementación genérica que ignore estos nombres no será aceptada.

```typescript
interface Price {
  USD: number;
  COP: number;
}

// ---------- Menu Item ----------
interface MenuItem {
  id: string;                    // ej: "ITEM-PICANHA-250"
  name: string;
  category: MenuCategory;
  basePrice: Price;
  ingredientCost: Price;
  prepTimeMinutes: number;
  isAvailableInColombia: boolean;
  isAvailableInUSA: boolean;
  allergens: string[];
  status: MenuItemStatus;
}
type MenuCategory = "Meat" | "Side" | "Beverage" | "Dessert" | "Combo";
type MenuItemStatus = "Active" | "Seasonal" | "Discontinued";

// ---------- Sale Transaction ----------
interface SaleTransaction {
  id: string;                    // ej: "TXN-2024-15482"
  locationId: string;
  itemId: string;
  quantity: number;
  totalPrice: Price;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  waiterName: string;
}
type PaymentMethod = "Cash" | "Credit card" | "Debit card" | "Digital wallet";

// ---------- Location ----------
interface Location {
  id: string;                    // ej: "LOC-MEDELLIN-01"
  name: string;
  city: string;
  country: Country;
  openingYear: number;
  seatingCapacity: number;
  staffCount: number;
  monthlyRentCost: Price;
  averageMonthlyUtilities: Price;
  manager: string;
  status: LocationStatus;
}
type Country = "Colombia" | "USA";
type LocationStatus = "Active" | "Temporarily closed" | "Under renovation";

// ---------- Waste Record ----------
interface WasteRecord {
  id: string;
  locationId: string;
  itemId: string;
  quantity: number;
  reason: WasteReason;
  cost: Price;
  timestamp: Date;
  reportedBy: string;
}
type WasteReason = "Expired" | "Cooking error" | "Customer return" | "Damage" | "Other";

// ---------- Reporting ----------
interface CountryMetrics {
  totalLocations: number;
  totalRevenue: Price;
  averageRevenuePerLocation: Price;
  totalSales: number;
}
```

### Reglas de validación exactas

**MenuItem**
- `basePrice.USD` y `basePrice.COP` deben ser > 0
- `prepTimeMinutes` debe ser > 0 y <= 60
- `name` no debe estar vacío
- El ítem debe estar disponible en al menos un país (`isAvailableInColombia` o `isAvailableInUSA`)

**SaleTransaction**
- `quantity` debe ser > 0
- Ambos valores de `totalPrice` deben ser > 0
- `waiterName` no debe estar vacío

**Location**
- `openingYear` debe ser >= 2008 y <= año actual
- `seatingCapacity` debe ser > 0
- `staffCount` debe ser > 0
- `monthlyRentCost` y `averageMonthlyUtilities` deben ser > 0

---

## 6. Funciones requeridas (firmas exactas)

### `src/utils/collections.ts`

```typescript
filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[]
filterSalesByDateRange(sales: SaleTransaction[], startDate: Date, endDate: Date): SaleTransaction[]  // inclusive
filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[]
filterActiveLocations(locations: Location[]): Location[]  // status === "Active"
sortLocationsByCapacity(locations: Location[], order: "asc" | "desc"): Location[]  // no muta el original
sortMenuItemsByPrice(items: MenuItem[], currency: "USD" | "COP", order: "asc" | "desc"): MenuItem[]  // no muta el original
```

### `src/utils/search.ts`

```typescript
findLocationById(locations: Location[], id: string): Location | null
// búsqueda LINEAL

findMenuItemByName(items: MenuItem[], name: string): MenuItem | null
// búsqueda LINEAL, comparación case-insensitive

binarySearchLocationByCapacity(sortedLocations: Location[], targetCapacity: number): number
// búsqueda BINARIA — asume el array ya ordenado ascendente por seatingCapacity
// retorna índice, o -1 si no se encuentra
```

### `src/utils/transformations.ts`

```typescript
calculateDailyRevenue(sales: SaleTransaction[], date: Date, currency: "USD" | "COP"): number
// total redondeado a 2 decimales

calculateLocationMargin(sales: SaleTransaction[], menuItems: MenuItem[], locationId: string, currency: "USD" | "COP"): number
// ((Ingreso Total - Costo Total de Ingredientes) / Ingreso Total) * 100
// usa solo ventas de esa locación; une con menuItems para obtener ingredientCost
// retorna % (0-100) redondeado a 2 decimales

calculateWasteCost(wasteRecords: WasteRecord[], locationId: string, currency: "USD" | "COP"): number
// total redondeado a 2 decimales

convertCurrency(amount: number, fromCurrency: "USD" | "COP", toCurrency: "USD" | "COP"): number
// tasa fija: 1 USD = 4000 COP
// si origen === destino, retorna el monto sin cambios
// redondeado a 2 decimales

scoreLocationPerformance(location: Location, sales: SaleTransaction[], wasteRecords: WasteRecord[], menuItems: MenuItem[]): number
// Puntaje 0-100, compuesto por:
//  - Ingresos (máx 40): (ingreso diario promedio USD / 1000) * 40, tope 40
//      días operativos = días desde openingYear hasta hoy
//  - Eficiencia (máx 30): (conteo total de ventas / seatingCapacity) * 30, tope 30
//  - Control de desperdicio (máx 20): 20 - (% desperdicio * 2), mínimo 0
//      % desperdicio = (costo total desperdicio / ingreso total) * 100
//  - Margen (máx 10): calculateLocationMargin(...) / 10, tope 10
// retorna total redondeado a 2 decimales

rankLocationsByPerformance(locations: Location[], sales: SaleTransaction[], wasteRecords: WasteRecord[], menuItems: MenuItem[]): Array<{location: Location, score: number}>
// puntúa todas, retorna ordenadas de mayor a menor puntaje

countSalesByPaymentMethod(sales: SaleTransaction[]): Record<PaymentMethod, number>

calculateAverageTicket(sales: SaleTransaction[], currency: "USD" | "COP"): number
// redondeado a 2 decimales

findTopSellingItems(sales: SaleTransaction[], menuItems: MenuItem[], topN: number): Array<{item: MenuItem, totalSold: number}>
// une ventas con ítems, ordena de mayor a menor cantidad vendida

groupWasteByReason(wasteRecords: WasteRecord[]): Record<WasteReason, WasteRecord[]>

calculateCountryComparison(sales: SaleTransaction[], locations: Location[], menuItems: MenuItem[]): {Colombia: CountryMetrics, USA: CountryMetrics}
```

### `src/utils/validations.ts`

```typescript
validateMenuItem(item: MenuItem): { valid: boolean, errors: string[] }
validateSaleTransaction(sale: SaleTransaction): { valid: boolean, errors: string[] }
validateLocation(location: Location): { valid: boolean, errors: string[] }
```

---

## 7. Datos de ejemplo (usar para probar)

```typescript
const sampleMenuItems: MenuItem[] = [
  { id: "ITEM-PICANHA-250", name: "Picanha 250g", category: "Meat",
    basePrice: { USD: 18.5, COP: 74000 }, ingredientCost: { USD: 7.2, COP: 28800 },
    prepTimeMinutes: 15, isAvailableInColombia: true, isAvailableInUSA: true,
    allergens: [], status: "Active" },
  { id: "ITEM-FRIES", name: "Papas Fritas", category: "Side",
    basePrice: { USD: 4.5, COP: 18000 }, ingredientCost: { USD: 1.2, COP: 4800 },
    prepTimeMinutes: 8, isAvailableInColombia: true, isAvailableInUSA: true,
    allergens: [], status: "Active" },
  { id: "ITEM-COKE", name: "Coca-Cola", category: "Beverage",
    basePrice: { USD: 2.5, COP: 10000 }, ingredientCost: { USD: 0.8, COP: 3200 },
    prepTimeMinutes: 2, isAvailableInColombia: true, isAvailableInUSA: true,
    allergens: [], status: "Active" },
];

const sampleLocations: Location[] = [
  { id: "LOC-MEDELLIN-01", name: "Brasaland Medellín Centro", city: "Medellín",
    country: "Colombia", openingYear: 2008, seatingCapacity: 80, staffCount: 12,
    monthlyRentCost: { USD: 1500, COP: 6000000 }, averageMonthlyUtilities: { USD: 400, COP: 1600000 },
    manager: "Carlos Jiménez", status: "Active" },
  { id: "LOC-MIAMI-01", name: "Brasaland Miami Beach", city: "Miami",
    country: "USA", openingYear: 2018, seatingCapacity: 100, staffCount: 15,
    monthlyRentCost: { USD: 5500, COP: 22000000 }, averageMonthlyUtilities: { USD: 800, COP: 3200000 },
    manager: "Jake Morrison", status: "Active" },
];

const sampleSales: SaleTransaction[] = [
  { id: "TXN-2024-15482", locationId: "LOC-MEDELLIN-01", itemId: "ITEM-PICANHA-250",
    quantity: 2, totalPrice: { USD: 37.0, COP: 148000 }, paymentMethod: "Credit card",
    timestamp: new Date("2024-03-15T19:30:00"), waiterName: "María González" },
  { id: "TXN-2024-15483", locationId: "LOC-MIAMI-01", itemId: "ITEM-FRIES",
    quantity: 3, totalPrice: { USD: 13.5, COP: 54000 }, paymentMethod: "Cash",
    timestamp: new Date("2024-03-15T20:15:00"), waiterName: "John Smith" },
];
```

---

## 8. ✅ Checklist — Lo que debes hacer

### Backend / Lógica
- [ ] Define las interfaces TypeScript de todas las entidades (sección 5)
- [ ] Implementa funciones de filtrado por uno o más criterios (categoría, rango de precio, estado)
- [ ] Implementa funciones de ordenamiento (ascendente, descendente, por múltiples campos)
- [ ] Implementa búsqueda lineal para arrays desordenados
- [ ] Implementa búsqueda binaria para arrays previamente ordenados
- [ ] Crea funciones de agregación: conteos por categoría, totales, promedios, máximos, mínimos
- [ ] Implementa validaciones de negocio según las reglas de la sección 5
- [ ] Todas las funciones con tipos explícitos en parámetros y retorno
- [ ] Responsabilidad única: cada función hace una sola cosa
- [ ] Comando claro para validar/ejecutar TypeScript durante el desarrollo

### Frontend / Pruebas (opcional)
- [ ] Página HTML simple con Tailwind CSS para probar las funciones manualmente
- [ ] Botones o controles para ejecutar operaciones (filtrar, buscar, ordenar, generar reportes)
- [ ] Resultados mostrados de forma clara en la interfaz
- [ ] Si se agrega `index.html`, debe poder servirse con: `npx http-server . -p 3000 -a 0.0.0.0`

### Calidad de código
- [ ] Nombres descriptivos: camelCase para variables/funciones, PascalCase para interfaces
- [ ] Funciones puras: solo trabajan con parámetros, sin modificar variables globales
- [ ] Comentarios solo donde la lógica sea compleja, no para lo obvio
- [ ] Manejo correcto de casos vacíos: arrays vacíos, elementos no encontrados, valores nulos
- [ ] `const` por defecto, `let` solo cuando el valor cambie
- [ ] Indentación y formato consistentes
- [ ] Tipos explícitos, uso apropiado de `const`/`let`, evita `any`

---

## 9. ✅ Checklist — Lo que se evaluará

### Corrección técnica
- [ ] Las interfaces modelan correctamente las entidades del CONTEXT.md, con todos sus campos y tipos
- [ ] El filtrado devuelve exactamente los elementos que cumplen los criterios
- [ ] El ordenamiento funciona en ambos órdenes (asc/desc)
- [ ] La búsqueda lineal encuentra elementos en arrays desordenados sin errores
- [ ] La búsqueda binaria devuelve el índice correcto o -1
- [ ] Las agregaciones calculan correctamente totales, promedios, conteos y extremos
- [ ] Las validaciones rechazan datos que incumplen las reglas de negocio
- [ ] Cero errores de compilación de TypeScript
- [ ] Existe un comando documentado para validar/ejecutar TypeScript (`npx tsc --noEmit`, `npm run typecheck`, etc.)

### Estructura y organización
- [ ] Código organizado por responsabilidad (`types`, `utils/collections`, `utils/search`, `utils/transformations`, `utils/validations`)
- [ ] Cada función con una única responsabilidad identificable
- [ ] Nombres descriptivos y convenciones de TypeScript respetadas

### Adaptación al contexto
- [ ] Todos los nombres de entidades, campos y tipos coinciden EXACTAMENTE con el CONTEXT.md
- [ ] Las validaciones corresponden a las reglas de negocio de Brasaland
- [ ] Los reportes responden a las necesidades descritas (márgenes, desperdicio, performance por locación, comparación por país)

### Calidad del código
- [ ] Funciones puras (sin dependencias externas ni mutación de estado global)
- [ ] Casos límite manejados: arrays vacíos, elementos no encontrados, valores nulos
- [ ] Mejores prácticas de TypeScript: tipos explícitos, `const`/`let` apropiado, sin `any`

---

## 10. Reglas no negociables

1. **Sin mutaciones**: `sortLocationsByCapacity` y `sortMenuItemsByPrice` deben retornar un array nuevo (usa `[...array].sort(...)`, nunca `.sort()` directo sobre el parámetro).
2. **Doble moneda siempre**: cualquier cálculo financiero debe funcionar igual de bien en USD y en COP. La tasa fija de conversión es **1 USD = 4000 COP**.
3. **Nombres exactos**: si un campo, tipo o función se llama distinto a lo especificado aquí, se considera una implementación genérica y no será aceptada.
4. **Redondeo**: todos los montos y porcentajes calculados se redondean a 2 decimales salvo que se indique lo contrario.

---

## 11. Entregable final

Al terminar la implementación, redacta un resumen (`SUMMARY.md` o sección final del README) que incluya:

1. **Qué funcionalidades implementaste** — lista breve de las funciones de cada archivo (`collections.ts`, `search.ts`, `transformations.ts`, `validations.ts`) y qué hace cada una.
2. **Qué desafíos encontraste y cómo los resolviste** — por ejemplo: manejo de doble moneda, cálculo de días operativos desde `openingYear`, orden estable sin mutar el array original, comparación case-insensitive en búsquedas, etc.
3. **Capturas de pantalla** — si implementaste la página HTML de pruebas, incluye capturas mostrando cada operación (filtrar, buscar, ordenar, generar reportes) con resultados visibles.

---

## 12. Comando de validación

Documenta y usa uno de estos comandos para verificar que el código compila sin errores:

```bash
npx tsc --noEmit
# o
npm run typecheck
# o, para ejecutar un demo directamente
npx tsx src/demo.ts
```
