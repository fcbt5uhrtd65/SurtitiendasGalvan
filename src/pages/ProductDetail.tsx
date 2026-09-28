import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import ProductCarousel from '../components/ProductCarousel';
import * as catalogService from '../services/catalog.service';
import { formatPrice, FREE_SHIPPING_THRESHOLD, type Product } from '../data/products';
import { placeholderRating } from '../utils/rating';
import {
  ArrowLeft, Heart, Plus, Minus, Truck, Shield, RotateCcw, Check, ChevronRight,
  ShoppingCart, Star,
} from '../components/Icons';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products, addToCart, toggleFavorite, isFavorite } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    catalogService.getProduct(productId)
      .then(p => { setProduct(p); setSelectedVariantId(p.variantId); setActiveImg(0); setQty(1); })
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
  const { stars, count } = placeholderRating(product.id);
  const fullStars = Math.round(stars);

  // Si el producto tiene varias presentaciones (talla/tamaño), la seleccionada
  // manda sobre precio/stock; con una sola variante (el caso actual del
  // catálogo) esto simplemente refleja los datos del producto.
  const variants = product.variants ?? [];
  const activeVariant = variants.find(v => v.id === selectedVariantId) ?? variants[0];
  const displayPrice = activeVariant?.price ?? product.price;
  const displayOriginalPrice = activeVariant?.originalPrice ?? product.originalPrice;
  const displayStock = activeVariant?.stock ?? product.stock;
  const displayDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
    : undefined;

  const buildCartProduct = (): Product => activeVariant
    ? { ...product, variantId: activeVariant.id, price: activeVariant.price, originalPrice: activeVariant.originalPrice, stock: activeVariant.stock }
    : product;

  const handleAdd = () => {
    addToCart(buildCartProduct(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(buildCartProduct(), qty);
    navigate('/cart');
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
            <div className="relative aspect-square bg-gray-50 border border-gray-100 overflow-hidden mb-3">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  fav ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={16} filled={fav} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 border overflow-hidden transition-colors ${
                      i === activeImg ? 'border-[#0B2D6B]' : 'border-gray-200 hover:border-gray-400'
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
            <h1 className="text-3xl font-bold text-[#0B2D6B] leading-tight mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} filled={i < fullStars} />)}
              </div>
              <span className="text-sm text-gray-400">({count} opiniones)</span>
            </div>

            {/* Price + badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <span className="text-4xl font-bold text-[#0B2D6B]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(displayPrice)}
              </span>
              {displayOriginalPrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(displayOriginalPrice)}</span>
              )}
              {displayDiscount ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  -{displayDiscount}%
                </span>
              ) : null}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                displayStock > 10 ? 'bg-emerald-50 text-emerald-700' : displayStock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
              }`}>
                {displayStock > 0 && (
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white ${displayStock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <Check size={9} />
                  </span>
                )}
                {displayStock > 10 ? 'En stock' : displayStock > 0 ? `Últimas ${displayStock} unidades` : 'Sin stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-[#0B2D6B] mb-2.5">Características</p>
                <ul className="space-y-2">
                  {product.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-[#1976E8] mt-0.5 flex-shrink-0"><Check size={14} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size / presentation selector — solo si el producto tiene más de una variante */}
            {variants.length > 1 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-[#0B2D6B] mb-2.5">Tamaño:</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        v.id === activeVariant?.id
                          ? 'bg-[#1976E8] border-[#1976E8] text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-[#1976E8]'
                      }`}
                    >
                      {v.presentation}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors rounded-l-full"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(displayStock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors rounded-r-full"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 h-11 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  added ? 'bg-emerald-600 text-white' : 'bg-[#1976E8] text-white hover:bg-[#125fc0]'
                }`}
              >
                <ShoppingCart size={16} />
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full h-11 rounded-full border-2 border-[#1976E8] text-[#1976E8] font-bold text-sm hover:bg-[#1976E8] hover:text-white transition-colors mb-6"
            >
              Comprar ahora
            </button>

            {/* Trust */}
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {[
                { icon: <Truck size={15} />, text: `Envío gratis en compras mayores a ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
                { icon: <Shield size={15} />, text: 'Compra segura con protección SSL' },
                { icon: <RotateCcw size={15} />, text: 'Devoluciones gratuitas hasta 30 días' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500">
                  <span className="text-[#1976E8]">{icon}</span>
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
            <ProductCarousel products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
