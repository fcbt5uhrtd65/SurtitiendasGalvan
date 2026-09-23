import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Category, Product } from '../data/products';
import * as authService from '../services/auth.service';
import * as catalogService from '../services/catalog.service';
import * as customersService from '../services/customers.service';
import * as ordersService from '../services/orders.service';
import { ApiError, getTokens } from '../services/http';

export type { Order, OrderStatus } from '../services/orders.service';
export type { Customer } from '../services/customers.service';

const ADMIN_ROLES = new Set(['ADMIN', 'VENDEDOR']);

interface AdminState {
  isAuthenticated: boolean;
  authLoading: boolean;
  loginError: string | null;
  currentUser: authService.User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  products: Product[];
  categories: Category[];
  addProduct: (p: Omit<Product, 'id' | 'variantId'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  orders: ordersService.Order[];
  updateOrderStatus: (id: string, status: ordersService.OrderStatus) => Promise<void>;

  customers: customersService.Customer[];
}

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<authService.User | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<ordersService.Order[]>([]);
  const [customers, setCustomers] = useState<customersService.Customer[]>([]);

  useEffect(() => {
    const { access } = getTokens();
    if (!access) { setAuthLoading(false); return; }
    authService.getCurrentUser()
      .then(user => {
        const isAdmin = !!user && ADMIN_ROLES.has(user.role);
        setIsAuthenticated(isAdmin);
        setCurrentUser(isAdmin ? user : null);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  const refreshProducts = () => catalogService.listProducts().then(setProducts).catch(() => setProducts([]));
  const refreshOrders = () => ordersService.listOrders().then(setOrders).catch(() => setOrders([]));
  const refreshCustomers = () => customersService.listCustomers().then(setCustomers).catch(() => setCustomers([]));

  useEffect(() => {
    if (!isAuthenticated) return;
    catalogService.listCategories().then(setCategories).catch(() => setCategories([]));
    refreshProducts();
    refreshOrders();
    refreshCustomers();
  }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login(email, password);
      if (result.error || !result.user || !ADMIN_ROLES.has(result.user.role)) {
        setLoginError('Usuario o contraseña incorrectos, o la cuenta no tiene permisos de administrador.');
        authService.logout();
        return false;
      }
      setLoginError(null);
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setLoginError(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      return false;
    }
  };

  const logout = () => { authService.logout(); setIsAuthenticated(false); setCurrentUser(null); };

  const addProduct = async (p: Omit<Product, 'id' | 'variantId'>) => {
    await catalogService.createProduct(p);
    await refreshProducts();
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    await catalogService.updateProduct(id, p);
    await refreshProducts();
  };

  const deleteProduct = async (id: string) => {
    await catalogService.deleteProduct(id);
    await refreshProducts();
  };

  const updateOrderStatus = async (id: string, status: ordersService.OrderStatus) => {
    await ordersService.changeOrderStatus(id, status);
    await Promise.all([refreshOrders(), refreshCustomers()]);
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated, authLoading, loginError, currentUser, login, logout,
      products, categories, addProduct, updateProduct, deleteProduct,
      orders, updateOrderStatus, customers,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
