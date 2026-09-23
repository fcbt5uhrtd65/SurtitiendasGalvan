import type { Category, Product } from '../data/products';
import { apiFetch } from './http';

interface Paginated<T> {
  count: number;
  results: T[];
}

interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  color: string;
  parent: string | null;
}

interface ProductListDTO {
  id: string;
  name: string;
  brand: string;
  category: CategoryDTO;
  price_from: string | null;
  primary_image: string | null;
  in_stock: boolean;
  stock: number;
  primary_variant_id: string | null;
  is_new: boolean;
  is_best_seller: boolean;
  original_price: string | null;
  is_on_sale: boolean;
  discount_percent: number;
}

interface ProductDetailDTO extends ProductListDTO {
  description: string;
  features: string[];
  variants: {
    id: string; sku: string; presentation: string; stock: number;
    price: { amount: string; currency: string } | null;
    original_price: string | null; is_on_sale: boolean; discount_percent: number;
  }[];
  images: { id: string; url: string; order: number; is_primary: boolean }[];
}

let categoriesCache: Category[] = [];

function adaptCategory(dto: CategoryDTO): Category {
  return { id: dto.id, slug: dto.slug, name: dto.name, color: dto.color, subcategories: [] };
}

function adaptListProduct(dto: ProductListDTO): Product {
  return {
    id: dto.id,
    variantId: dto.primary_variant_id ?? '',
    name: dto.name,
    brand: dto.brand,
    price: dto.price_from !== null ? Number(dto.price_from) : 0,
    originalPrice: dto.is_on_sale && dto.original_price ? Number(dto.original_price) : undefined,
    discount: dto.is_on_sale ? dto.discount_percent : undefined,
    isOnSale: dto.is_on_sale,
    image: dto.primary_image ?? '',
    category: dto.category.name,
    categoryId: dto.category.slug,
    isNew: dto.is_new,
    isBestSeller: dto.is_best_seller,
    description: '',
    features: [],
    stock: dto.stock,
  };
}

function adaptDetailProduct(dto: ProductDetailDTO): Product {
  const primaryVariant = dto.variants[0];
  const price = primaryVariant?.price ? Number(primaryVariant.price.amount) : dto.price_from !== null ? Number(dto.price_from) : 0;
  const isOnSale = primaryVariant?.is_on_sale ?? dto.is_on_sale;
  return {
    id: dto.id,
    variantId: primaryVariant?.id ?? dto.primary_variant_id ?? '',
    name: dto.name,
    brand: dto.brand,
    price,
    originalPrice: isOnSale && primaryVariant?.original_price ? Number(primaryVariant.original_price) : undefined,
    discount: isOnSale ? (primaryVariant?.discount_percent ?? dto.discount_percent) : undefined,
    isOnSale,
    image: dto.primary_image ?? dto.images[0]?.url ?? '',
    images: dto.images.map(image => image.url),
    category: dto.category.name,
    categoryId: dto.category.slug,
    isNew: dto.is_new,
    isBestSeller: dto.is_best_seller,
    description: dto.description,
    features: dto.features,
    stock: dto.stock,
  };
}

async function resolveCategoryUuid(slug: string): Promise<string> {
  if (!categoriesCache.length) await listCategories();
  const match = categoriesCache.find(category => category.slug === slug);
  if (!match) throw new Error(`La categoría "${slug}" no existe.`);
  return match.id;
}

export async function listCategories(): Promise<Category[]> {
  const data = await apiFetch<Paginated<CategoryDTO>>('/catalog/categories/?page_size=100', { auth: false });
  categoriesCache = data.results.map(adaptCategory);
  return categoriesCache;
}

export async function listProducts(): Promise<Product[]> {
  const data = await apiFetch<Paginated<ProductListDTO>>('/catalog/products/?page_size=100', { auth: false });
  return data.results.map(adaptListProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const dto = await apiFetch<ProductDetailDTO>(`/catalog/products/${id}/`, { auth: false });
  return adaptDetailProduct(dto);
}

export async function createProduct(data: Omit<Product, 'id' | 'variantId'>): Promise<Product> {
  const category = await resolveCategoryUuid(data.categoryId);
  const dto = await apiFetch<ProductDetailDTO>('/catalog/products/', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      brand: data.brand,
      description: data.description,
      category,
      features: data.features,
      is_new: !!data.isNew,
      is_best_seller: !!data.isBestSeller,
      price: data.price,
      original_price: data.originalPrice ?? null,
      stock: data.stock,
      image: data.image,
    }),
  });
  return adaptDetailProduct(dto);
}

export async function updateProduct(id: string, changes: Partial<Product>): Promise<Product> {
  const payload: Record<string, unknown> = {};
  if (changes.name !== undefined) payload.name = changes.name;
  if (changes.brand !== undefined) payload.brand = changes.brand;
  if (changes.description !== undefined) payload.description = changes.description;
  if (changes.features !== undefined) payload.features = changes.features;
  if (changes.isNew !== undefined) payload.is_new = changes.isNew;
  if (changes.isBestSeller !== undefined) payload.is_best_seller = changes.isBestSeller;
  if (changes.price !== undefined) payload.price = changes.price;
  if (changes.originalPrice !== undefined) payload.original_price = changes.originalPrice ?? null;
  if (changes.stock !== undefined) payload.stock = changes.stock;
  if (changes.categoryId !== undefined) payload.category = await resolveCategoryUuid(changes.categoryId);

  const dto = await apiFetch<ProductDetailDTO>(`/catalog/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return adaptDetailProduct(dto);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/catalog/products/${id}/`, { method: 'DELETE' });
}
