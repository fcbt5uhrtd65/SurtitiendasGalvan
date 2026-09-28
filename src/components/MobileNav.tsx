import { NavLink } from 'react-router';
import { useStore } from '../context/StoreContext';
import { Home as HomeIcon, Grid, Search, ShoppingCart, User } from './Icons';

export default function MobileNav() {
  const { cartCount } = useStore();

  const items: { to: string; end?: boolean; icon: React.ReactNode; label: string; badge?: number }[] = [
    { to: '/home', end: true, icon: <HomeIcon size={20} />, label: 'Inicio' },
    { to: '/categories', icon: <Grid size={20} />, label: 'Categorías' },
    { to: '/search', icon: <Search size={20} />, label: 'Buscar' },
    { to: '/cart', icon: <ShoppingCart size={20} />, label: 'Carrito', badge: cartCount },
    { to: '/account', icon: <User size={20} />, label: 'Mi cuenta' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex items-stretch h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 outline-none ${
              isActive ? 'text-[#1976E8]' : 'text-gray-400'
            }`
          }
        >
          <span className="relative">
            {item.icon}
            {!!item.badge && (
              <span className="absolute -top-1.5 -right-2 bg-[#F4C20D] text-[#0B2D6B] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
