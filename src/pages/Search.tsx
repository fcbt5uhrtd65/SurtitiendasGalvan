import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Search as SearchIcon, Clock, X } from '../components/Icons';

const popular = ['Shampoo', 'Cuadernos', 'Pintura acrílica', 'Crema facial', 'Labial', 'Sérum vitamina C', 'Colores Faber-Castell', 'Organizador bambú'];

export default function Search() {
  const { products, searchHistory, addSearch } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  // Sync with URL param on mount
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
  }, [searchParams]);

  const results = query.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim()) {
      addSearch(term);
      setSearchParams({ q: term });
    } else {
      setSearchParams({});
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Search input */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center border-b-2 border-gray-900">
          <span className="text-gray-400 mr-3"><SearchIcon size={20} /></span>
          <input
            autoFocus
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="flex-1 py-4 text-xl outline-none bg-transparent text-gray-900 placeholder-gray-300"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          />
          {query && (
            <button onClick={clearQuery} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {query.trim() === '' ? (
        <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-10">
          {searchHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Búsquedas recientes</h3>
              <div className="space-y-1">
                {searchHistory.map(term => (
                  <button key={term} onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-3 py-2.5 text-left text-sm text-gray-700 hover:text-[#C84B11] transition-colors group border-b border-gray-50">
                    <Clock size={13} />
                    <span className="flex-1">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tendencias</h3>
            <div className="flex flex-wrap gap-2">
              {popular.map(term => (
                <button key={term} onClick={() => handleSearch(term)}
                  className="border border-gray-200 text-sm text-gray-600 px-3 py-1.5 hover:border-gray-900 hover:text-gray-900 transition-colors rounded-full">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-6">
            {results.length} resultado{results.length !== 1 ? 's' : ''} para{' '}
            <strong className="text-gray-900">"{query}"</strong>
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-100">
              {results.map(p => (
                <div key={p.id} className="bg-white">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <p className="text-base font-semibold text-gray-600 mb-2">Sin resultados para "{query}"</p>
              <p className="text-sm mb-6">Intenta con otro término de búsqueda</p>
              <button onClick={clearQuery} className="text-sm text-[#C84B11] hover:underline">
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
