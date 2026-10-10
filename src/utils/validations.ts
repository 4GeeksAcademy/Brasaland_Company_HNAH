export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) errors.push(`${field} must be a non-empty string.`);
}

function validateNumber(value: unknown, field: string, errors: string[], minimum: number = 0, allowMinimum: boolean = false): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || (!allowMinimum && value === minimum)) {
    errors.push(`${field} must be finite and ${allowMinimum ? "at least" : "greater than"} ${minimum}.`);
  }
}

function validatePrice(value: unknown, field: string, errors: string[], allowZero: boolean = false): void {
  if (!isRecord(value)) {
    errors.push(`${field} must contain USD and COP prices.`);
    return;
  }
  validateNumber(value.USD, `${field}.USD`, errors, 0, allowZero);
  validateNumber(value.COP, `${field}.COP`, errors, 0, allowZero);
}

function validateChoice(value: unknown, choices: readonly string[], field: string, errors: string[]): void {
  if (typeof value !== "string" || !choices.includes(value)) errors.push(`${field} has an invalid value.`);
}

function validateDate(value: unknown, field: string, errors: string[]): void {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) errors.push(`${field} must be a valid Date.`);
}

function validateStringArray(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings.`);
    return;
  }
  value.forEach((entry: unknown, index: number): void => validateString(entry, `${field}[${index}]`, errors));
}

function validateDateRange(start: unknown, end: unknown, field: string, errors: string[]): void {
  validateDate(start, `${field}.start`, errors);
  validateDate(end, `${field}.end`, errors);
  if (start instanceof Date && end instanceof Date && start.getTime() > end.getTime()) {
    errors.push(`${field}.end must not be before its start.`);
  }
}

function validateIdentity(value: Record<string, unknown>, errors: string[]): void {
  validateString(value.id, "id", errors);
  validateString(value.name, "name", errors);
  validateChoice(value.country, ["Colombia", "USA"], "country", errors);
}

export function validateMenuItem(item: unknown): ValidationResult {
  if (!isRecord(item)) return { valid: false, errors: ["Menu item must be an object."] };
  const errors: string[] = [];
  validateString(item.id, "id", errors);
  validateString(item.name, "name", errors);
  validateChoice(item.category, ["Meat", "Side", "Beverage", "Dessert", "Combo"], "category", errors);
  validateChoice(item.status, ["Active", "Seasonal", "Discontinued"], "status", errors);
  validatePrice(item.basePrice, "basePrice", errors);
  if (!isRecord(item.ingredientCost)) {
    errors.push("ingredientCost must contain USD and COP costs.");
  } else {
    for (const currency of ["USD", "COP"]) validateNumber(item.ingredientCost[currency], `ingredientCost.${currency}`, errors, 0, true);
  }
  validateNumber(item.prepTimeMinutes, "prepTimeMinutes", errors);
  if (typeof item.prepTimeMinutes === "number" && item.prepTimeMinutes > 60) errors.push("prepTimeMinutes must not exceed 60.");
  if (typeof item.isAvailableInColombia !== "boolean" || typeof item.isAvailableInUSA !== "boolean") {
    errors.push("Country availability must be boolean.");
  } else if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
    errors.push("Menu item must be available in at least one country.");
  }
  if (!Array.isArray(item.allergens) || !item.allergens.every((value: unknown): boolean => typeof value === "string")) {
    errors.push("allergens must be an array of strings.");
  }
  return { valid: errors.length === 0, errors };
}

export function validateSaleTransaction(sale: unknown): ValidationResult {
  if (!isRecord(sale)) return { valid: false, errors: ["Sale must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "locationId", "itemId", "waiterName"]) validateString(sale[field], field, errors);
  if (sale.customerId !== undefined) validateString(sale.customerId, "customerId", errors);
  validateNumber(sale.quantity, "quantity", errors);
  validatePrice(sale.totalPrice, "totalPrice", errors);
  validateChoice(sale.paymentMethod, ["Cash", "Credit card", "Debit card", "Digital wallet"], "paymentMethod", errors);
  validateDate(sale.timestamp, "timestamp", errors);
  return { valid: errors.length === 0, errors };
}

export function validateLocation(location: unknown, referenceDate: Date): ValidationResult {
  if (!isRecord(location)) return { valid: false, errors: ["Location must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "name", "city", "manager"]) validateString(location[field], field, errors);
  validateChoice(location.country, ["Colombia", "USA"], "country", errors);
  if (location.state !== undefined) validateString(location.state, "state", errors);
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

export function validateCustomer(customer: unknown): ValidationResult {
  if (!isRecord(customer)) return { valid: false, errors: ["Customer must be an object."] };
  const errors: string[] = [];
  validateIdentity(customer, errors);
  validateStringArray(customer.orderHistory, "orderHistory", errors);
  validateStringArray(customer.preferences, "preferences", errors);
  validateNumber(customer.loyaltyPoints, "loyaltyPoints", errors, 0, true);
  return { valid: errors.length === 0, errors };
}

export function validateSupplier(supplier: unknown): ValidationResult {
  if (!isRecord(supplier)) return { valid: false, errors: ["Supplier must be an object."] };
  const errors: string[] = [];
  validateIdentity(supplier, errors);
  validateStringArray(supplier.ingredientIds, "ingredientIds", errors);
  if (!Array.isArray(supplier.priceHistory)) {
    errors.push("priceHistory must be an array.");
  } else {
    supplier.priceHistory.forEach((entry: unknown, index: number): void => {
      const field = `priceHistory[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${field} must be an object.`);
        return;
      }
      validateString(entry.ingredientId, `${field}.ingredientId`, errors);
      validatePrice(entry.price, `${field}.price`, errors, true);
      validateDate(entry.effectiveDate, `${field}.effectiveDate`, errors);
    });
  }
  return { valid: errors.length === 0, errors };
}

export function validateEmployee(employee: unknown): ValidationResult {
  if (!isRecord(employee)) return { valid: false, errors: ["Employee must be an object."] };
  const errors: string[] = [];
  validateIdentity(employee, errors);
  validateString(employee.locationId, "locationId", errors);
  validateString(employee.role, "role", errors);
  if (employee.contractEndDate === undefined) validateDate(employee.contractStartDate, "contractStartDate", errors);
  else validateDateRange(employee.contractStartDate, employee.contractEndDate, "contract", errors);
  if (!Array.isArray(employee.absences)) {
    errors.push("absences must be an array.");
  } else {
    employee.absences.forEach((entry: unknown, index: number): void => {
      const field = `absences[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${field} must be an object.`);
        return;
      }
      validateString(entry.type, `${field}.type`, errors);
      validateDateRange(entry.startDate, entry.endDate, field, errors);
    });
  }
  return { valid: errors.length === 0, errors };
}

export function validateIngredient(ingredient: unknown): ValidationResult {
  if (!isRecord(ingredient)) return { valid: false, errors: ["Ingredient must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "name", "unit"]) validateString(ingredient[field], field, errors);
  validateStringArray(ingredient.supplierIds, "supplierIds", errors);
  return { valid: errors.length === 0, errors };
}

export function validateStockRecord(stock: unknown): ValidationResult {
  if (!isRecord(stock)) return { valid: false, errors: ["Stock record must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "locationId", "ingredientId"]) validateString(stock[field], field, errors);
  validateNumber(stock.quantity, "quantity", errors, 0, true);
  validateDate(stock.updatedAt, "updatedAt", errors);
  return { valid: errors.length === 0, errors };
}

export function validateRecipe(recipe: unknown): ValidationResult {
  if (!isRecord(recipe)) return { valid: false, errors: ["Recipe must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "menuItemId", "name"]) validateString(recipe[field], field, errors);
  validateChoice(recipe.language, ["es", "en"], "language", errors);
  validateDate(recipe.updatedAt, "updatedAt", errors);
  validateStringArray(recipe.instructions, "instructions", errors);
  if (!Array.isArray(recipe.ingredients)) {
    errors.push("ingredients must be an array.");
  } else {
    recipe.ingredients.forEach((entry: unknown, index: number): void => {
      const field = `ingredients[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${field} must be an object.`);
        return;
      }
      validateString(entry.ingredientId, `${field}.ingredientId`, errors);
      validateNumber(entry.quantity, `${field}.quantity`, errors, 0, true);
    });
  }
  return { valid: errors.length === 0, errors };
}

export function validateWasteRecord(record: unknown): ValidationResult {
  if (!isRecord(record)) return { valid: false, errors: ["Waste record must be an object."] };
  const errors: string[] = [];
  for (const field of ["id", "locationId", "itemId", "reportedBy"]) validateString(record[field], field, errors);
  validateNumber(record.quantity, "quantity", errors, 0, true);
  validateChoice(record.reason, ["Expired", "Cooking error", "Customer return", "Damage", "Other"], "reason", errors);
  validatePrice(record.cost, "cost", errors, true);
  validateDate(record.timestamp, "timestamp", errors);
  return { valid: errors.length === 0, errors };
}