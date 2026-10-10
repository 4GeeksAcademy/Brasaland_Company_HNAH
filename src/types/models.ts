export interface Price {
  USD: number;
  COP: number;
}

export type MenuCategory = "Meat" | "Side" | "Beverage" | "Dessert" | "Combo";
export type MenuItemStatus = "Active" | "Seasonal" | "Discontinued";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  basePrice: Price;
  ingredientCost: Price;
  prepTimeMinutes: number;
  isAvailableInColombia: boolean;
  isAvailableInUSA: boolean;
  allergens: string[];
  status: MenuItemStatus;
}

export type PaymentMethod = "Cash" | "Credit card" | "Debit card" | "Digital wallet";

export interface SaleTransaction {
  id: string;
  customerId?: string;
  locationId: string;
  itemId: string;
  quantity: number;
  totalPrice: Price;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  waiterName: string;
}

export type Country = "Colombia" | "USA";
export type LocationStatus = "Active" | "Temporarily closed" | "Under renovation";

export interface Location {
  id: string;
  name: string;
  city: string;
  country: Country;
  state?: string;
  openingYear: number;
  seatingCapacity: number;
  staffCount: number;
  monthlyRentCost: Price;
  averageMonthlyUtilities: Price;
  manager: string;
  status: LocationStatus;
}

export type WasteReason = "Expired" | "Cooking error" | "Customer return" | "Damage" | "Other";

export interface WasteRecord {
  id: string;
  locationId: string;
  itemId: string;
  quantity: number;
  reason: WasteReason;
  cost: Price;
  timestamp: Date;
  reportedBy: string;
}

export interface CountryMetrics {
  totalLocations: number;
  totalRevenue: Price;
  averageRevenuePerLocation: Price;
  totalSales: number;
}

export interface Customer {
  id: string;
  name: string;
  country: Country;
  orderHistory: string[];
  preferences: string[];
  loyaltyPoints: number;
}

export interface Supplier {
  id: string;
  name: string;
  country: Country;
  ingredientIds: string[];
  priceHistory: { ingredientId: string; price: Price; effectiveDate: Date }[];
}

export interface Employee {
  id: string;
  name: string;
  country: Country;
  locationId: string;
  role: string;
  contractStartDate: Date;
  contractEndDate?: Date;
  absences: { startDate: Date; endDate: Date; type: string }[];
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  supplierIds: string[];
}

export interface StockRecord {
  id: string;
  locationId: string;
  ingredientId: string;
  quantity: number;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  name: string;
  ingredients: { ingredientId: string; quantity: number }[];
  instructions: string[];
  language: "es" | "en";
  updatedAt: Date;
}

export interface LocationSalesReport {
  locationId: string;
  totalSales: number;
  totalRevenue: Price;
  averageTicket: Price;
}