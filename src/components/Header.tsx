import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Truck, Gift, Trophy, CreditCard,
  Package, LogOut, PencilRuler, Sparkles, Droplets, FlaskConical, BookOpen, Palette, Home as HomeIcon,
} from './Icons';

const categoryIcons: Record<string, React.ReactNode> = {
  papeleria: <PencilRuler size={14} />,
  belleza: <Sparkles size={14} />,
  capilar: <Droplets size={14} />,
  facial: <FlaskConical size={14} />,
  libros: <BookOpen size={14} />,
  pinturas: <Palette size={14} />,
  hogar: <HomeIcon size={14} />,
};

export default function Header() {
  const navigate = useNavigate();
  const { cartCount, favorites, searchHistory, addSearch, currentUser, logout, products, categories } = useStore();
  const [query, setQuery] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof products>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(
      query.trim().length > 1
        ? products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 6)
        : []
    );
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSuggestions([]);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submitSearch = () => {
    if (!query.trim()) return;
    addSearch(query.trim());
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSuggestions([]);
    setSearchFocused(false);
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-slate-800 text-gray-200 text-xs">
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between gap-6">
          <div className="hidden md:flex items-center divide-x divide-slate-600">
            <div className="flex items-center gap-2 pr-4">
              <span className="text-gray-400"><Truck size={14} /></span>
              <span>Envíos a todo Colombia</span>
            </div>
            <div className="flex items-center gap-2 px-4">
              <span className="text-gray-400"><CreditCard size={14} /></span>
              <span>Compra 100% segura</span>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <span className="text-gray-400"><Trophy size={14} /></span>
              <span>Las mejores marcas, al mejor precio</span>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <span className="text-gray-400"><Truck size={14} /></span>
            <span>Envíos a todo Colombia</span>
          </div>
          <div className="flex items-center divide-x divide-slate-600 flex-shrink-0">
            <NavLink to="/help" className="px-3 first:pl-0 hover:text-white transition-colors">Ayuda</NavLink>
            <span className="px-3 text-gray-400 hidden sm:inline">Nuestras tiendas</span>
            <NavLink to="/help" className="px-3 hover:text-white transition-colors hidden sm:inline">Contacto</NavLink>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8 h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/home')}
              className="flex-shrink-0 flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C84B11] flex items-center justify-center text-white">
                <HomeIcon size={18} />
              </div>
              <div className="hidden sm:block leading-none">
                <div className="text-sm font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Surtitiendas Galván</div>
                <div className="text-[10px] text-gray-400 tracking-widest uppercase font-medium">Todo para tu hogar</div>
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <div className="flex items-center border border-gray-300 rounded-full focus-within:border-gray-900 transition-colors bg-white pr-1">
                <select
                  value=""
                  onChange={e => { if (e.target.value) navigate(`/categories/${e.target.value}`); }}
                  className="hidden md:block flex-shrink-0 max-w-[160px] rounded-full pl-4 pr-2 py-2.5 text-sm text-gray-700 bg-transparent outline-none cursor-pointer truncate"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                </select>
                <span className="hidden md:block w-px h-6 bg-gray-200 flex-shrink-0" />
                <div className="flex items-center flex-1 min-w-0 relative">
                  <span className="pl-4 text-gray-400 flex-shrink-0">
                    <Search size={16} />
                  </span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    onKeyDown={e => { if (e.key === 'Enter') submitSearch(); }}
                    placeholder="¿Qué estás buscando?"
                    className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
                  />
                  {query && (
                    <button onClick={() => { setQuery(''); setSuggestions([]); }} className="pr-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={submitSearch}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C84B11] hover:bg-[#a83a0d] transition-colors flex items-center justify-center text-white"
                  aria-label="Buscar"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg mt-1.5 z-50 rounded-lg overflow-hidden">
                  {suggestions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { addSearch(p.name); navigate(`/product/${p.id}`); setQuery(''); setSuggestions([]); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                    >
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-cover bg-gray-100 rounded-md flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent searches (shown when input focused and empty) */}
              {!query && searchFocused && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg mt-1.5 z-50 rounded-lg overflow-hidden">
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Búsquedas recientes</p>
                  {searchHistory.slice(0, 5).map(term => (
                    <button
                      key={term}
                      onClick={() => { addSearch(term); navigate(`/search?q=${encodeURIComponent(term)}`); }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.75"/>
                      </svg>
                      <span className="text-sm text-gray-600">{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Account with dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                >
                  {currentUser ? (
                    <div className="w-6 h-6 bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold rounded-full flex-shrink-0">
                      {currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                  <span className="text-sm font-medium max-w-[90px] truncate">
                    {currentUser ? `Hola, ${currentUser.name.split(' ')[0]}` : 'Mi cuenta'}
                  </span>
                  <ChevronDown size={13} />
                </button>

                {accountOpen && (
                  <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden w-52 z-50">
                    {currentUser ? (
                      <>
                        <button onClick={() => { navigate('/account'); setAccountOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                          <User size={15} /> Mi cuenta
                        </button>
                        <button onClick={() => { navigate('/orders'); setAccountOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                          <Package size={15} /> Mis pedidos
                        </button>
                        <button onClick={() => { logout(); setAccountOpen(false); navigate('/home'); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left border-t border-gray-100">
                          <LogOut size={15} /> Cerrar sesión
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { navigate('/login'); setAccountOpen(false); }}
                          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#C84B11] hover:bg-[#a83a0d] text-left">
                          Iniciar sesión
                        </button>
                        <button onClick={() => { navigate('/register'); setAccountOpen(false); }}
                          className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                          Crear cuenta
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <NavLink to="/favorites" className="relative flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <Heart size={20} />
                <span className="text-[10px] font-medium tracking-wide">Favoritos</span>
                <span className="absolute top-1 right-1.5 bg-[#C84B11] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {favorites.length}
                </span>
              </NavLink>
              <NavLink to="/cart" className="relative flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <ShoppingCart size={20} />
                <span className="text-[10px] font-medium tracking-wide">Mi carrito</span>
                <span className="absolute top-1 right-1.5 bg-[#C84B11] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Nav bar */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 h-12 overflow-x-auto">
            {/* All categories */}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white bg-[#C84B11] hover:bg-[#a83a0d] transition-colors whitespace-nowrap rounded-full">
                <Menu size={15} />
                Todas las categorías
                <ChevronDown size={13} />
              </button>

              {megaOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl z-50 w-[700px] p-6 grid grid-cols-4 gap-4 rounded-lg">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate(`/categories/${cat.slug}`); setMegaOpen(false); }}
                      className="text-left group"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-[#C84B11] transition-colors mb-1.5">
                        <span className="text-gray-400 group-hover:text-[#C84B11] transition-colors">{categoryIcons[cat.slug]}</span>
                        {cat.name}
                      </p>
                      <div className="space-y-1">
                        {cat.subcategories.slice(0, 3).map(sub => (
                          <p key={sub} className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">{sub}</p>
                        ))}
                      </div>
                    </button>
                  ))}
                  <button onClick={() => { navigate('/categories'); setMegaOpen(false); }}
                    className="text-xs font-semibold text-[#C84B11] hover:underline text-left mt-2 col-span-4 border-t border-gray-100 pt-3">
                    Ver todas las categorías →
                  </button>
                </div>
              )}
            </div>

            {/* Nav links */}
            {categories.map(cat => (
              <NavLink
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className={({ isActive }) =>
                  `h-9 flex items-center gap-1.5 px-3.5 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'text-[#C84B11] bg-orange-50 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <span className="text-gray-400">{categoryIcons[cat.slug]}</span>
                {cat.name}
              </NavLink>
            ))}

            <NavLink
              to="/categories/ofertas"
              className="ml-auto flex-shrink-0 flex items-center gap-1.5 h-8 px-4 text-sm font-semibold text-[#C84B11] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors whitespace-nowrap"
            >
              <Gift size={14} />
              Ofertas
            </NavLink>
          </div>
        </div>
      </header>
    </>
  );
}
