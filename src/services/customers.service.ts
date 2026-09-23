import { apiFetch } from './http';
import { listOrders } from './orders.service';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface Paginated<T> {
  count: number;
  results: T[];
}

interface CustomerDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  addresses: { city: string; is_default: boolean }[];
  created_at: string;
}

function adaptCustomer(dto: CustomerDTO): Omit<Customer, 'totalOrders' | 'totalSpent'> {
  const defaultAddress = dto.addresses.find(address => address.is_default) ?? dto.addresses[0];
  return {
    id: dto.id,
    name: `${dto.first_name} ${dto.last_name}`.trim() || dto.email,
    email: dto.email,
    phone: dto.phone,
    city: defaultAddress?.city ?? '',
    registeredAt: dto.created_at.slice(0, 10),
  };
}

export interface Address {
  id: string;
  label: string;
  city: string;
  addressLine: string;
  isDefault: boolean;
}

interface AddressDTO {
  id: string;
  label: string;
  city: string;
  address_line: string;
  is_default: boolean;
}

function adaptAddress(dto: AddressDTO): Address {
  return { id: dto.id, label: dto.label, city: dto.city, addressLine: dto.address_line, isDefault: dto.is_default };
}

export async function listAddresses(): Promise<Address[]> {
  const data = await apiFetch<Paginated<AddressDTO>>('/customers/addresses/?page_size=100');
  return data.results.map(adaptAddress);
}

export async function createAddress(input: Omit<Address, 'id'>): Promise<Address> {
  const dto = await apiFetch<AddressDTO>('/customers/addresses/', {
    method: 'POST',
    body: JSON.stringify({ label: input.label, city: input.city, address_line: input.addressLine, is_default: input.isDefault }),
  });
  return adaptAddress(dto);
}

export async function updateAddress(id: string, input: Partial<Omit<Address, 'id'>>): Promise<Address> {
  const payload: Record<string, unknown> = {};
  if (input.label !== undefined) payload.label = input.label;
  if (input.city !== undefined) payload.city = input.city;
  if (input.addressLine !== undefined) payload.address_line = input.addressLine;
  if (input.isDefault !== undefined) payload.is_default = input.isDefault;

  const dto = await apiFetch<AddressDTO>(`/customers/addresses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return adaptAddress(dto);
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch<void>(`/customers/addresses/${id}/`, { method: 'DELETE' });
}

export async function listCustomers(): Promise<Customer[]> {
  const [customersData, orders] = await Promise.all([
    apiFetch<Paginated<CustomerDTO>>('/customers/?page_size=100'),
    listOrders(),
  ]);

  return customersData.results.map(dto => {
    const profile = adaptCustomer(dto);
    const ownOrders = orders.filter(order => order.customerEmail.toLowerCase() === profile.email.toLowerCase());
    const spentOrders = ownOrders.filter(order => order.status !== 'CANCELADO');
    return {
      ...profile,
      totalOrders: ownOrders.length,
      totalSpent: spentOrders.reduce((sum, order) => sum + order.total, 0),
    };
  });
}
