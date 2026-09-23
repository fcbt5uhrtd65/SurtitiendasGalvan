import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { formatPrice, type Product } from '../data/products';
import { Heart, Plus } from './Icons';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(product.id);

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer group hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.discount && (
            <span className="bg-[#C84B11] text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full uppercase">
              -{product.discount}%
            </span>
          )}
          {product.isNew && !product.discount && (
            <span className="bg-gray-900 text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full uppercase">
              Nuevo
            </span>
          )}
        </div>

        {/* favorite */}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            fav ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500 shadow-sm'
          }`}
        >
          <Heart size={15} filled={fav} />
        </button>

        {/* add to cart — appears on hover */}
        <button
          onClick={e => { e.stopPropagation(); addToCart(product); }}
          className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
        >
          <Plus size={13} /> Agregar al carrito
        </button>
      </div>

      <div className="p-3">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{product.brand}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-2">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
