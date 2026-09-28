import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import ProductCarousel from '../components/ProductCarousel';
import Countdown from '../components/Countdown';
import { useStore } from '../context/StoreContext';
import { formatPrice, FLASH_SALE_END, FREE_SHIPPING_THRESHOLD, getCategoryCount } from '../data/products';
import {
  Layers, Truck, Shield, RotateCcw, Headphones, Trophy, ChevronLeft, ChevronRight,
  Zap, Home as HomeIcon, Smartphone, ShoppingCart, Clock,
} from '../components/Icons';

// Bloque promocional fijo (no depende del catálogo en vivo, así siempre se ve
// aunque el backend esté caído o la categoría no exista en el catálogo real).
const PROMO_CARDS = [
  {
    name: 'Electrodomésticos', discount: 40, bg: '#00B894',
    nameColor: 'text-white', labelColor: 'text-white/80', numColor: 'text-[#0B2D6B]',
    iconBg: 'rgba(255,255,255,0.2)', iconColor: '#FFFFFF', icon: <Zap size={34} />,
  },
  {
    name: 'Hogar', discount: 50, bg: '#FFFFFF',
    nameColor: 'text-[#0B2D6B]', labelColor: 'text-gray-400', numColor: 'text-[#1976E8]',
    iconBg: '#EAF2FF', iconColor: '#1976E8', icon: <HomeIcon size={34} />,
  },
  {
    name: 'Tecnología', discount: 35, bg: '#FDF3D7',
    nameColor: 'text-[#0B2D6B]', labelColor: 'text-[#0B2D6B]/60', numColor: 'text-[#1976E8]',
    iconBg: '#FFFFFF', iconColor: '#1976E8', icon: <Smartphone size={34} />,
  },
  {
    name: 'Supermercado', discount: 30, bg: '#E7F0FF',
    nameColor: 'text-[#0B2D6B]', labelColor: 'text-[#0B2D6B]/60', numColor: 'text-[#1976E8]',
    iconBg: '#FFFFFF', iconColor: '#1976E8', icon: <ShoppingCart size={34} />,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { products, categories, catalogLoading } = useStore();
  const heroProducts = products.slice(0, 6);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const id = setInterval(() => setHeroSlide(s => (s + 1) % heroProducts.length), 5000);
    return () => clearInterval(id);
  }, [heroProducts.length]);

  const featured   = products.slice(0, 8);
  const sales      = products.filter(p => p.isOnSale);
  const bestSellers = products.filter(p => p.isBestSeller);
  const newItems   = products.filter(p => p.isNew);
  const hogarBannerProduct = products.find(p => p.categoryId === 'hogar') ?? products[0];

  if (catalogLoading) {
    return <div className="py-24 text-center text-sm text-gray-400">Cargando catálogo…</div>;
  }

  const activeHeroProduct = heroProducts.length > 0 ? heroProducts[heroSlide % heroProducts.length] : null;
  const goPrevHero = () => setHeroSlide(s => (s - 1 + heroProducts.length) % heroProducts.length);
  const goNextHero = () => setHeroSlide(s => (s + 1) % heroProducts.length);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0B2D6B] flex min-h-[280px] sm:min-h-[320px]">
          <div className="relative flex-1 overflow-hidden flex items-center px-6 sm:px-10 py-7">
            <div className="relative z-10 max-w-[300px] sm:max-w-[360px]">
              <span className="inline-block bg-[#F4C20D] text-[#0B2D6B] text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide">
                DÍAS DE AHORRO
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-[1.1]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Todo para<br />tu hogar,<br /><span className="text-[#F4C20D]">en un solo lugar</span>
              </h1>
              <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-white text-xs font-medium">
                <span className="flex items-center gap-1.5"><Truck size={14} /> Envíos a todo Colombia</span>
                <span className="flex items-center gap-1.5"><Shield size={14} /> Compra 100% segura</span>
                <span className="flex items-center gap-1.5"><Trophy size={14} /> Las mejores marcas, al mejor precio</span>
              </div>
              <button
                onClick={() => navigate('/categories/ofertas')}
                className="mt-5 bg-white text-[#0B2D6B] font-bold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-gray-100 active:bg-gray-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                ¡Ver ofertas! <ChevronRight size={14} />
              </button>
            </div>

            {/* Producto destacado — uno solo, sin tarjeta de fondo: se difumina
                hacia los bordes para integrarse con el diagonal en vez de
                verse como una foto recortada flotando encima. */}
            {activeHeroProduct && (
              <div className="hidden lg:flex absolute inset-y-0 left-[27%] w-[48%] items-center justify-center z-10">
                <img
                  key={activeHeroProduct.id}
                  src={activeHeroProduct.image}
                  alt={activeHeroProduct.name}
                  className="w-[72%] h-[72%] object-contain animate-hero-fade"
                  style={{
                    maskImage: 'radial-gradient(ellipse 58% 58% at center, black 55%, transparent 88%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 58% 58% at center, black 55%, transparent 88%)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Right info panel */}
          <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col justify-center items-start px-7 bg-[#EAF2FF]">
            <h3 className="text-xl font-bold text-[#0B2D6B] leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Las mejores<br />marcas para<br /><span className="text-[#1976E8]">tu hogar</span>
            </h3>
            <span className="w-10 h-1 bg-[#F4C20D] my-2.5 block rounded-full" />
            <div className="bg-[#00B894] text-white rounded-2xl px-5 py-3.5 text-center mt-1">
              <p className="text-xs font-semibold">Hasta</p>
              <p className="text-3xl font-extrabold leading-none">50<span className="text-base align-top">%</span></p>
              <p className="text-xs">De dto.</p>
            </div>
          </div>

          {/* Carousel controls — funcionales: recorren heroProducts */}
          {heroProducts.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrevHero}
                aria-label="Producto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white active:bg-gray-200 flex items-center justify-center text-[#0B2D6B] z-20 shadow outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goNextHero}
                aria-label="Producto siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white active:bg-gray-200 flex items-center justify-center text-[#0B2D6B] z-20 shadow outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {heroProducts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setHeroSlide(i)}
                    aria-label={`Ver producto ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all outline-none ${i === heroSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Promo cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {PROMO_CARDS.map(card => (
            <button
              key={card.name}
              onClick={() => navigate('/categories/ofertas')}
              className="relative rounded-2xl overflow-hidden text-left p-5 h-[170px] flex flex-col justify-between border border-black/5"
              style={{ backgroundColor: card.bg }}
            >
              <div className="relative z-10">
                <p className={`text-sm font-bold ${card.nameColor}`}>{card.name}</p>
                <p className={`text-xs mt-1 ${card.labelColor}`}>Hasta</p>
                <p className={`text-3xl font-extrabold leading-none ${card.numColor}`}>
                  {card.discount}<span className="text-base align-top">%</span>
                </p>
                <p className={`text-xs ${card.labelColor}`}>de dto.</p>
              </div>
              <span className="relative z-10 inline-block w-fit bg-[#F4C20D] text-[#0B2D6B] text-xs font-bold px-3 py-1.5 rounded-full">
                Ver ofertas
              </span>
              <span
                className="absolute right-3 bottom-3 w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </span>
            </button>
          ))}
        </div>

        {/* Trust bar */}
        <div className="border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 py-6 my-6">
          {[
            { icon: <Truck size={26} />, title: 'Envío gratis', desc: `En compras mayores a ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
            { icon: <Shield size={26} />, title: 'Compra segura', desc: 'Transacciones protegidas SSL' },
            { icon: <RotateCcw size={26} />, title: 'Devoluciones', desc: 'Hasta 30 días sin inconvenientes' },
            { icon: <Headphones size={26} />, title: 'Soporte', desc: 'Lun–Sáb 8 am–6 pm' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <span className="text-[#1976E8] flex-shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
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

        {/* Anuncio promocional */}
        <section className="py-10 border-b border-gray-100">
          <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Copy */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-gray-300" />
                  <span className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase">Especial de Hogar</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D6B] leading-tight mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Organizadores, decoración<br />y todo para tu hogar
                </h2>
                <button
                  onClick={() => navigate('/categories/hogar')}
                  className="self-start bg-[#E11D48] hover:bg-[#c81742] active:bg-[#a91339] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/40"
                >
                  ¡Llévalo todo!
                </button>
              </div>

              {/* Descuento */}
              <div className="flex sm:flex-col items-center justify-center gap-1 px-6 py-6 border-t sm:border-t-0 sm:border-l border-gray-100 flex-shrink-0 sm:w-52">
                <p className="text-xs font-extrabold text-[#E11D48] tracking-widest">HASTA EL</p>
                <p className="text-5xl sm:text-6xl font-extrabold text-[#E11D48] leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  50<span className="text-xl align-top">%</span>
                </p>
                <p className="text-xs font-extrabold text-[#E11D48] tracking-widest">DCTO.</p>
                <p className="text-xs text-gray-500 sm:mt-1">Cualquier medio de pago</p>
              </div>

              {/* Imagen */}
              {hogarBannerProduct && (
                <div className="relative hidden md:block flex-1 min-h-[220px] bg-gray-100">
                  <img
                    src={hogarBannerProduct.image}
                    alt={hogarBannerProduct.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Letra pequeña */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
              <p className="text-[11px] text-gray-400">
                Válido hasta el 30 de septiembre de 2026. Stock limitado. No acumulable con otras promociones.
              </p>
              <p className="text-[11px] text-gray-500">
                <span className="font-semibold text-gray-700">Contáctanos:</span> 01 8000 123 456 · soporte@surtitiendasgalvan.co
              </p>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section className="py-10 border-b border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Productos destacados</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline tracking-wide uppercase">Ver todos</button>
          </div>
          <ProductCarousel products={featured} />
        </section>

        {/* Flash sales + promos */}
        <section className="py-10 border-b border-gray-100">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Flash sale */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0B2D6B]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Ofertas del <span className="text-[#1976E8]">día</span>
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Productos increíbles por tiempo limitado</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-[#F4C20D]"><Clock size={16} /></span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">Termina en</span>
                    <Countdown endTime={FLASH_SALE_END} />
                  </div>
                  <button
                    onClick={() => navigate('/categories')}
                    className="text-sm font-bold text-[#1976E8] hover:underline flex items-center gap-1 whitespace-nowrap"
                  >
                    Ver todas <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <ProductCarousel products={sales} />
            </div>

            {/* Promo banners */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/categories/facial')}
                className="flex-1 rounded-2xl overflow-hidden flex items-stretch bg-[#FDF3E7] group text-left"
              >
                <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-[#0B2D6B]/60 mb-1">Nueva colección</p>
                  <p className="text-lg font-bold text-[#0B2D6B] leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Cuidado Facial 2026</p>
                  <p className="text-xs text-gray-500 mt-1 mb-2">Sérums y cremas premium para una piel radiante</p>
                  <span className="text-sm font-bold text-[#1976E8] flex items-center gap-1">Descubrir <ChevronRight size={14} /></span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop&auto=format"
                  alt="Cuidado facial"
                  className="w-2/5 flex-shrink-0 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
              <button
                onClick={() => navigate('/categories/papeleria')}
                className="flex-1 rounded-2xl overflow-hidden flex items-stretch bg-[#E7F0FF] group text-left"
              >
                <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-[#0B2D6B]/60 mb-1">Temporada escolar</p>
                  <p className="text-lg font-bold text-[#0B2D6B] leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Útiles y Papelería</p>
                  <p className="text-xs text-gray-500 mt-1 mb-2">Todo lo que necesitas para un gran comienzo</p>
                  <span className="text-sm font-bold text-[#1976E8] flex items-center gap-1">Ver productos <ChevronRight size={14} /></span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop&auto=format"
                  alt="Papelería escolar"
                  className="w-2/5 flex-shrink-0 object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
          <ProductCarousel products={bestSellers} />
        </section>

        {/* New arrivals */}
        <section className="py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Nuevos productos</h2>
            <button onClick={() => navigate('/categories')} className="text-xs text-[#C84B11] font-semibold hover:underline uppercase tracking-wide">Ver todos</button>
          </div>
          <ProductCarousel products={newItems} />
        </section>
      </div>
    </div>
  );
}
