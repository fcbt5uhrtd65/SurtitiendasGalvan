import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Categories from './pages/Categories';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Addresses from './pages/Addresses';
import PaymentMethods from './pages/PaymentMethods';
import Coupons from './pages/Coupons';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'home', Component: Home },
      { path: 'categories', Component: Categories },
      { path: 'products', Component: ProductList },
      { path: 'categories/:categoryId', Component: ProductList },
      { path: 'product/:productId', Component: ProductDetail },
      { path: 'search', Component: Search },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'order-confirmed', Component: OrderConfirmed },
      { path: 'account', Component: Account },
      { path: 'orders', Component: Orders },
      { path: 'favorites', Component: Favorites },
      { path: 'addresses', Component: Addresses },
      { path: 'payment-methods', Component: PaymentMethods },
      { path: 'coupons', Component: Coupons },
      { path: 'notifications', Component: Notifications },
      { path: 'help', Component: Help },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'reset-password', Component: ResetPassword },
    ],
  },
  { path: '/admin', Component: AdminLogin },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { path: 'dashboard', Component: Dashboard },
      { path: 'products', Component: AdminProducts },
      { path: 'orders', Component: AdminOrders },
      { path: 'customers', Component: Customers },
    ],
  },
]);
