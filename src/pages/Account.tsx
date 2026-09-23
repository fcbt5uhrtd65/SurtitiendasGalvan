import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Package, Heart, MapPin, CreditCard, Tag, Bell, HelpCircle, LogOut, ChevronRight } from '../components/Icons';

export default function Account() {
  const navigate = useNavigate();
  const { currentUser, logout, orders, favorites } = useStore();

  // Not logged in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 border border-gray-200 mx-auto mb-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Mi cuenta
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
          Inicia sesión para ver tus pedidos, favoritos y gestionar tu información.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full border border-gray-200 text-gray-700 font-semibold py-3 text-sm hover:border-gray-400 transition-colors"
          >
            Crear cuenta gratis
          </button>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Acceso panel administrador
          </button>
        </div>
      </div>
    );
  }

  // Logged in
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalLabel = totalSpent >= 1000000
    ? `$${(totalSpent / 1000000).toFixed(1)}M`
    : `$${Math.round(totalSpent / 1000)}K`;

  const initials = currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const menuItems = [
    { icon: Package,    label: 'Mis pedidos',    desc: `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`, to: '/orders', badge: orders.length > 0 ? String(orders.length) : undefined },
    { icon: Heart,      label: 'Mis favoritos',  desc: `${favorites.length} producto${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`, to: '/favorites' },
    { icon: MapPin,     label: 'Direcciones',    desc: 'Gestión de direcciones de entrega', to: '/addresses' },
    { icon: CreditCard, label: 'Métodos de pago',desc: 'Tarjetas y cuentas bancarias',      to: '/payment-methods' },
    { icon: Tag,        label: 'Cupones',        desc: 'GALVAN10 (10%) · SURTE15 (15%)',    to: '/coupons', badge: '2' },
    { icon: Bell,       label: 'Notificaciones', desc: 'Preferencias de alertas y avisos',  to: '/notifications' },
    { icon: HelpCircle, label: 'Ayuda y soporte',desc: 'Centro de ayuda y contacto',        to: '/help' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Mi cuenta</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{currentUser.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{currentUser.email}</p>
              {currentUser.city && <p className="text-xs text-gray-400 mt-0.5">{currentUser.city}</p>}
              <span className="text-[10px] border border-[#C84B11] text-[#C84B11] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider mt-1.5 inline-block">
                {orders.length >= 3 ? 'Cliente frecuente' : orders.length >= 1 ? 'Cliente activo' : 'Nuevo cliente'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center mb-5">
            {[
              [String(orders.length), 'Pedidos'],
              [totalSpent > 0 ? totalLabel : '$0', 'Total'],
              [String(favorites.length), 'Favoritos'],
            ].map(([val, label]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{val}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <button onClick={() => navigate('/orders')}
              className="w-full text-sm font-semibold bg-[#C84B11] text-white py-2.5 rounded-lg hover:bg-[#a83a0d] transition-colors">
              Ver mis pedidos
            </button>
            <button onClick={() => navigate('/favorites')}
              className="w-full text-sm font-semibold border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:border-gray-400 transition-colors">
              Ver mis favoritos ({favorites.length})
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {menuItems.map(({ icon: Icon, label, desc, to, badge }) => (
              <button
                key={label}
                onClick={() => to && navigate(to)}
                disabled={!to}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors disabled:cursor-default ${
                  to ? 'hover:bg-gray-50' : 'opacity-40'
                }`}
              >
                <span className="text-gray-400"><Icon size={18} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                {badge && (
                  <span className="bg-[#C84B11] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
                {to
                  ? <ChevronRight size={15} />
                  : <span className="text-[10px] text-gray-300 border border-gray-200 px-1.5 py-0.5">Próximamente</span>
                }
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/home'); }}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-red-50 transition-colors"
            >
              <span className="text-red-400"><LogOut size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-500">Cerrar sesión</p>
              </div>
            </button>
          </div>

          {/* Admin access */}
          <div className="mt-4 flex justify-end">
            <button onClick={() => navigate('/admin')}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-400 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Acceso administrador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
