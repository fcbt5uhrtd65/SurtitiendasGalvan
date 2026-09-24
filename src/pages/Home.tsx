import { useNavigate } from 'react-router';
import ProductCard from '../components/ProductCard';
import Countdown from '../components/Countdown';
import { useStore } from '../context/StoreContext';
import { formatPrice, FLASH_SALE_END, FREE_SHIPPING_THRESHOLD, getCategoryCount } from '../data/products';
import { Layers, Truck, Shield, RotateCcw, Headphones } from '../components/Icons';

export default function Home() {
  const navigate = useNavigate();
  const { products, categories, catalogLoading } = useStore();
  const featured   = products.slice(0, 8);
  const sales      = products.filter(p => p.isOnSale);
  const bestSellers = products.filter(p => p.isBestSeller);
  const newItems   = products.filter(p => p.isNew);

  if (catalogLoading) {
    return <div className="py-24 text-center text-sm text-gray-400">Cargando catálogo…</div>;
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-stretch min-h-[420px]">
          <div className="flex flex-col justify-center py-16 pr-8">
            <p className="text-[#C84B11] text-xs font-semibold uppercase tracking-widest mb-3">Semana de descuentos</p>
            <h1 className="text-5xl font-bold leading-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Todo lo que necesitas,<br />
              <span className="text-gray-300">en un solo lugar.</span>
            </h1>
            <p className="text-gray-400 mt-4 text-base leading-relaxed max-w-md">
              Papelería, belleza, cuidado personal, libros, pinturas y artículos para el hogar con los mejores precios de Colombia.
            </p>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => navigate('/categories')}
                className="bg-[#C84B11] text-white font-semibold px-7 py-3 text-sm hover:bg-[#a83a0d] transition-colors"
              >
                Ver catálogo completo
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="border border-gray-600 text-gray-300 font-semibold px-7 py-3 text-sm hover:border-gray-400 hover:text-white transition-colors"
              >
                Ver ofertas
              </button>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-px bg-gray-800 self-stretch">
            {products.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="bg-gray-900 hover:bg-gray-800 transition-colors text-left p-5 flex flex-col justify-end"
              >
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover mb-3 opacity-80 hover:opacity-100 transition-opacity" />
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{p.brand}</p>
                <p className="text-sm text-white font-medium leading-snug line-clamp-1 mt-0.5">{p.name}</p>
                <p className="text-[#C84B11] font-bold mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(p.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Trust bar */}
        <div className="border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 py-4 my-0">
          {[
            { icon: <Truck size={18} />, title: 'Envío gratis', desc: `En compras mayores a ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
            { icon: <Shield size={18} />, title: 'Compra segura', desc: 'Transacciones protegidas SSL' },
            { icon: <RotateCcw size={18} />, title: 'Devoluciones', desc: 'Hasta 30 días sin inconvenientes' },
            { icon: <Headphones size={18} />, title: 'Soporte', desc: 'Lun–Sáb 8 am–6 pm' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <span className="text-[#C84B11]">{icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{title}</p>
                <p className="text-[11px] text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section className="py-10 border-b border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Categorías</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline tracking-wide uppercase">Ver todas</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            <button
              onClick={() => navigate('/products')}
              className="flex flex-col items-center gap-2.5 py-5 px-2 border-2 border-[#C84B11] bg-orange-50/60 rounded-2xl transition-all"
            >
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 flex items-center justify-center text-[#C84B11]">
                <Layers size={28} />
              </span>
              <span className="text-xs font-bold text-gray-900 text-center leading-tight">Todos</span>
              <span className="text-[11px] text-gray-400">{products.length} productos</span>
            </button>
            {categories.map(cat => {
              const thumb = products.find(p => p.categoryId === cat.slug)?.image;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/categories/${cat.slug}`)}
                  className="flex flex-col items-center gap-2.5 py-5 px-2 border border-gray-100 hover:border-[#C84B11] hover:shadow-sm transition-all group rounded-2xl"
                >
                  <span
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: `${cat.color}1A` }}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Layers size={26} />
                    )}
                  </span>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#C84B11] transition-colors text-center leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-gray-400">{getCategoryCount(cat.slug, products)} producto{getCategoryCount(cat.slug, products) !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured products */}
        <section className="py-10 border-b border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Productos destacados</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline tracking-wide uppercase">Ver todos</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
            {featured.map(p => (
              <div key={p.id} className="bg-white">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Flash sales + promos */}
        <section className="py-10 border-b border-gray-100">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Flash sale */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Ofertas del día</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Termina en</span>
                    <Countdown endTime={FLASH_SALE_END} />
                  </div>
                </div>
                <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline uppercase tracking-wide">Ver todas</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100">
                {sales.map(p => (
                  <div key={p.id} className="bg-white">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>

            {/* Promo banners */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/categories/facial')}
                className="flex-1 relative overflow-hidden group"
              >
                <img
                  src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=300&fit=crop&auto=format"
                  alt="Cuidado facial"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  style={{ minHeight: 160 }}
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-5">
                  <p className="text-white text-[11px] uppercase tracking-widest font-semibold mb-1">Nueva colección</p>
                  <p className="text-white text-lg font-bold leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Cuidado Facial 2026</p>
                  <p className="text-white/70 text-xs mt-1">Sérums y cremas premium</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/categories/papeleria')}
                className="flex-1 relative overflow-hidden group"
              >
                <img
                  src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=300&fit=crop&auto=format"
                  alt="Papelería escolar"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  style={{ minHeight: 160 }}
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-5">
                  <p className="text-white text-[11px] uppercase tracking-widest font-semibold mb-1">Temporada escolar</p>
                  <p className="text-white text-lg font-bold leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Útiles y Papelería</p>
                  <p className="text-[#C84B11] text-sm font-bold mt-1">Hasta 30% de descuento</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Best sellers */}
        <section className="py-10 border-b border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Más vendidos</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline uppercase tracking-wide">Ver todos</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
            {bestSellers.map(p => (
              <div key={p.id} className="bg-white">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* New arrivals */}
        <section className="py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Nuevos productos</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline uppercase tracking-wide">Ver todos</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
            {newItems.map(p => (
              <div key={p.id} className="bg-white">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
