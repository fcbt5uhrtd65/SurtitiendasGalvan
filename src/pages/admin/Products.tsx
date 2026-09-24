import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatPrice, type Product } from '../../data/products';
import { ApiError } from '../../services/http';

type FormData = Omit<Product, 'id' | 'images' | 'variantId'>;
type StockFilter = 'all' | 'ok' | 'low' | 'out';
type SortKey = 'name' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

const blank: FormData = {
  name: '', brand: '', price: 0, originalPrice: undefined, discount: undefined,
  image: '', category: '', categoryId: '',
  isNew: false, isBestSeller: false,
  description: '', features: [], stock: 10,
};

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdmin();
  const catOptions = categories;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(blank);
  const [featuresText, setFeaturesText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockVal, setStockVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [actionError, setActionError] = useState('');

  const filtered = products
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
      if (stockFilter === 'ok') return p.stock > 5;
      if (stockFilter === 'low') return p.stock > 0 && p.stock <= 5;
      if (stockFilter === 'out') return p.stock === 0;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'stock-asc') return a.stock - b.stock;
      if (sort === 'stock-desc') return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });

  const stockCounts = {
    all: products.length,
    ok: products.filter(p => p.stock > 5).length,
    low: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    out: products.filter(p => p.stock === 0).length,
  };

  const openAdd = () => { setForm(blank); setFeaturesText(''); setEditing(null); setSaveError(''); setModal('add'); };
  const openEdit = (p: Product) => {
    setEditing(p);
    const { id, images, ...rest } = p;
    setForm(rest);
    setFeaturesText(p.features.join('\n'));
    setSaveError('');
    setModal('edit');
  };
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const data = { ...form, features: featuresText.split('\n').filter(f => f.trim()) };
      if (modal === 'add') await addProduct(data);
      else if (editing) await updateProduct(editing.id, data);
      setModal(null);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : 'No se pudo guardar el producto. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };
  const f = (field: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  const saveStock = async (id: string) => {
    const n = parseInt(stockVal);
    if (isNaN(n) || n < 0) { setEditingStock(null); return; }
    try {
      await updateProduct(id, { stock: n });
      setEditingStock(null);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No se pudo actualizar el stock. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    try {
      await deleteProduct(id);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} en catálogo · {stockCounts.out} sin stock</p>
        </div>
        <button onClick={openAdd}
          className="bg-[#C84B11] text-white text-sm font-semibold px-4 py-2 hover:bg-[#a83a0d] transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {actionError && (
        <div className="mb-4 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
          <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white border border-gray-200 p-4 flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o marca…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 text-sm outline-none focus:border-gray-400" />
        </div>

        {/* Category */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 text-sm px-3 py-2 outline-none focus:border-gray-400 bg-white">
          <option value="all">Todas las categorías</option>
          {catOptions.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="border border-gray-200 text-sm px-3 py-2 outline-none focus:border-gray-400 bg-white">
          <option value="name">Nombre A-Z</option>
          <option value="price-asc">Precio ↑</option>
          <option value="price-desc">Precio ↓</option>
          <option value="stock-asc">Stock ↑</option>
          <option value="stock-desc">Stock ↓</option>
        </select>

        {/* Stock filter pills */}
        <div className="flex gap-1 ml-auto">
          {([
            { k: 'all' as StockFilter, label: `Todos (${stockCounts.all})`, cls: 'bg-gray-900 text-white' },
            { k: 'ok' as StockFilter, label: `En stock (${stockCounts.ok})`, cls: 'bg-emerald-600 text-white' },
            { k: 'low' as StockFilter, label: `Stock bajo (${stockCounts.low})`, cls: 'bg-amber-500 text-white' },
            { k: 'out' as StockFilter, label: `Sin stock (${stockCounts.out})`, cls: 'bg-red-600 text-white' },
          ]).map(({ k, label, cls }) => (
            <button key={k} onClick={() => setStockFilter(k)}
              className={`text-xs px-2.5 py-1.5 font-medium transition-colors ${
                stockFilter === k ? cls : 'border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Etiquetas', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.stock === 0 ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight max-w-[180px] truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                  {p.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>}
                </td>
                <td className="px-4 py-3">
                  {editingStock === p.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={stockVal} onChange={e => setStockVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveStock(p.id); if (e.key === 'Escape') setEditingStock(null); }}
                        className="w-16 border border-gray-300 text-sm px-2 py-1 outline-none focus:border-[#C84B11]"
                        autoFocus />
                      <button onClick={() => saveStock(p.id)} className="text-green-600 hover:text-green-800">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button onClick={() => setEditingStock(null)} className="text-gray-400 hover:text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingStock(p.id); setStockVal(String(p.stock)); }}
                      className={`text-sm font-bold tabular-nums flex items-center gap-1 group ${
                        p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                      title="Clic para editar stock"
                    >
                      {p.stock}
                      <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.isNew && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5">NUEVO</span>}
                    {p.isBestSeller && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5">TOP</span>}
                    {p.isOnSale && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5">OFERTA</span>}
                    {!p.isNew && !p.isBestSeller && !p.isOnSale && <span className="text-[10px] text-gray-300">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)}
                      className="px-2.5 py-1.5 text-xs border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      Editar
                    </button>
                    {deleteConfirm === p.id ? (
                      <>
                        <button onClick={() => handleDelete(p.id)}
                          className="px-2.5 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors">
                          Sí, eliminar
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1.5 text-xs border border-gray-200 text-gray-500 transition-colors">
                          No
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="px-2.5 py-1.5 text-xs border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                  No hay productos con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Mostrando {filtered.length} de {products.length} productos
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {modal === 'add' ? 'Nuevo producto' : `Editar: ${editing?.name}`}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Completa los campos y guarda los cambios</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Basic info */}
              <section>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Información básica</p>
                <div className="grid grid-cols-2 gap-4">
                  <MF label="Nombre del producto" required>
                    <input value={form.name} onChange={e => f('name', e.target.value)} className={inp} placeholder="Ej: Cuaderno A4 Universitario" />
                  </MF>
                  <MF label="Marca" required>
                    <input value={form.brand} onChange={e => f('brand', e.target.value)} className={inp} placeholder="Ej: Norma" />
                  </MF>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <MF label="Categoría" required>
                    <select value={form.categoryId} onChange={e => {
                      const cat = catOptions.find(c => c.slug === e.target.value);
                      f('categoryId', e.target.value);
                      if (cat) f('category', cat.name);
                    }} className={inp}>
                      <option value="">Seleccionar…</option>
                      {catOptions.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </MF>
                  <MF label="Stock inicial">
                    <input type="number" min="0" value={form.stock} onChange={e => f('stock', Number(e.target.value))} className={inp} />
                  </MF>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Precios</p>
                <div className="grid grid-cols-2 gap-4">
                  <MF label="Precio venta (COP)" required>
                    <input type="number" value={form.price || ''} onChange={e => f('price', Number(e.target.value))} className={inp} placeholder="35000" />
                  </MF>
                  <MF label="Precio original (tachado)">
                    <input type="number" value={form.originalPrice || ''} onChange={e => f('originalPrice', Number(e.target.value) || undefined)} className={inp} placeholder="Sin precio original" />
                  </MF>
                </div>
                {form.price > 0 && form.originalPrice && form.originalPrice > form.price && (
                  <p className="text-xs text-green-600 mt-2">
                    Ahorro: {formatPrice(form.originalPrice - form.price)} ({Math.round((1 - form.price / form.originalPrice) * 100)}% OFF)
                  </p>
                )}
              </section>

              {/* Image */}
              <section>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Imagen</p>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input value={form.image} onChange={e => f('image', e.target.value)} className={inp}
                      placeholder="https://images.unsplash.com/…" />
                    <p className="text-[11px] text-gray-400 mt-1">Pega una URL de Unsplash u otro servicio de imágenes</p>
                  </div>
                  {form.image ? (
                    <img src={form.image} alt="preview"
                      className="w-20 h-20 object-cover border border-gray-200 flex-shrink-0 bg-gray-50"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-200 flex-shrink-0 flex flex-col items-center justify-center text-gray-300 gap-1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Description */}
              <section>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Descripción y características</p>
                <MF label="Descripción">
                  <textarea value={form.description} onChange={e => f('description', e.target.value)}
                    rows={3} className={`${inp} resize-none`} placeholder="Descripción detallada del producto…" />
                </MF>
                <div className="mt-4">
                  <MF label="Características (una por línea)">
                    <textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)}
                      rows={4} className={`${inp} resize-none font-mono text-xs`}
                      placeholder={"Material premium\nDisponible en varios colores\nIncluye accesorios"} />
                  </MF>
                </div>
              </section>

              {/* Labels & flags */}
              <section>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Etiquetas y visibilidad</p>
                <div className="flex gap-6">
                  {([
                    { key: 'isNew', label: 'Nuevo ingreso', color: 'text-blue-600' },
                    { key: 'isBestSeller', label: 'Más vendido', color: 'text-orange-600' },
                  ] as const).map(({ key, label, color }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={!!form[key]} onChange={e => f(key, e.target.checked)}
                        className="accent-[#C84B11] w-4 h-4" />
                      <span className={`text-sm font-medium ${color}`}>{label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-3">
                  "En oferta" se activa automáticamente cuando pones un precio original mayor al precio de venta, arriba en Precios.
                </p>
              </section>
            </div>

            {saveError && (
              <div className="mx-6 mb-4 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
                <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} disabled={saving}
                className="px-5 py-2.5 text-sm border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-40">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price || !form.categoryId || saving}
                className="px-6 py-2.5 text-sm bg-[#C84B11] text-white font-semibold hover:bg-[#a83a0d] transition-colors disabled:opacity-40"
              >
                {saving ? 'Guardando…' : modal === 'add' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = 'w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500 transition-colors bg-white';

function MF({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
