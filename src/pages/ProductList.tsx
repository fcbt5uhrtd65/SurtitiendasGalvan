import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { formatPrice, getCategoryCount } from '../data/products';
import { ChevronRight, ChevronDown, Search, Layers, Tag, Coins, RotateCcw } from '../components/Icons';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';
type PriceFilter = 'all' | 20000 | 50000 | 100000 | 'custom';

const PRICE_LIMIT = 200000;
const VISIBLE_CATEGORY_ROWS = 8;

function FilterCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
          <span className="text-gray-700">{icon}</span>
          {title}
        </span>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} />
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { products, categories, catalogLoading } = useStore();
  const [sort, setSort] = useState<SortKey>('popular');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(PRICE_LIMIT);
  const [categorySearch, setCategorySearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const isOffers = categoryId === 'ofertas';
  const category = categories.find(c => c.slug === categoryId);

  let filtered = products.filter(p =>
    isOffers ? p.isOnSale : (!categoryId || p.categoryId === categoryId)
  );
  if (onSaleOnly) filtered = filtered.filter(p => p.isOnSale);
  if (newOnly)    filtered = filtered.filter(p => p.isNew);
  if (priceFilter === 'custom') filtered = filtered.filter(p => p.price >= customMin && p.price <= customMax);
  else if (priceFilter !== 'all') filtered = filtered.filter(p => p.price <= priceFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc')  return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'newest')     return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'popular',    label: 'Más vendidos' },
    { key: 'price-asc',  label: 'Precio: menor a mayor' },
    { key: 'price-desc', label: 'Precio: mayor a menor' },
    { key: 'newest',     label: 'Más recientes' },
  ];

  const categoryRows = useMemo(() => {
    const rows = [
      { slug: null as string | null, label: 'Todos los productos', count: products.length, active: !categoryId },
      { slug: 'ofertas', label: 'Ofertas', count: products.filter(p => p.isOnSale).length, active: isOffers },
      ...categories.map(cat => ({
        slug: cat.slug, label: cat.name, count: getCategoryCount(cat.slug, products), active: categoryId === cat.slug,
      })),
    ];
    if (!categorySearch.trim()) return rows;
    const term = categorySearch.trim().toLowerCase();
    return rows.filter(r => r.label.toLowerCase().includes(term));
  }, [categories, products, categoryId, isOffers, categorySearch]);

  const visibleCategoryRows = showAllCategories ? categoryRows : categoryRows.slice(0, VISIBLE_CATEGORY_ROWS);

  const hasActiveFilters = onSaleOnly || newOnly || priceFilter !== 'all';
  const clearFilters = () => { setOnSaleOnly(false); setNewOnly(false); setPriceFilter('all'); setCustomMin(0); setCustomMax(PRICE_LIMIT); };

  if (catalogLoading) {
    return <div className="py-24 text-center text-sm text-gray-400">Cargando productos…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
        <button onClick={() => navigate('/home')} className="hover:text-gray-700 transition-colors">Inicio</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate('/categories')} className="hover:text-gray-700 transition-colors">Categorías</button>
        {category && (
          <>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">{category.name}</span>
          </>
        )}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-36 space-y-4">
            <FilterCard icon={<Layers size={16} />} title="Categorías">
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
                <input
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  placeholder="Buscar categorías…"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-md outline-none focus:border-gray-300"
                />
              </div>
              <div className="space-y-1">
                {visibleCategoryRows.map(row => (
                  <label
                    key={row.slug ?? 'all'}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      row.active ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={row.active}
                      onChange={() => navigate(row.slug ? `/categories/${row.slug}` : '/products')}
                      className="w-4 h-4 accent-[#C84B11] rounded flex-shrink-0"
                    />
                    <span className={`flex-1 min-w-0 truncate text-sm ${row.active ? 'text-[#C84B11] font-semibold' : 'text-gray-600'}`}>
                      {row.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      row.active ? 'bg-orange-100 text-[#C84B11]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {row.count}
                    </span>
                  </label>
                ))}
              </div>
              {categoryRows.length > VISIBLE_CATEGORY_ROWS && (
                <button
                  onClick={() => setShowAllCategories(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#C84B11] hover:underline mt-2"
                >
                  {showAllCategories ? '− Ver menos categorías' : '+ Ver más categorías'}
                </button>
              )}
            </FilterCard>

            <FilterCard icon={<Tag size={16} />} title="Estado">
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={onSaleOnly} onChange={e => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#C84B11] rounded" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">En descuento</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#C84B11] rounded" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Nuevo ingreso</span>
                </label>
              </div>
            </FilterCard>

            <FilterCard icon={<Coins size={16} />} title="Precio máximo">
              <div className="space-y-2">
                {([
                  { key: 'all', label: 'Todos' },
                  { key: 20000, label: 'Hasta $20.000' },
                  { key: 50000, label: 'Hasta $50.000' },
                  { key: 100000, label: 'Hasta $100.000' },
                  { key: 'custom', label: 'Personalizar rango' },
                ] as const).map(opt => (
                  <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="price" checked={priceFilter === opt.key}
                      onChange={() => setPriceFilter(opt.key)} className="accent-[#C84B11]" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>

              {priceFilter === 'custom' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      <span className="text-xs text-gray-400">$</span>
                      <input type="number" min={0} max={customMax} value={customMin}
                        onChange={e => setCustomMin(Math.min(Number(e.target.value) || 0, customMax - 1000))}
                        className="w-full text-sm bg-transparent outline-none" />
                    </div>
                    <span className="text-gray-300">–</span>
                    <div className="flex-1 flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5">
                      <span className="text-xs text-gray-400">$</span>
                      <input type="number" min={customMin} max={PRICE_LIMIT} value={customMax}
                        onChange={e => setCustomMax(Math.max(Number(e.target.value) || 0, customMin + 1000))}
                        className="w-full text-sm bg-transparent outline-none" />
                    </div>
                  </div>
                  <div className="relative h-4">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#C84B11] rounded-full"
                      style={{
                        left: `${(customMin / PRICE_LIMIT) * 100}%`,
                        right: `${100 - (customMax / PRICE_LIMIT) * 100}%`,
                      }}
                    />
                    <input
                      type="range" min={0} max={PRICE_LIMIT} step={1000} value={customMin}
                      onChange={e => setCustomMin(Math.min(Number(e.target.value), customMax - 1000))}
                      className="range-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 pointer-events-none"
                    />
                    <input
                      type="range" min={0} max={PRICE_LIMIT} step={1000} value={customMax}
                      onChange={e => setCustomMax(Math.max(Number(e.target.value), customMin + 1000))}
                      className="range-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full h-1.5 pointer-events-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span>{formatPrice(customMin)}</span>
                    <span>{formatPrice(customMax)}</span>
                  </div>
                </div>
              )}
            </FilterCard>

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#C84B11] bg-orange-50 hover:bg-orange-100 disabled:opacity-40 disabled:hover:bg-orange-50 rounded-lg py-3 transition-colors"
            >
              <RotateCcw size={14} /> Limpiar filtros
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {isOffers ? 'Ofertas y descuentos' : (category?.name ?? 'Todos los productos')}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{sorted.length} resultado{sorted.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:block">Ordenar:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="border border-gray-200 text-sm px-3 py-2 outline-none focus:border-gray-400 bg-white rounded-md"
              >
                {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-100">
              {sorted.map(p => (
                <div key={p.id} className="bg-white">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 text-gray-400">
              <p className="font-semibold text-gray-600 text-base mb-2">Sin resultados para estos filtros</p>
              <button onClick={clearFilters} className="text-sm text-[#C84B11] hover:underline mt-2">Limpiar filtros</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
