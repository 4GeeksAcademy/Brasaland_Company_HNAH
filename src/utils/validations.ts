import type { Location, MenuItem, SaleTransaction } from "../types/models";

export function validateMenuItem(item: MenuItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (item.basePrice.USD <= 0 || item.basePrice.COP <= 0) {
    errors.push("Base prices in USD and COP must be greater than zero.");
  }
  if (item.prepTimeMinutes <= 0 || item.prepTimeMinutes > 60) {
    errors.push("Preparation time must be greater than zero and no more than 60 minutes.");
  }
  if (item.name.trim().length === 0) {
    errors.push("Menu item name cannot be empty.");
  }
  if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
    errors.push("Menu item must be available in at least one country.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateSaleTransaction(sale: SaleTransaction): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (sale.quantity <= 0) {
    errors.push("Sale quantity must be greater than zero.");
  }
  if (sale.totalPrice.USD <= 0 || sale.totalPrice.COP <= 0) {
    errors.push("Total prices in USD and COP must be greater than zero.");
  }
  if (sale.waiterName.trim().length === 0) {
    errors.push("Waiter name cannot be empty.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateLocation(location: Location, referenceDate: Date): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const currentYear = referenceDate.getUTCFullYear();

  if (location.openingYear < 2008 || location.openingYear > currentYear) {
    errors.push("Opening year must be between 2008 and the current year.");
  }
  if (location.seatingCapacity <= 0) {
    errors.push("Seating capacity must be greater than zero.");
  }
  if (location.staffCount <= 0) {
    errors.push("Staff count must be greater than zero.");
  }
  if (location.monthlyRentCost.USD <= 0 || location.monthlyRentCost.COP <= 0) {
    errors.push("Monthly rent costs in USD and COP must be greater than zero.");
  }
  if (location.averageMonthlyUtilities.USD <= 0 || location.averageMonthlyUtilities.COP <= 0) {
    errors.push("Average monthly utilities in USD and COP must be greater than zero.");
  }

  return { valid: errors.length === 0, errors };
}