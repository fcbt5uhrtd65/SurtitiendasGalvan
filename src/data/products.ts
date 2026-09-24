export interface Product {
  id: string;
  variantId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  categoryId: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  description: string;
  features: string[];
  stock: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  color: string;
  subcategories: string[];
}

// Computed at runtime so it stays accurate as products change
export const getCategoryCount = (categoryId: string, list: Product[]) =>
  list.filter(p => p.categoryId === categoryId).length;

// Fixed end date for flash sale countdown (end of day Sep 30 2026)
export const FLASH_SALE_END = new Date('2026-09-30T23:59:59').getTime();

export const FREE_SHIPPING_THRESHOLD = 80000;

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
