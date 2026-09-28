import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';

const HELP_LINKS = ['Preguntas frecuentes', 'Envíos y entregas', 'Devoluciones', 'Política de privacidad', 'Términos y condiciones'];
const COMPANY_LINKS = ['Nosotros', 'Trabaja con nosotros', 'Blog'];
const SOCIALS = ['Facebook', 'Instagram', 'Twitter', 'YouTube'];

export default function Footer() {
  const navigate = useNavigate();
  const { categories } = useStore();

  return (
    <footer className="bg-[#0B2D6B] text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#1976E8] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Surtitiendas Galván</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Tu tienda de confianza en papelería, belleza, libros, pinturas y artículos para el hogar. Calidad y precio justo desde 1998.
          </p>
          <div className="flex gap-3 mt-5">
            {SOCIALS.map(net => (
              <span key={net} className="text-xs text-white/40 cursor-default">
                {net}
              </span>
            ))}
          </div>
        </div>

        {/* La empresa */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>La empresa</h4>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map(l => (
              <li key={l} className="text-sm text-white/40 cursor-default">{l}</li>
            ))}
            <li>
              <button onClick={() => navigate('/help')} className="text-sm hover:text-white transition-colors">Contacto</button>
            </li>
          </ul>
        </div>

        {/* Ayuda */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Ayuda</h4>
          <ul className="space-y-2.5">
            {HELP_LINKS.map(l => (
              <li key={l}>
                <button onClick={() => navigate('/help')} className="text-sm hover:text-white transition-colors">{l}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Categorías */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Categorías</h4>
          <ul className="space-y-2.5">
            {categories.map(cat => (
              <li key={cat.id}>
                <button onClick={() => navigate(`/categories/${cat.slug}`)} className="text-sm hover:text-white transition-colors">
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 text-center">© 2026 Surtitiendas Galván. Todos los derechos reservados.</p>
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span className="text-xs text-white/40">Aceptamos:</span>
            {['Visa', 'Mastercard', 'PSE', 'Nequi', 'Daviplata', 'Efectivo'].map(m => (
              <span key={m} className="border border-white/20 text-white/50 text-[10px] px-2 py-0.5 rounded-full tracking-wide">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
