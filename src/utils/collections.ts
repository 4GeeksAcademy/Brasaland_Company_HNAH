import type { Location, MenuCategory, MenuItem, SaleTransaction } from "../types/models";

export function groupBy<T, Key>(items: readonly T[], selector: (item: T) => Key): Map<Key, T[]> {
  return items.reduce((groups: Map<Key, T[]>, item: T): Map<Key, T[]> => {
    const key = selector(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
    return groups;
  }, new Map<Key, T[]>());
}

function compareValues(first: unknown, second: unknown): number {
  if (Object.is(first, second)) return 0;
  const firstMissing = first === null || first === undefined;
  const secondMissing = second === null || second === undefined;
  if (firstMissing || secondMissing) return firstMissing === secondMissing ? 0 : firstMissing ? 1 : -1;
  if (first instanceof Date && second instanceof Date) return first.getTime() - second.getTime();
  if (typeof first === "number" && typeof second === "number") return first - second;
  if (typeof first === "string" && typeof second === "string") return first < second ? -1 : 1;
  if (typeof first === "boolean" && typeof second === "boolean") return Number(first) - Number(second);
  throw new TypeError("Sort fields must have comparable scalar values or dates.");
}

export function sortByMultipleFields<T>(
  items: T[],
  criteria: { key: keyof T; direction: "asc" | "desc" }[],
): T[] {
  return [...items].sort((first: T, second: T): number => {
    for (const criterion of criteria) {
      const comparison = compareValues(first[criterion.key], second[criterion.key]);
      if (comparison !== 0) return comparison * (criterion.direction === "asc" ? 1 : -1);
    }
    return 0;
  });
}

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