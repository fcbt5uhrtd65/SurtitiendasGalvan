import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { ArrowLeft } from '../components/Icons';

export default function Favorites() {
  const navigate = useNavigate();
  const { products, favorites } = useStore();
  const favProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Mis favoritos
          <span className="text-base text-gray-400 font-normal ml-2">({favProducts.length})</span>
        </h1>
      </div>

      {favProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-100">
          {favProducts.map(p => (
            <div key={p.id} className="bg-white">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-28">
          <p className="text-base font-semibold text-gray-600 mb-2">Sin favoritos guardados</p>
          <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
            Presiona el ícono de corazón en cualquier producto para guardarlo aquí.
          </p>
          <button onClick={() => navigate('/home')} className="bg-gray-900 text-white font-semibold px-8 py-2.5 text-sm hover:bg-gray-700 transition-colors">
            Explorar catálogo
          </button>
        </div>
      )}
    </div>
  );
}
