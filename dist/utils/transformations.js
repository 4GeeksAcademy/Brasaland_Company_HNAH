const CURRENCIES = ["USD", "COP"];
const PAYMENT_METHODS = ["Cash", "Credit card", "Debit card", "Digital wallet"];
export function countByCategory(items, selector) {
    const counts = items.reduce((result, item) => {
        const category = selector(item);
        result.set(category, (result.get(category) ?? 0) + 1);
        return result;
    }, new Map());
    return Object.fromEntries(counts);
}
export function sumBy(items, selector) {
    return items.reduce((total, item) => total + selector(item), 0);
}
export function averageBy(items, selector) {
    return items.length === 0 ? undefined : sumBy(items, selector) / items.length;
}
export function maxBy(items, selector) {
    return items.reduce((maximum, item) => {
        return maximum === undefined || selector(item) > selector(maximum) ? item : maximum;
    }, undefined);
}
export function minBy(items, selector) {
    return items.reduce((minimum, item) => {
        return minimum === undefined || selector(item) < selector(minimum) ? item : minimum;
    }, undefined);
}
function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function sumSalesRevenue(sales, currency) {
    return sales.reduce((total, sale) => total + sale.totalPrice[currency], 0);
}
export function calculateDailyRevenue(sales, referenceDate, currency, timeZone = "America/Bogota") {
    const formatter = new Intl.DateTimeFormat("en-CA", { timeZone });
    const referenceDay = formatter.format(referenceDate);
    const matchingSales = sales.filter((sale) => formatter.format(sale.timestamp) === referenceDay);
    return roundToTwo(sumSalesRevenue(matchingSales, currency));
}
export function calculateLocationMargin(sales, menuItems, locationId, currency) {
    const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));
    const locationSales = sales.filter((sale) => sale.locationId === locationId);
    const revenue = sumSalesRevenue(locationSales, currency);
    const ingredientCost = locationSales.reduce((total, sale) => {
        const item = menuItemsById.get(sale.itemId);
        return total + (item ? item.ingredientCost[currency] * sale.quantity : 0);
    }, 0);
    return revenue === 0 ? 0 : roundToTwo(((revenue - ingredientCost) / revenue) * 100);
}
export function calculateWasteCost(wasteRecords, locationId, currency) {
    const total = wasteRecords
        .filter((record) => record.locationId === locationId)
        .reduce((sum, record) => sum + record.cost[currency], 0);
    return roundToTwo(total);
}
export function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const convertedAmount = fromCurrency === "USD" ? amount * 4000 : amount / 4000;
    return roundToTwo(convertedAmount);
}
export function scoreLocationPerformance(location, sales, wasteRecords, menuItems, referenceDate) {
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
export function rankLocationsByPerformance(locations, sales, wasteRecords, menuItems, referenceDate) {
    return locations
        .map((location) => ({ location, score: scoreLocationPerformance(location, sales, wasteRecords, menuItems, referenceDate) }))
        .sort((first, second) => second.score - first.score);
}
export function countSalesByPaymentMethod(sales) {
    const counts = Object.fromEntries(PAYMENT_METHODS.map((method) => [method, 0]));
    return sales.reduce((result, sale) => {
        result[sale.paymentMethod] += 1;
        return result;
    }, counts);
}
export function calculateAverageTicket(sales, currency) {
    return sales.length === 0 ? 0 : roundToTwo(sumSalesRevenue(sales, currency) / sales.length);
}
export function findTopSellingItems(sales, menuItems, topN) {
    if (topN <= 0) {
        return [];
    }
    const quantitiesByItemId = sales.reduce((quantities, sale) => {
        quantities.set(sale.itemId, (quantities.get(sale.itemId) ?? 0) + sale.quantity);
        return quantities;
    }, new Map());
    return menuItems
        .flatMap((item) => {
        const totalSold = quantitiesByItemId.get(item.id);
        return totalSold === undefined ? [] : [{ item, totalSold }];
    })
        .sort((first, second) => second.totalSold - first.totalSold)
        .slice(0, topN);
}
export function groupWasteByReason(wasteRecords) {
    const groups = {
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
export function calculateCountryComparison(sales, locations, menuItems) {
    void menuItems;
    const createMetrics = (country) => {
        const countryLocations = locations.filter((location) => location.country === country);
        const locationIds = new Set(countryLocations.map((location) => location.id));
        const countrySales = sales.filter((sale) => locationIds.has(sale.locationId));
        const totalRevenue = CURRENCIES.reduce((total, currency) => {
            total[currency] = roundToTwo(sumSalesRevenue(countrySales, currency));
            return total;
        }, {});
        const averageRevenuePerLocation = CURRENCIES.reduce((average, currency) => {
            average[currency] = countryLocations.length === 0 ? 0 : roundToTwo(totalRevenue[currency] / countryLocations.length);
            return average;
        }, {});
        return {
            totalLocations: countryLocations.length,
            totalRevenue,
            averageRevenuePerLocation,
            totalSales: countrySales.length,
        };
    };
    return { Colombia: createMetrics("Colombia"), USA: createMetrics("USA") };
}
function calendarDay(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day));
}
export function calculateWeeklyFloridaSales(sales, locations, referenceDate) {
    const referenceDay = calendarDay(referenceDate, "America/New_York");
    const daysSinceMonday = (new Date(referenceDay).getUTCDay() + 6) % 7;
    const weekStart = referenceDay - daysSinceMonday * 86_400_000;
    const weekEnd = weekStart + 7 * 86_400_000;
    const floridaIds = new Set(locations.filter((location) => {
        return location.country === "USA" && (location.state === undefined || ["Florida", "FL"].includes(location.state));
    }).map((location) => location.id));
    const weeklySales = sales.filter((sale) => {
        const day = calendarDay(sale.timestamp, "America/New_York");
        return floridaIds.has(sale.locationId) && day >= weekStart && day < weekEnd;
    });
    return {
        weekStart: new Date(weekStart).toISOString().slice(0, 10),
        totalSales: weeklySales.length,
        totalRevenue: { USD: roundToTwo(sumSalesRevenue(weeklySales, "USD")), COP: roundToTwo(sumSalesRevenue(weeklySales, "COP")) },
    };
}
export function calculateLocationSalesTotals(sales, locations) {
    return locations.map((location) => {
        const locationSales = sales.filter((sale) => sale.locationId === location.id);
        return {
            locationId: location.id,
            totalSales: locationSales.length,
            totalRevenue: { USD: roundToTwo(sumSalesRevenue(locationSales, "USD")), COP: roundToTwo(sumSalesRevenue(locationSales, "COP")) },
            averageTicket: { USD: calculateAverageTicket(locationSales, "USD"), COP: calculateAverageTicket(locationSales, "COP") },
        };
    });
}
export function findHighestMonthlyTicket(sales, locations, referenceDate, currency) {
    const monthlyReports = locations.flatMap((location) => {
        const timeZone = location.country === "USA" ? "America/New_York" : "America/Bogota";
        const month = new Date(calendarDay(referenceDate, timeZone)).toISOString().slice(0, 7);
        const monthlySales = sales.filter((sale) => {
            return sale.locationId === location.id && new Date(calendarDay(sale.timestamp, timeZone)).toISOString().slice(0, 7) === month;
        });
        return monthlySales.length === 0 ? [] : calculateLocationSalesTotals(monthlySales, [location]);
    });
    return maxBy(monthlyReports, (report) => report.averageTicket[currency]);
}
