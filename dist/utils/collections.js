function compareValues(first, second) {
    if (Object.is(first, second))
        return 0;
    const firstMissing = first === null || first === undefined;
    const secondMissing = second === null || second === undefined;
    if (firstMissing || secondMissing)
        return firstMissing === secondMissing ? 0 : firstMissing ? 1 : -1;
    if (first instanceof Date && second instanceof Date)
        return first.getTime() - second.getTime();
    if (typeof first === "number" && typeof second === "number")
        return first - second;
    if (typeof first === "string" && typeof second === "string")
        return first < second ? -1 : 1;
    if (typeof first === "boolean" && typeof second === "boolean")
        return Number(first) - Number(second);
    throw new TypeError("Sort fields must have comparable scalar values or dates.");
}
export function sortByMultipleFields(items, criteria) {
    return [...items].sort((first, second) => {
        for (const criterion of criteria) {
            const comparison = compareValues(first[criterion.key], second[criterion.key]);
            if (comparison !== 0)
                return comparison * (criterion.direction === "asc" ? 1 : -1);
        }
        return 0;
    });
}
export function filterSalesByLocation(sales, locationId) {
    return sales.filter((sale) => sale.locationId === locationId);
}
export function filterSalesByDateRange(sales, startDate, endDate) {
    return sales.filter((sale) => sale.timestamp >= startDate && sale.timestamp <= endDate);
}
export function filterMenuItemsByCategory(items, category) {
    return items.filter((item) => item.category === category);
}
export function filterActiveLocations(locations) {
    return locations.filter((location) => location.status === "Active");
}
export function sortLocationsByCapacity(locations, order) {
    const direction = order === "asc" ? 1 : -1;
    return [...locations].sort((first, second) => (first.seatingCapacity - second.seatingCapacity) * direction);
}
export function sortMenuItemsByPrice(items, currency, order) {
    const direction = order === "asc" ? 1 : -1;
    return [...items].sort((first, second) => (first.basePrice[currency] - second.basePrice[currency]) * direction);
}
