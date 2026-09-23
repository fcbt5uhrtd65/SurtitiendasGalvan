import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Category, Product } from '../data/products';
import * as authService from '../services/auth.service';
import * as catalogService from '../services/catalog.service';
import * as ordersService from '../services/orders.service';
import { getTokens } from '../services/http';

export type { Order as CustomerOrder } from '../services/orders.service';
export type { User } from '../services/auth.service';

interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  favorites: string[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  searchHistory: string[];
  addSearch: (term: string) => void;
  // Catálogo
  products: Product[];
  categories: Category[];
  catalogLoading: boolean;
  // Pedidos
  orders: ordersService.Order[];
  placeOrder: (details: ordersService.CheckoutDetails) => Promise<ordersService.Order>;
  // Auth
  currentUser: authService.User | null;
  authLoading: boolean;
  authError: authService.AuthError | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string, city: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(['Shampoo', 'Cuadernos']);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [orders, setOrders] = useState<ordersService.Order[]>([]);
  const [currentUser, setCurrentUser] = useState<authService.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<authService.AuthError | null>(null);

  useEffect(() => {
    Promise.all([catalogService.listCategories(), catalogService.listProducts()])
      .then(([cats, prods]) => { setCategories(cats); setProducts(prods); })
      .catch(() => { setCategories([]); setProducts([]); })
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    const { access } = getTokens();
    if (!access) { setAuthLoading(false); return; }
    authService.getCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!currentUser) { setOrders([]); return; }
    ordersService.listOrders().then(setOrders).catch(() => setOrders([]));
  }, [currentUser]);

  const addToCart = (product: Product, qty = 1) =>
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.product.id !== productId));
  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const toggleFavorite = (productId: string) =>
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  const isFavorite = (productId: string) => favorites.includes(productId);

  const addSearch = (term: string) => {
    if (!term.trim()) return;
    setSearchHistory(prev => [term, ...prev.filter(s => s !== term)].slice(0, 8));
  };

  const placeOrder = async (details: ordersService.CheckoutDetails) => {
    const items = cart.map(({ product, quantity }) => ({ variantId: product.variantId, quantity }));
    const order = await ordersService.checkout(items, details);
    clearCart();
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    if (result.error) { setAuthError(result.error); return false; }
    setCurrentUser(result.user);
    setAuthError(null);
    return true;
  };

  const register = async (name: string, email: string, password: string, phone: string, city: string): Promise<boolean> => {
    const result = await authService.register(name, email, password, phone, city);
    if (result.error) { setAuthError(result.error); return false; }
    setCurrentUser(result.user);
    setAuthError(null);
    return true;
  };

  const logout = () => { authService.logout(); setCurrentUser(null); };
  const clearAuthError = () => setAuthError(null);

  return (
    <StoreContext.Provider value={{
      cart, favorites, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartTotal, toggleFavorite, isFavorite,
      searchHistory, addSearch,
      products, categories, catalogLoading,
      orders, placeOrder,
      currentUser, authLoading, authError, login, register, logout, clearAuthError,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
