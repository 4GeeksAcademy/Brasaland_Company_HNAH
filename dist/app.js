import { filterMenuItemsByCategory, sortByMultipleFields, sortLocationsByCapacity } from "./utils/collections.js";
import { binarySearchLocationByCapacity, findLocationById } from "./utils/search.js";
import { averageBy, calculateLocationSalesTotals, calculateWeeklyFloridaSales, countByCategory, findHighestMonthlyTicket, maxBy, minBy, sumBy } from "./utils/transformations.js";
import { sampleLocations, sampleMenuItems, sampleSales } from "./sample-data.js";
function element(id) {
    const result = document.getElementById(id);
    if (!result)
        throw new Error(`Missing interface element: ${id}`);
    return result;
}
function value(id) {
    const control = element(id);
    if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLSelectElement))
        throw new Error(`Invalid control: ${id}`);
    return control.value;
}
function showResults(title, headers, rows) {
    element("result-title").textContent = title;
    element("result-status").textContent = rows.length === 0 ? "Sin resultados" : `${rows.length} resultado${rows.length === 1 ? "" : "s"}`;
    const headerRow = document.createElement("tr");
    for (const header of headers) {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.className = "px-3 py-3 font-medium";
        cell.textContent = header;
        headerRow.append(cell);
    }
    element("result-head").replaceChildren(headerRow);
    const bodyRows = rows.map((row) => {
        const tableRow = document.createElement("tr");
        for (const item of row) {
            const cell = document.createElement("td");
            cell.className = "px-3 py-3 align-top";
            cell.textContent = item === undefined || item === null ? "Sin datos" : String(item);
            tableRow.append(cell);
        }
        return tableRow;
    });
    element("result-body").replaceChildren(...bodyRows);
}
function showLocations(title, locations) {
    showResults(title, ["ID", "Sede", "País", "Capacidad", "Estado"], locations.map((location) => [location.id, location.name, location.country, location.seatingCapacity, location.status]));
}
function showTotals(title, reports) {
    showResults(title, ["Sede", "Ventas", "Total USD", "Total COP", "Ticket USD", "Ticket COP"], reports.map((report) => [report.locationId, report.totalSales, report.totalRevenue.USD, report.totalRevenue.COP, report.averageTicket.USD, report.averageTicket.COP]));
}
function onSubmit(id, action) {
    element(id).addEventListener("submit", (event) => {
        event.preventDefault();
        try {
            action();
        }
        catch (error) {
            showResults("Operación no disponible", [], []);
            element("result-status").textContent = error instanceof Error ? error.message : "Datos inválidos";
        }
    });
}
function initialize() {
    onSubmit("filter-form", () => {
        const category = value("filter-category");
        const items = category === "All" ? sampleMenuItems : filterMenuItemsByCategory(sampleMenuItems, category);
        showResults("Menú filtrado", ["ID", "Producto", "Categoría", "USD", "COP"], items.map((item) => [item.id, item.name, item.category, item.basePrice.USD, item.basePrice.COP]));
    });
    element("search-mode").addEventListener("change", () => {
        const control = element("search-query");
        if (control instanceof HTMLInputElement) {
            const binary = value("search-mode") === "binary";
            control.type = binary ? "number" : "text";
            control.value = binary ? "100" : "LOC-MIAMI";
            element("search-label").textContent = binary ? "Capacidad" : "ID de sede";
        }
    });
    onSubmit("search-form", () => {
        if (value("search-mode") === "linear") {
            const location = findLocationById(sampleLocations, value("search-query").trim());
            showLocations("Búsqueda lineal", location ? [location] : []);
        }
        else {
            const capacity = Number(value("search-query"));
            if (!Number.isFinite(capacity))
                throw new Error("La capacidad debe ser un número finito.");
            const sorted = sortLocationsByCapacity(sampleLocations, "asc");
            const index = binarySearchLocationByCapacity(sorted, capacity);
            showLocations(`Búsqueda binaria · índice ${index}`, index === -1 ? [] : [sorted[index]]);
        }
    });
    onSubmit("sort-form", () => {
        const sorted = sortByMultipleFields(sampleLocations, [
            { key: "seatingCapacity", direction: value("sort-direction") === "desc" ? "desc" : "asc" },
            { key: "name", direction: value("sort-secondary") === "desc" ? "desc" : "asc" },
        ]);
        showLocations("Sedes ordenadas", sorted);
    });
    onSubmit("report-form", () => {
        const referenceDate = new Date(`${value("report-date")}T12:00:00Z`);
        if (!Number.isFinite(referenceDate.getTime()))
            throw new Error("La fecha debe ser válida.");
        const currency = value("report-currency") === "COP" ? "COP" : "USD";
        const kind = value("report-kind");
        if (kind === "florida") {
            const report = calculateWeeklyFloridaSales(sampleSales, sampleLocations, referenceDate);
            showResults("Ventas semanales de Florida", ["Semana desde", "Ventas", "USD", "COP"], [[report.weekStart, report.totalSales, report.totalRevenue.USD, report.totalRevenue.COP]]);
        }
        else if (kind === "ticket") {
            const report = findHighestMonthlyTicket(sampleSales, sampleLocations, referenceDate, currency);
            showTotals(`Mayor ticket mensual · ${currency}`, report ? [report] : []);
        }
        else if (kind === "categories") {
            showResults("Conteo por categoría", ["Categoría", "Productos"], Object.entries(countByCategory(sampleMenuItems, (item) => item.category)));
        }
        else if (kind === "summary") {
            const selector = (item) => item.basePrice[currency];
            showResults(`Resumen de precios · ${currency}`, ["Total", "Promedio", "Máximo", "Mínimo"], [[sumBy(sampleMenuItems, selector), averageBy(sampleMenuItems, selector), maxBy(sampleMenuItems, selector)?.name, minBy(sampleMenuItems, selector)?.name]]);
        }
        else {
            showTotals("Totales por sede", calculateLocationSalesTotals(sampleSales, sampleLocations));
        }
    });
    showTotals("Totales por sede", calculateLocationSalesTotals(sampleSales, sampleLocations));
}
initialize();
