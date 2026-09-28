import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { formatPrice, type Product } from '../data/products';
import { placeholderRating } from '../utils/rating';
import { Heart, ShoppingCart, Star } from './Icons';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(product.id);
  const { stars, count } = placeholderRating(product.id);
  const fullStars = Math.round(stars);

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
        />

        {/* badge */}
        <div className="absolute top-3 left-3">
          {product.discount ? (
            <span className="bg-[#E11D48] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              -{product.discount}%
            </span>
          ) : product.isNew ? (
            <span className="bg-[#00B894] text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Nuevo
            </span>
          ) : null}
        </div>

        {/* favorite */}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            fav ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart size={15} filled={fav} />
        </button>
      </div>

      <div className="p-3.5">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{product.brand}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-1.5">
          {product.name}
        </p>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} filled={i < fullStars} />)}
          </div>
          <span className="text-[11px] text-gray-400">({count})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-base font-bold text-gray-900 truncate">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); addToCart(product); }}
            aria-label="Agregar al carrito"
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1976E8] hover:bg-[#125fc0] active:bg-[#0f4fa8] text-white flex items-center justify-center transition-colors"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
