import type {
  CountryMetrics,
  Location,
  MenuItem,
  PaymentMethod,
  Price,
  SaleTransaction,
  WasteReason,
  WasteRecord,
} from "../types/models";

const CURRENCIES = ["USD", "COP"] as const;
const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Credit card", "Debit card", "Digital wallet"];

export function countByCategory<T>(items: readonly T[], selector: (item: T) => string): Record<string, number> {
  const counts = items.reduce((result: Map<string, number>, item: T): Map<string, number> => {
    const category = selector(item);
    result.set(category, (result.get(category) ?? 0) + 1);
    return result;
  }, new Map<string, number>());
  return Object.fromEntries(counts);
}

export function sumBy<T>(items: readonly T[], selector: (item: T) => number): number {
  return items.reduce((total: number, item: T): number => total + selector(item), 0);
}

export function averageBy<T>(items: readonly T[], selector: (item: T) => number): number | undefined {
  return items.length === 0 ? undefined : sumBy(items, selector) / items.length;
}

export function maxBy<T>(items: readonly T[], selector: (item: T) => number): T | undefined {
  return items.reduce((maximum: T | undefined, item: T): T => {
    return maximum === undefined || selector(item) > selector(maximum) ? item : maximum;
  }, undefined as T | undefined);
}

export function minBy<T>(items: readonly T[], selector: (item: T) => number): T | undefined {
  return items.reduce((minimum: T | undefined, item: T): T => {
    return minimum === undefined || selector(item) < selector(minimum) ? item : minimum;
  }, undefined as T | undefined);
}

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sumSalesRevenue(sales: SaleTransaction[], currency: keyof Price): number {
  return sales.reduce((total, sale) => total + sale.totalPrice[currency], 0);
}

export function calculateDailyRevenue(
  sales: SaleTransaction[],
  referenceDate: Date,
  currency: "USD" | "COP",
  timeZone: string = "America/Bogota",
): number {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone });
  const referenceDay = formatter.format(referenceDate);
  const matchingSales = sales.filter((sale) => formatter.format(sale.timestamp) === referenceDay);
  return roundToTwo(sumSalesRevenue(matchingSales, currency));
}

export function calculateLocationMargin(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  locationId: string,
  currency: "USD" | "COP",
): number {
  const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));
  const locationSales = sales.filter((sale) => sale.locationId === locationId);
  const revenue = sumSalesRevenue(locationSales, currency);
  const ingredientCost = locationSales.reduce((total, sale) => {
    const item = menuItemsById.get(sale.itemId);
    return total + (item ? item.ingredientCost[currency] * sale.quantity : 0);
  }, 0);

  return revenue === 0 ? 0 : roundToTwo(((revenue - ingredientCost) / revenue) * 100);
}

export function calculateWasteCost(wasteRecords: WasteRecord[], locationId: string, currency: "USD" | "COP"): number {
  const total = wasteRecords
    .filter((record) => record.locationId === locationId)
    .reduce((sum, record) => sum + record.cost[currency], 0);
  return roundToTwo(total);
}

export function convertCurrency(amount: number, fromCurrency: "USD" | "COP", toCurrency: "USD" | "COP"): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const convertedAmount = fromCurrency === "USD" ? amount * 4000 : amount / 4000;
  return roundToTwo(convertedAmount);
}

export function scoreLocationPerformance(
  location: Location,
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[],
  referenceDate: Date,
): number {
  const locationSales = sales.filter((sale) => sale.locationId === location.id);
  const revenue = sumSalesRevenue(locationSales, "USD");
  const openingDate = new Date(Date.UTC(location.openingYear, 0, 1));
  const operatingDays = Math.max(1, Math.ceil((referenceDate.getTime() - openingDate.getTime()) / 86_400_000));
  const revenueScore = Math.min((revenue / operatingDays / 1000) * 40, 40);
  const efficiencyScore = location.seatingCapacity <= 0 ? 0 : Math.min((locationSales.length / location.seatingCapacity) * 30, 30);
  const wastePercentage = revenue === 0 ? 0 : (calculateWasteCost(wasteRecords, location.id, "USD") / revenue) * 100;
  const wasteControlScore = Math.max(20 - wastePercentage * 2, 0);
  const marginScore = Math.max(0, Math.min(calculateLocationMargin(sales, menuItems, location.id, "USD") / 10, 10));

  return roundToTwo(revenueScore + efficiencyScore + wasteControlScore + marginScore);
}

export function rankLocationsByPerformance(
  locations: Location[],
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[],
  referenceDate: Date,
): Array<{ location: Location; score: number }> {
  return locations
    .map((location) => ({ location, score: scoreLocationPerformance(location, sales, wasteRecords, menuItems, referenceDate) }))
    .sort((first, second) => second.score - first.score);
}

export function countSalesByPaymentMethod(sales: SaleTransaction[]): Record<PaymentMethod, number> {
  const counts = Object.fromEntries(PAYMENT_METHODS.map((method) => [method, 0])) as Record<PaymentMethod, number>;
  return sales.reduce((result, sale) => {
    result[sale.paymentMethod] += 1;
    return result;
  }, counts);
}

export function calculateAverageTicket(sales: SaleTransaction[], currency: "USD" | "COP"): number {
  return sales.length === 0 ? 0 : roundToTwo(sumSalesRevenue(sales, currency) / sales.length);
}

export function findTopSellingItems(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  topN: number,
): Array<{ item: MenuItem; totalSold: number }> {
  if (topN <= 0) {
    return [];
  }

  const quantitiesByItemId = sales.reduce((quantities, sale) => {
    quantities.set(sale.itemId, (quantities.get(sale.itemId) ?? 0) + sale.quantity);
    return quantities;
  }, new Map<string, number>());

  return menuItems
    .flatMap((item) => {
      const totalSold = quantitiesByItemId.get(item.id);
      return totalSold === undefined ? [] : [{ item, totalSold }];
    })
    .sort((first, second) => second.totalSold - first.totalSold)
    .slice(0, topN);
}

export function groupWasteByReason(wasteRecords: WasteRecord[]): Record<WasteReason, WasteRecord[]> {
  const groups: Record<WasteReason, WasteRecord[]> = {
    Expired: [],
    "Cooking error": [],
    "Customer return": [],
    Damage: [],
    Other: [],
  };
  return wasteRecords.reduce((result, record) => {
    result[record.reason].push(record);
    return result;
  }, groups);
}

export function calculateCountryComparison(
  sales: SaleTransaction[],
  locations: Location[],
  menuItems: MenuItem[],
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  void menuItems;

  const createMetrics = (country: "Colombia" | "USA"): CountryMetrics => {
    const countryLocations = locations.filter((location) => location.country === country);
    const locationIds = new Set(countryLocations.map((location) => location.id));
    const countrySales = sales.filter((sale) => locationIds.has(sale.locationId));
    const totalRevenue = CURRENCIES.reduce((total, currency) => {
      total[currency] = roundToTwo(sumSalesRevenue(countrySales, currency));
      return total;
    }, {} as Price);
    const averageRevenuePerLocation = CURRENCIES.reduce((average, currency) => {
      average[currency] = countryLocations.length === 0 ? 0 : roundToTwo(totalRevenue[currency] / countryLocations.length);
      return average;
    }, {} as Price);

    return {
      totalLocations: countryLocations.length,
      totalRevenue,
      averageRevenuePerLocation,
      totalSales: countrySales.length,
    };
  };

  return { Colombia: createMetrics("Colombia"), USA: createMetrics("USA") };
}