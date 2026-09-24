import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import * as catalogService from '../services/catalog.service';
import { formatPrice, FREE_SHIPPING_THRESHOLD, type Product } from '../data/products';
import { ArrowLeft, Heart, Plus, Minus, Truck, Shield, RotateCcw, Check, ChevronRight } from '../components/Icons';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, addToCart, toggleFavorite, isFavorite } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<'description' | 'features'>('description');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    catalogService.getProduct(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <div className="py-24 text-center text-sm text-gray-400">Cargando producto…</div>;
  }

  if (!product) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-400">
      <p className="text-lg">Producto no encontrado</p>
      <button onClick={() => navigate('/categories')} className="mt-4 text-sm text-[#C84B11] hover:underline">
        Volver al catálogo
      </button>
    </div>
  );

  const fav = isFavorite(product.id);
  const images = product.images || [product.image];
  const related = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <button onClick={() => navigate('/home')} className="hover:text-gray-700">Inicio</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(`/categories/${product.categoryId}`)} className="hover:text-gray-700">{product.category}</button>
          <ChevronRight size={12} />
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-gray-50 border border-gray-100 overflow-hidden mb-3">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 border overflow-hidden transition-colors ${
                      i === activeImg ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">{product.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h1>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Últimas ${product.stock} unidades` : 'Sin stock'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm font-semibold text-[#C84B11] bg-orange-50 px-2 py-0.5">
                    -{product.discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 flex gap-6 mb-4">
              {[{ key: 'description', label: 'Descripción' }, { key: 'features', label: 'Características' }].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as 'description' | 'features')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                    tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'description' ? (
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
            ) : (
              <ul className="space-y-2.5 mb-6">
                {product.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-[#C84B11] mt-0.5 flex-shrink-0"><Check size={14} /></span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-200 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 h-10 font-semibold text-sm transition-colors ${
                  added ? 'bg-green-600 text-white' : 'bg-[#C84B11] text-white hover:bg-[#a83a0d]'
                }`}
              >
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>

              <button
                onClick={() => { addToCart(product, qty); navigate('/cart'); }}
                className="h-10 px-5 border border-gray-900 text-gray-900 font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors"
              >
                Comprar ya
              </button>

              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                  fav ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700'
                }`}
              >
                <Heart size={16} filled={fav} />
              </button>
            </div>

            {/* Trust */}
            <div className="border border-gray-100 divide-y divide-gray-100">
              {[
                { icon: <Truck size={15} />, text: `Envío gratis en compras mayores a ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
                { icon: <Shield size={15} />, text: 'Compra segura con protección SSL' },
                { icon: <RotateCcw size={15} />, text: 'Devoluciones gratuitas hasta 30 días' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500">
                  <span className="text-gray-400">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {related.map(p => (
                <div key={p.id} className="bg-white">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
