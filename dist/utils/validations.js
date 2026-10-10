function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validateString(value, field, errors) {
    if (typeof value !== "string" || value.trim().length === 0)
        errors.push(`${field} must be a non-empty string.`);
}
function validateNumber(value, field, errors, minimum = 0, allowMinimum = false) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || (!allowMinimum && value === minimum)) {
        errors.push(`${field} must be finite and ${allowMinimum ? "at least" : "greater than"} ${minimum}.`);
    }
}
function validatePrice(value, field, errors) {
    if (!isRecord(value)) {
        errors.push(`${field} must contain USD and COP prices.`);
        return;
    }
    validateNumber(value.USD, `${field}.USD`, errors);
    validateNumber(value.COP, `${field}.COP`, errors);
}
function validateChoice(value, choices, field, errors) {
    if (typeof value !== "string" || !choices.includes(value))
        errors.push(`${field} has an invalid value.`);
}
function validateDate(value, field, errors) {
    if (!(value instanceof Date) || !Number.isFinite(value.getTime()))
        errors.push(`${field} must be a valid Date.`);
}
export function validateMenuItem(item) {
    if (!isRecord(item))
        return { valid: false, errors: ["Menu item must be an object."] };
    const errors = [];
    validateString(item.id, "id", errors);
    validateString(item.name, "name", errors);
    validateChoice(item.category, ["Meat", "Side", "Beverage", "Dessert", "Combo"], "category", errors);
    validateChoice(item.status, ["Active", "Seasonal", "Discontinued"], "status", errors);
    validatePrice(item.basePrice, "basePrice", errors);
    if (!isRecord(item.ingredientCost)) {
        errors.push("ingredientCost must contain USD and COP costs.");
    }
    else {
        for (const currency of ["USD", "COP"])
            validateNumber(item.ingredientCost[currency], `ingredientCost.${currency}`, errors, 0, true);
    }
    validateNumber(item.prepTimeMinutes, "prepTimeMinutes", errors);
    if (typeof item.prepTimeMinutes === "number" && item.prepTimeMinutes > 60)
        errors.push("prepTimeMinutes must not exceed 60.");
    if (typeof item.isAvailableInColombia !== "boolean" || typeof item.isAvailableInUSA !== "boolean") {
        errors.push("Country availability must be boolean.");
    }
    else if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
        errors.push("Menu item must be available in at least one country.");
    }
    if (!Array.isArray(item.allergens) || !item.allergens.every((value) => typeof value === "string")) {
        errors.push("allergens must be an array of strings.");
    }
    return { valid: errors.length === 0, errors };
}
export function validateSaleTransaction(sale) {
    if (!isRecord(sale))
        return { valid: false, errors: ["Sale must be an object."] };
    const errors = [];
    for (const field of ["id", "locationId", "itemId", "waiterName"])
        validateString(sale[field], field, errors);
    validateNumber(sale.quantity, "quantity", errors);
    validatePrice(sale.totalPrice, "totalPrice", errors);
    validateChoice(sale.paymentMethod, ["Cash", "Credit card", "Debit card", "Digital wallet"], "paymentMethod", errors);
    validateDate(sale.timestamp, "timestamp", errors);
    return { valid: errors.length === 0, errors };
}
export function validateLocation(location, referenceDate) {
    if (!isRecord(location))
        return { valid: false, errors: ["Location must be an object."] };
    const errors = [];
    for (const field of ["id", "name", "city", "manager"])
        validateString(location[field], field, errors);
    validateChoice(location.country, ["Colombia", "USA"], "country", errors);
    validateChoice(location.status, ["Active", "Temporarily closed", "Under renovation"], "status", errors);
    validateDate(referenceDate, "referenceDate", errors);
    validateNumber(location.openingYear, "openingYear", errors, 2007);
    if (referenceDate instanceof Date && typeof location.openingYear === "number" && location.openingYear > referenceDate.getUTCFullYear()) {
        errors.push("openingYear must not exceed the reference year.");
    }
    validateNumber(location.seatingCapacity, "seatingCapacity", errors);
    validateNumber(location.staffCount, "staffCount", errors);
    validatePrice(location.monthlyRentCost, "monthlyRentCost", errors);
    validatePrice(location.averageMonthlyUtilities, "averageMonthlyUtilities", errors);
    return { valid: errors.length === 0, errors };
}
