import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { getCategoryCount } from '../data/products';
import { PencilRuler, Sparkles, Droplets, FlaskConical, BookOpen, Palette, Home as HomeIcon, ChevronRight } from '../components/Icons';

const catIcons: Record<string, React.ReactNode> = {
  papeleria: <PencilRuler size={28} />,
  belleza:   <Sparkles size={28} />,
  capilar:   <Droplets size={28} />,
  facial:    <FlaskConical size={28} />,
  libros:    <BookOpen size={28} />,
  pinturas:  <Palette size={28} />,
  hogar:     <HomeIcon size={28} />,
};

export default function Categories() {
  const navigate = useNavigate();
  const { categories, products, catalogLoading } = useStore();

  if (catalogLoading) {
    return <div className="py-24 text-center text-sm text-gray-400">Cargando categorías…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">Catálogo</p>
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Todas las categorías</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/categories/${cat.slug}`)}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left group hover:border-[#C84B11] hover:shadow-sm transition-all flex items-start gap-5"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[#C84B11] transition-colors">
              {catIcons[cat.slug]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 group-hover:text-[#C84B11] transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {cat.name}
                </h3>
                <ChevronRight size={16} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{getCategoryCount(cat.slug, products)} productos disponibles</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
