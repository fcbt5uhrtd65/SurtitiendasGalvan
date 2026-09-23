import { apiFetch } from './http';

export const ORDER_STATUS_VALUES = ['PENDIENTE', 'CONFIRMADO', 'EMPACADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EMPACADO: 'Empacado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMADO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  EMPACADO: 'bg-amber-100 text-amber-700 border-amber-200',
  ENVIADO: 'bg-purple-100 text-purple-700 border-purple-200',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-200',
  CANCELADO: 'bg-red-100 text-red-600 border-red-200',
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EMPACADO', 'CANCELADO'],
  EMPACADO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  city: string;
  address: string;
  paymentMethod: string;
  deliveryMethod: string;
}

export interface CartSyncItem {
  variantId: string;
  quantity: number;
}

export interface CheckoutDetails {
  shippingCity: string;
  shippingAddress: string;
  paymentMethod: string;
  deliveryMethod: string;
}

interface Paginated<T> {
  count: number;
  results: T[];
}

interface OrderLineDTO {
  id: string;
  variant: string;
  product_name: string;
  quantity: number;
  unit_price: string;
}

interface OrderDTO {
  id: string;
  customer: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  shipping_city: string;
  shipping_address: string;
  payment_method: string;
  delivery_method: string;
  total: string;
  lines: OrderLineDTO[];
  created_at: string;
}

function adaptOrder(dto: OrderDTO): Order {
  return {
    id: dto.id,
    customerId: dto.customer,
    customerName: dto.customer_name,
    customerEmail: dto.customer_email,
    date: dto.created_at.slice(0, 10),
    status: dto.status,
    items: dto.lines.map(line => ({
      productId: line.variant,
      name: line.product_name,
      qty: line.quantity,
      price: Number(line.unit_price),
    })),
    total: Number(dto.total),
    city: dto.shipping_city,
    address: dto.shipping_address,
    paymentMethod: dto.payment_method,
    deliveryMethod: dto.delivery_method,
  };
}

export async function listOrders(): Promise<Order[]> {
  const data = await apiFetch<Paginated<OrderDTO>>('/orders/?page_size=100');
  return data.results.map(adaptOrder);
}

export async function checkout(items: CartSyncItem[], details: CheckoutDetails): Promise<Order> {
  await apiFetch<void>('/cart/', { method: 'DELETE' });
  for (const item of items) {
    await apiFetch('/cart/', {
      method: 'POST',
      body: JSON.stringify({ variant_id: item.variantId, quantity: item.quantity }),
    });
  }
  const dto = await apiFetch<OrderDTO>('/checkout/', {
    method: 'POST',
    body: JSON.stringify({
      shipping_city: details.shippingCity,
      shipping_address: details.shippingAddress,
      payment_method: details.paymentMethod,
      delivery_method: details.deliveryMethod,
    }),
  });
  return adaptOrder(dto);
}

export async function changeOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const dto = await apiFetch<OrderDTO>(`/orders/${id}/change_status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  return adaptOrder(dto);
}
