import type { Location, MenuCategory, MenuItem, SaleTransaction } from "../types/models";

export function filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[] {
  return sales.filter((sale) => sale.locationId === locationId);
}

export function filterSalesByDateRange(sales: SaleTransaction[], startDate: Date, endDate: Date): SaleTransaction[] {
  return sales.filter((sale) => sale.timestamp >= startDate && sale.timestamp <= endDate);
}

export function filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[] {
  return items.filter((item) => item.category === category);
}

export function filterActiveLocations(locations: Location[]): Location[] {
  return locations.filter((location) => location.status === "Active");
}

export function sortLocationsByCapacity(locations: Location[], order: "asc" | "desc"): Location[] {
  const direction = order === "asc" ? 1 : -1;
  return [...locations].sort((first, second) => (first.seatingCapacity - second.seatingCapacity) * direction);
}

export function sortMenuItemsByPrice(
  items: MenuItem[],
  currency: "USD" | "COP",
  order: "asc" | "desc",
): MenuItem[] {
  const direction = order === "asc" ? 1 : -1;
  return [...items].sort((first, second) => (first.basePrice[currency] - second.basePrice[currency]) * direction);
}