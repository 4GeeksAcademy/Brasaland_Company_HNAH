import { deepStrictEqual, ok, strictEqual } from "node:assert";
import type { Location, MenuItem, SaleTransaction } from "./types/models.js";
import * as collections from "./utils/collections.js";
import * as search from "./utils/search.js";
import * as reports from "./utils/transformations.js";
import * as validations from "./utils/validations.js";
import { sampleLocations, sampleMenuItems, sampleReferenceDate, sampleSales, sampleWasteRecords } from "./sample-data.js";

let passed = 0;
function test(name: string, check: () => void): void {
  check();
  passed += 1;
  console.log(`PASS ${name}`);
}

function unchanged<T>(input: T, operation: (value: T) => unknown): void {
  const before = structuredClone(input);
  operation(input);
  deepStrictEqual(input, before);
}

const location = sampleLocations[0];
const item = sampleMenuItems[0];
const sale = sampleSales[0];
const numberSelector = (value: number): number => value;

test("filtros exactos y rango inclusivo", (): void => {
  strictEqual(collections.filterSalesByLocation(sampleSales, "LOC-MIAMI").length, 3);
  deepStrictEqual(collections.filterSalesByDateRange(sampleSales, sale.timestamp, sale.timestamp), [sale]);
  strictEqual(collections.filterMenuItemsByCategory(sampleMenuItems, "Meat").length, 2);
  strictEqual(collections.filterActiveLocations(sampleLocations).length, 3);
});
test("colecciones vacias", (): void => {
  deepStrictEqual(collections.filterSalesByLocation([], "missing"), []);
  deepStrictEqual(collections.filterSalesByDateRange([], sampleReferenceDate, sampleReferenceDate), []);
  deepStrictEqual(collections.filterMenuItemsByCategory([], "Meat"), []);
  deepStrictEqual(collections.filterActiveLocations([]), []);
  deepStrictEqual(collections.sortLocationsByCapacity([], "asc"), []);
  deepStrictEqual(collections.sortMenuItemsByPrice([], "USD", "desc"), []);
  deepStrictEqual(collections.sortByMultipleFields([], []), []);
});
test("orden ascendente descendente y multicampo", (): void => {
  deepStrictEqual(collections.sortLocationsByCapacity(sampleLocations, "asc").map((value: Location): number => value.seatingCapacity), [80, 80, 100, 100]);
  deepStrictEqual(collections.sortLocationsByCapacity(sampleLocations, "desc").map((value: Location): number => value.seatingCapacity), [100, 100, 80, 80]);
  for (const currency of ["USD", "COP"] as const) {
    strictEqual(collections.sortMenuItemsByPrice(sampleMenuItems, currency, "asc")[0].id, "ITEM-COKE");
    strictEqual(collections.sortMenuItemsByPrice(sampleMenuItems, currency, "desc")[0].id, "ITEM-PICANHA");
  }
  const sorted = collections.sortByMultipleFields(sampleLocations, [{ key: "seatingCapacity", direction: "desc" }, { key: "name", direction: "desc" }]);
  deepStrictEqual(sorted.map((value: Location): string => value.id), ["LOC-TAMPA", "LOC-MIAMI", "LOC-ORLANDO", "LOC-MEDELLIN"]);
});
test("orden estable, fechas, null y criterios vacios", (): void => {
  const rows = [{ value: 2, id: "first" }, { value: 2, id: "second" }, { value: null, id: "null" }, { value: undefined, id: "undefined" }];
  strictEqual(collections.sortByMultipleFields(rows, [{ key: "value", direction: "asc" }])[0].id, "first");
  strictEqual(collections.sortByMultipleFields(rows, [{ key: "value", direction: "asc" }])[2].id, "null");
  strictEqual(collections.sortByMultipleFields(rows, [{ key: "value", direction: "asc" }])[3].id, "undefined");
  deepStrictEqual(collections.sortByMultipleFields(rows, []), rows);
  const dates = [{ date: new Date("2026-01-02") }, { date: new Date("2026-01-01") }];
  strictEqual(collections.sortByMultipleFields(dates, [{ key: "date", direction: "asc" }])[0], dates[1]);
});
test("busqueda lineal desordenada, vacia y ausente", (): void => {
  strictEqual(search.findLocationById([...sampleLocations].reverse(), location.id), location);
  strictEqual(search.findLocationById([], "missing"), null);
  strictEqual(search.findLocationById(sampleLocations, "missing"), null);
  strictEqual(search.findMenuItemByName(sampleMenuItems, "pIcAnHa"), item);
  strictEqual(search.findMenuItemByName([], "missing"), null);
  strictEqual(search.findMenuItemByName(sampleMenuItems, "missing"), null);
});
for (const [name, capacities, target, expected] of [
  ["vacio", [], 1, -1], ["primero", [10, 20, 30], 10, 0], ["ultimo", [10, 20, 30], 30, 2],
  ["menor", [10, 20, 30], 5, -1], ["mayor", [10, 20, 30], 40, -1], ["intermedio ausente", [10, 20, 30], 15, -1],
  ["singleton", [10], 10, 0], ["singleton ausente", [10], 20, -1],
] as [string, number[], number, number][]) {
  test(`binaria ${name}`, (): void => {
    strictEqual(search.binarySearchLocationByCapacity(capacities.map((seatingCapacity: number): Location => ({ ...location, seatingCapacity })), target), expected);
  });
}
test("binaria duplicados devuelve indice valido", (): void => {
  const rows = [10, 20, 20, 20, 30].map((seatingCapacity: number): Location => ({ ...location, seatingCapacity }));
  const index = search.binarySearchLocationByCapacity(rows, 20);
  ok(index >= 1 && index <= 3);
  strictEqual(rows[index].seatingCapacity, 20);
});
test("agregaciones genericas vacias y singleton", (): void => {
  strictEqual(reports.sumBy([], numberSelector), 0);
  strictEqual(reports.averageBy([], numberSelector), undefined);
  strictEqual(reports.maxBy([], numberSelector), undefined);
  strictEqual(reports.minBy([], numberSelector), undefined);
  for (const operation of [reports.sumBy<number>, reports.averageBy<number>, reports.maxBy<number>, reports.minBy<number>]) strictEqual(operation([7], numberSelector), 7);
  strictEqual(reports.sumBy([-2, 4], numberSelector), 2);
  strictEqual(reports.averageBy([-2, 4], numberSelector), 1);
  strictEqual(reports.maxBy([-2, 4], numberSelector), 4);
  strictEqual(reports.minBy([-2, 4], numberSelector), -2);
  deepStrictEqual(reports.countByCategory([], (value: string): string => value), {});
  deepStrictEqual(reports.countByCategory(sampleMenuItems, (value: MenuItem): string => value.category), { Meat: 2, Side: 1, Beverage: 1 });
  strictEqual(reports.countByCategory(["__proto__"], (value: string): string => value).__proto__, 1);
});
test("empates en extremos conservan el primero", (): void => {
  const rows = [{ value: 2, id: "first" }, { value: 2, id: "second" }];
  strictEqual(reports.maxBy(rows, (value: { value: number }): number => value.value), rows[0]);
  strictEqual(reports.minBy(rows, (value: { value: number }): number => value.value), rows[0]);
});
for (const currency of ["USD", "COP"] as const) {
  test(`reportes vacios y singleton ${currency}`, (): void => {
    strictEqual(reports.calculateDailyRevenue([], sampleReferenceDate, currency), 0);
    strictEqual(reports.calculateWasteCost([], location.id, currency), 0);
    strictEqual(reports.calculateLocationMargin([], [], location.id, currency), 0);
    strictEqual(reports.calculateAverageTicket([], currency), 0);
    strictEqual(reports.calculateAverageTicket([sale], currency), sale.totalPrice[currency]);
    strictEqual(reports.calculateLocationSalesTotals([sale], [location])[0].totalRevenue[currency], sale.totalPrice[currency]);
  });
}
test("reportes de ingresos, margen, desperdicio y conversion", (): void => {
  strictEqual(reports.calculateDailyRevenue(sampleSales, sampleReferenceDate, "USD"), 10);
  strictEqual(reports.calculateLocationMargin(sampleSales, sampleMenuItems, location.id, "USD"), 61.08);
  strictEqual(reports.calculateWasteCost(sampleWasteRecords, "LOC-MIAMI", "USD"), 1.2);
  strictEqual(reports.calculateAverageTicket(sampleSales, "USD"), 22.58);
  strictEqual(reports.convertCurrency(1, "USD", "COP"), 4000);
  strictEqual(reports.convertCurrency(4000, "COP", "USD"), 1);
  strictEqual(reports.convertCurrency(1.234, "USD", "USD"), 1.234);
});
test("conteos, agrupaciones y productos principales", (): void => {
  strictEqual(reports.countSalesByPaymentMethod(sampleSales).Cash, 3);
  deepStrictEqual(Object.values(reports.countSalesByPaymentMethod([])), [0, 0, 0, 0]);
  strictEqual(reports.groupWasteByReason(sampleWasteRecords).Expired.length, 1);
  ok(Object.values(reports.groupWasteByReason([])).every((records): boolean => records.length === 0));
  strictEqual(reports.findTopSellingItems(sampleSales, sampleMenuItems, 1)[0].totalSold, 5);
  deepStrictEqual(reports.findTopSellingItems([], [], 1), []);
  deepStrictEqual(reports.findTopSellingItems(sampleSales, sampleMenuItems, 0), []);
  strictEqual(reports.calculateCountryComparison(sampleSales, sampleLocations, sampleMenuItems).USA.totalRevenue.USD, 98.5);
  strictEqual(reports.calculateCountryComparison([], [], []).USA.averageRevenuePerLocation.USD, 0);
});
test("pureza temporal y zonas horarias explicitas", (): void => {
  const date = new Date("2026-10-10T12:00:00Z");
  const earlySale: SaleTransaction = { ...sale, timestamp: new Date("2026-10-10T04:00:00Z") };
  strictEqual(reports.calculateDailyRevenue([earlySale], date, "USD", "America/Bogota"), 0);
  strictEqual(reports.calculateDailyRevenue([earlySale], date, "USD", "America/New_York"), sale.totalPrice.USD);
  strictEqual(reports.scoreLocationPerformance(location, sampleSales, sampleWasteRecords, sampleMenuItems, date), reports.scoreLocationPerformance(location, sampleSales, sampleWasteRecords, sampleMenuItems, date));
  ok(Number.isFinite(reports.scoreLocationPerformance({ ...location, seatingCapacity: 0 }, [], [], [], date)));
  const negativeMargin = reports.scoreLocationPerformance(location, [sale], [], [{ ...item, ingredientCost: { USD: 1000, COP: 4000000 } }], date);
  ok(negativeMargin >= 0 && negativeMargin <= 100);
  deepStrictEqual(reports.rankLocationsByPerformance([], [], [], [], date), []);
  strictEqual(reports.rankLocationsByPerformance([location], [], [], [], date)[0].score, 20);
});
test("Florida, semanas y meses sin ventas", (): void => {
  const report = reports.calculateWeeklyFloridaSales(sampleSales, sampleLocations, sampleReferenceDate);
  deepStrictEqual(report, { weekStart: "2026-10-05", totalSales: 3, totalRevenue: { USD: 74.5, COP: 298000 } });
  strictEqual(reports.calculateWeeklyFloridaSales([], [], sampleReferenceDate).totalSales, 0);
  strictEqual(reports.findHighestMonthlyTicket([], sampleLocations, sampleReferenceDate, "USD"), undefined);
  strictEqual(reports.findHighestMonthlyTicket(sampleSales, sampleLocations, sampleReferenceDate, "USD")?.locationId, "LOC-MEDELLIN");
  strictEqual(reports.findHighestMonthlyTicket(sampleSales, sampleLocations, new Date("2030-01-01"), "COP"), undefined);
});
test("Florida limite de semana y cambio de horario", (): void => {
  const florida: Location = { ...location, id: "FL", country: "USA", state: "Florida" };
  const other: Location = { ...florida, id: "CA", state: "California" };
  const dates = ["2026-11-02T04:59:59Z", "2026-11-02T05:00:00Z", "2026-11-09T04:59:59Z", "2026-11-09T05:00:00Z"];
  const sales = dates.map((timestamp: string): SaleTransaction => ({ ...sale, locationId: "FL", timestamp: new Date(timestamp) }));
  const report = reports.calculateWeeklyFloridaSales([...sales, { ...sales[1], locationId: "CA" }], [florida, other], new Date("2026-11-04T12:00:00Z"));
  strictEqual(report.totalSales, 2);
  strictEqual(report.totalRevenue.USD, 74);
});
for (const [name, validator, valid] of [
  ["menu", validations.validateMenuItem, item],
  ["venta", validations.validateSaleTransaction, sale],
  ["sede", (value: unknown): validations.ValidationResult => validations.validateLocation(value, sampleReferenceDate), location],
] as [string, (value: unknown) => validations.ValidationResult, unknown][]) {
  test(`validador ${name} acepta datos de ejemplo`, (): void => strictEqual(validator(valid).valid, true));
  for (const invalid of [null, undefined, {}, [], NaN, Infinity]) test(`validador ${name} rechaza ${String(invalid)}`, (): void => strictEqual(validator(invalid).valid, false));
}
test("validadores rechazan campos ausentes y valores no finitos", (): void => {
  for (const invalid of [NaN, Infinity, -Infinity, -1, 0]) {
    strictEqual(validations.validateMenuItem({ ...item, basePrice: { USD: invalid, COP: 1 } }).valid, false);
    strictEqual(validations.validateSaleTransaction({ ...sale, quantity: invalid }).valid, false);
    strictEqual(validations.validateLocation({ ...location, seatingCapacity: invalid }, sampleReferenceDate).valid, false);
  }
  strictEqual(validations.validateMenuItem({ ...item, id: undefined }).valid, false);
  strictEqual(validations.validateSaleTransaction({ ...sale, timestamp: new Date("invalid") }).valid, false);
  strictEqual(validations.validateLocation({ ...location, name: undefined }, sampleReferenceDate).valid, false);
  strictEqual(validations.validateLocation(location, new Date("invalid")).valid, false);
  strictEqual(validations.validateSaleTransaction({ ...sale, timestamp: new Date("2999-01-01") }).valid, true);
});
test("restricciones heredadas explicitamente documentadas", (): void => {
  strictEqual(validations.validateMenuItem({ ...item, prepTimeMinutes: 61 }).valid, false);
  strictEqual(validations.validateMenuItem({ ...item, name: " " }).valid, false);
  strictEqual(validations.validateMenuItem({ ...item, isAvailableInColombia: false, isAvailableInUSA: false }).valid, false);
  strictEqual(validations.validateLocation({ ...location, openingYear: 2007 }, sampleReferenceDate).valid, false);
  strictEqual(validations.validateLocation({ ...location, openingYear: 2027 }, sampleReferenceDate).valid, false);
});
test("no mutacion en todas las operaciones", (): void => {
  unchanged(sampleLocations, (rows: Location[]): unknown => {
    collections.filterActiveLocations(rows);
    collections.sortLocationsByCapacity(rows, "desc");
    collections.sortByMultipleFields(rows, [{ key: "name", direction: "asc" }]);
    search.findLocationById(rows, "missing");
    search.binarySearchLocationByCapacity(rows, 100);
    reports.rankLocationsByPerformance(rows, sampleSales, sampleWasteRecords, sampleMenuItems, sampleReferenceDate);
    reports.calculateLocationSalesTotals(sampleSales, rows);
    reports.calculateCountryComparison(sampleSales, rows, sampleMenuItems);
    reports.findHighestMonthlyTicket(sampleSales, rows, sampleReferenceDate, "USD");
    reports.calculateWeeklyFloridaSales(sampleSales, rows, sampleReferenceDate);
    return validations.validateLocation(rows[0], sampleReferenceDate);
  });
  unchanged(sampleSales, (rows: SaleTransaction[]): unknown => {
    collections.filterSalesByLocation(rows, location.id);
    collections.filterSalesByDateRange(rows, sampleReferenceDate, sampleReferenceDate);
    reports.calculateDailyRevenue(rows, sampleReferenceDate, "COP");
    reports.calculateLocationMargin(rows, sampleMenuItems, location.id, "USD");
    reports.calculateAverageTicket(rows, "USD");
    reports.countSalesByPaymentMethod(rows);
    reports.findTopSellingItems(rows, sampleMenuItems, 2);
    return validations.validateSaleTransaction(rows[0]);
  });
  unchanged(sampleMenuItems, (rows: MenuItem[]): unknown => {
    collections.filterMenuItemsByCategory(rows, "Meat");
    collections.sortMenuItemsByPrice(rows, "USD", "asc");
    search.findMenuItemByName(rows, "missing");
    reports.countByCategory(rows, (value: MenuItem): string => value.category);
    const selector = (value: MenuItem): number => value.basePrice.USD;
    reports.sumBy(rows, selector);
    reports.averageBy(rows, selector);
    reports.maxBy(rows, selector);
    reports.minBy(rows, selector);
    return validations.validateMenuItem(rows[0]);
  });
  unchanged(sampleWasteRecords, (rows): unknown => {
    reports.calculateWasteCost(rows, "LOC-MIAMI", "USD");
    return reports.groupWasteByReason(rows);
  });
});
console.log(`Demo completado: ${passed} pruebas correctas.`);