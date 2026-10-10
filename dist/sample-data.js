export const sampleReferenceDate = new Date("2026-10-10T12:00:00Z");
export const sampleMenuItems = [
    { id: "ITEM-PICANHA", name: "Picanha", category: "Meat", basePrice: { USD: 18.5, COP: 74000 }, ingredientCost: { USD: 7.2, COP: 28800 }, prepTimeMinutes: 15, isAvailableInColombia: true, isAvailableInUSA: true, allergens: [], status: "Active" },
    { id: "ITEM-FRIES", name: "Papas fritas", category: "Side", basePrice: { USD: 4.5, COP: 18000 }, ingredientCost: { USD: 1.2, COP: 4800 }, prepTimeMinutes: 8, isAvailableInColombia: true, isAvailableInUSA: true, allergens: [], status: "Active" },
    { id: "ITEM-COKE", name: "Refresco", category: "Beverage", basePrice: { USD: 2.5, COP: 10000 }, ingredientCost: { USD: 0.8, COP: 3200 }, prepTimeMinutes: 2, isAvailableInColombia: true, isAvailableInUSA: true, allergens: [], status: "Active" },
    { id: "ITEM-CHICKEN", name: "Pollo a la brasa", category: "Meat", basePrice: { USD: 12, COP: 48000 }, ingredientCost: { USD: 4, COP: 16000 }, prepTimeMinutes: 20, isAvailableInColombia: true, isAvailableInUSA: true, allergens: [], status: "Active" },
];
export const sampleLocations = [
    { id: "LOC-MEDELLIN", name: "Medellin Centro", city: "Medellin", country: "Colombia", openingYear: 2008, seatingCapacity: 80, staffCount: 12, monthlyRentCost: { USD: 1500, COP: 6000000 }, averageMonthlyUtilities: { USD: 400, COP: 1600000 }, manager: "Gerencia de ejemplo", status: "Active" },
    { id: "LOC-MIAMI", name: "Miami Beach", city: "Miami", country: "USA", state: "Florida", openingYear: 2018, seatingCapacity: 100, staffCount: 15, monthlyRentCost: { USD: 5500, COP: 22000000 }, averageMonthlyUtilities: { USD: 800, COP: 3200000 }, manager: "Gerencia de ejemplo", status: "Active" },
    { id: "LOC-ORLANDO", name: "Orlando", city: "Orlando", country: "USA", state: "Florida", openingYear: 2020, seatingCapacity: 80, staffCount: 10, monthlyRentCost: { USD: 3000, COP: 12000000 }, averageMonthlyUtilities: { USD: 600, COP: 2400000 }, manager: "Gerencia de ejemplo", status: "Temporarily closed" },
    { id: "LOC-TAMPA", name: "Tampa", city: "Tampa", country: "USA", state: "Florida", openingYear: 2022, seatingCapacity: 100, staffCount: 10, monthlyRentCost: { USD: 3500, COP: 14000000 }, averageMonthlyUtilities: { USD: 600, COP: 2400000 }, manager: "Gerencia de ejemplo", status: "Active" },
];
export const sampleSales = [
    { id: "SALE-1", locationId: "LOC-MEDELLIN", itemId: "ITEM-PICANHA", quantity: 2, totalPrice: { USD: 37, COP: 148000 }, paymentMethod: "Cash", timestamp: new Date("2026-10-05T18:00:00Z"), waiterName: "Equipo de ejemplo" },
    { id: "SALE-2", locationId: "LOC-MIAMI", itemId: "ITEM-PICANHA", quantity: 3, totalPrice: { USD: 55.5, COP: 222000 }, paymentMethod: "Credit card", timestamp: new Date("2026-10-06T18:00:00Z"), waiterName: "Equipo de ejemplo" },
    { id: "SALE-3", locationId: "LOC-MIAMI", itemId: "ITEM-FRIES", quantity: 2, totalPrice: { USD: 9, COP: 36000 }, paymentMethod: "Debit card", timestamp: new Date("2026-10-07T18:00:00Z"), waiterName: "Equipo de ejemplo" },
    { id: "SALE-4", locationId: "LOC-ORLANDO", itemId: "ITEM-CHICKEN", quantity: 1, totalPrice: { USD: 12, COP: 48000 }, paymentMethod: "Digital wallet", timestamp: new Date("2026-10-04T18:00:00Z"), waiterName: "Equipo de ejemplo" },
    { id: "SALE-5", locationId: "LOC-TAMPA", itemId: "ITEM-COKE", quantity: 4, totalPrice: { USD: 10, COP: 40000 }, paymentMethod: "Cash", timestamp: new Date("2026-10-10T18:00:00Z"), waiterName: "Equipo de ejemplo" },
    { id: "SALE-6", locationId: "LOC-MIAMI", itemId: "ITEM-CHICKEN", quantity: 1, totalPrice: { USD: 12, COP: 48000 }, paymentMethod: "Cash", timestamp: new Date("2026-09-30T18:00:00Z"), waiterName: "Equipo de ejemplo" },
];
export const sampleWasteRecords = [
    { id: "WASTE-1", locationId: "LOC-MIAMI", itemId: "ITEM-FRIES", quantity: 1, reason: "Expired", cost: { USD: 1.2, COP: 4800 }, timestamp: new Date("2026-10-07T18:00:00Z"), reportedBy: "Equipo de ejemplo" },
];
