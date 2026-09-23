import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { useAdmin } from '../../context/AdminContext';

const navItems = [
  {
    to: '/admin/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/admin/products', label: 'Productos',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  },
  {
    to: '/admin/orders', label: 'Pedidos',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  },
  {
    to: '/admin/customers', label: 'Clientes',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
];

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Productos',
  '/admin/orders': 'Pedidos',
  '/admin/customers': 'Clientes',
};

export default function AdminLayout() {
  const { isAuthenticated, authLoading, currentUser, logout, orders, products } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/admin');
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) return null;

  const pendingOrders = orders.filter(o => o.status === 'PENDIENTE' || o.status === 'CONFIRMADO' || o.status === 'EMPACADO').length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const alerts = pendingOrders + lowStock;
  const currentLabel = breadcrumbMap[location.pathname] ?? '';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 flex flex-col flex-shrink-0 border-r border-gray-800">
        {/* Brand */}
        <div className="px-5 h-14 flex items-center border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#C84B11] flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>Surtitiendas</p>
              <p className="text-gray-500 text-[10px] leading-tight">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Menú principal</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C84B11] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {item.label === 'Pedidos' && pendingOrders > 0 && (
                <span className="bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                  {pendingOrders}
                </span>
              )}
              {item.label === 'Productos' && lowStock > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                  {lowStock}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {(currentUser?.name ?? 'Admin').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-300 leading-none truncate">{currentUser?.name || 'Administrador'}</p>
              <p className="text-[10px] text-gray-600 mt-0.5 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Ver tienda
          </button>
          <button
            onClick={() => { logout(); navigate('/admin'); }}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors w-full"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">Panel</span>
            {currentLabel && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span className="font-semibold text-gray-900">{currentLabel}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {alerts > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1.5 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {alerts} alerta{alerts !== 1 ? 's' : ''}
              </div>
            )}
            <div className="text-xs text-gray-400">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
