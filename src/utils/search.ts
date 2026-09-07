import type { Location, MenuItem } from "../types/models";

export function findLocationById(locations: Location[], id: string): Location | null {
  return locations.find((location) => location.id === id) ?? null;
}

export function findMenuItemByName(items: MenuItem[], name: string): MenuItem | null {
  const normalizedName = name.toLocaleLowerCase();
  return items.find((item) => item.name.toLocaleLowerCase() === normalizedName) ?? null;
}

export function binarySearchLocationByCapacity(sortedLocations: Location[], targetCapacity: number): number {
  let low = 0;
  let high = sortedLocations.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const capacity = sortedLocations[middle].seatingCapacity;

    if (capacity === targetCapacity) {
      return middle;
    }

    if (capacity < targetCapacity) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return -1;
}