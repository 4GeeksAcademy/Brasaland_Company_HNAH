export function findLocationById(locations, id) {
    return locations.find((location) => location.id === id) ?? null;
}
export function findMenuItemByName(items, name) {
    const normalizedName = name.toLocaleLowerCase();
    return items.find((item) => item.name.toLocaleLowerCase() === normalizedName) ?? null;
}
export function binarySearchLocationByCapacity(sortedLocations, targetCapacity) {
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
        }
        else {
            high = middle - 1;
        }
    }
    return -1;
}
