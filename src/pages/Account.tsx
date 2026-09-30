import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { LOYALTY_MILESTONE_ORDER_NUMBER, countValidPurchases } from '../services/orders.service';
import { Package, Heart, MapPin, CreditCard, Gift, Bell, HelpCircle, LogOut, ChevronRight, User, Shield } from '../components/Icons';

const STAFF_ROLES = new Set(['ADMIN', 'VENDEDOR']);

export default function Account() {
  const navigate = useNavigate();
  const { currentUser, logout, orders, favorites } = useStore();
  const validPurchases = countValidPurchases(orders);

  // Not logged in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] mx-auto mb-6 flex items-center justify-center text-[#1976E8]">
          <User size={26} />
        </div>
        <h1 className="text-xl font-bold text-[#0B2D6B] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Mi cuenta
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
          Inicia sesión para ver tus pedidos, favoritos y gestionar tu información.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#1976E8] text-white font-bold rounded-full py-3 text-sm hover:bg-[#125fc0] transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full border border-gray-200 rounded-full text-gray-700 font-semibold py-3 text-sm hover:border-gray-400 transition-colors"
          >
            Crear cuenta gratis
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
  const tier = orders.length >= 3 ? 'Cliente frecuente' : orders.length >= 1 ? 'Cliente activo' : 'Nuevo cliente';

  const stats = [
    { value: String(orders.length), label: 'Pedidos', bg: '#EAF2FF', color: '#1976E8' },
    { value: totalSpent > 0 ? totalLabel : '$0', label: 'Total', bg: '#FDF3D7', color: '#0B2D6B' },
    { value: String(favorites.length), label: 'Favoritos', bg: '#FCE7EC', color: '#E11D48' },
  ];

  const menuItems = [
    { icon: Package,    label: 'Mis pedidos',    desc: `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`, to: '/orders', badge: orders.length > 0 ? String(orders.length) : undefined, color: '#1976E8' },
    { icon: Heart,      label: 'Mis favoritos',  desc: `${favorites.length} producto${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`, to: '/favorites', color: '#E11D48' },
    { icon: MapPin,     label: 'Direcciones',    desc: 'Gestión de direcciones de entrega', to: '/addresses', color: '#00B894' },
    { icon: CreditCard, label: 'Métodos de pago',desc: 'Tarjetas y cuentas bancarias',      to: '/payment-methods', color: '#0B2D6B' },
    { icon: Gift,       label: 'Recompensa de fidelidad', desc: validPurchases >= LOYALTY_MILESTONE_ORDER_NUMBER ? 'Ya usaste tu 10% de regalo' : `${validPurchases}/${LOYALTY_MILESTONE_ORDER_NUMBER} compras para tu 10% de regalo`, to: '/coupons', color: '#F4C20D' },
    { icon: Bell,       label: 'Notificaciones', desc: 'Preferencias de alertas y avisos',  to: '/notifications', color: '#1976E8' },
    { icon: HelpCircle, label: 'Ayuda y soporte',desc: 'Centro de ayuda y contacto',        to: '/help', color: '#0B2D6B' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Mi cuenta</h1>

      {STAFF_ROLES.has(currentUser.role) && (
        <button
          onClick={() => navigate('/admin')}
          className="w-full mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[#1976E8]/30 bg-[#EAF2FF] px-5 py-4 hover:bg-[#dbe9fd] transition-colors text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#0B2D6B] flex items-center justify-center text-white flex-shrink-0">
              <Shield size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0B2D6B]">Esta cuenta tiene acceso de administrador</p>
              <p className="text-xs text-gray-500">Gestiona productos, pedidos y clientes desde el panel</p>
            </div>
          </div>
          <span className="text-[#1976E8] font-bold text-sm flex items-center gap-1 flex-shrink-0">
            Ir al panel <ChevronRight size={14} />
          </span>
        </button>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 h-fit">
          <div className="bg-gradient-to-br from-[#0B2D6B] to-[#1976E8] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center font-bold text-lg flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{currentUser.name}</p>
                <p className="text-xs text-white/70 mt-0.5 truncate">{currentUser.email}</p>
                {currentUser.city && <p className="text-xs text-white/70 mt-0.5">{currentUser.city}</p>}
              </div>
            </div>
            <span className="mt-4 inline-block text-[10px] bg-[#F4C20D] text-[#0B2D6B] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              {tier}
            </span>
          </div>

          <div className="p-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {stats.map(({ value, label, bg, color }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: bg }}>
                  <p className="font-bold text-lg leading-none" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-1.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <button onClick={() => navigate('/orders')}
                className="w-full text-sm font-bold bg-[#1976E8] text-white py-2.5 rounded-full hover:bg-[#125fc0] transition-colors">
                Ver mis pedidos
              </button>
              <button onClick={() => navigate('/favorites')}
                className="w-full text-sm font-semibold border border-gray-200 text-gray-700 py-2.5 rounded-full hover:border-gray-400 transition-colors">
                Ver mis favoritos ({favorites.length})
              </button>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {menuItems.map(({ icon: Icon, label, desc, to, badge, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#1976E8]/40 hover:shadow-sm transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{label}</p>
                    {badge && <span className="bg-[#F4C20D] text-[#0B2D6B] text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                </div>
                <span className="text-gray-300 mt-1 flex-shrink-0"><ChevronRight size={15} /></span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/home'); }}
            className="w-full flex items-center justify-center gap-2.5 mt-3 p-4 rounded-2xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors text-red-500 font-semibold text-sm"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
