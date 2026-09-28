import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, HelpCircle, ImageIcon } from '../components/Icons';

const SECTIONS = [
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'trabaja-con-nosotros', label: 'Trabaja con nosotros' },
  { id: 'blog', label: 'Blog' },
  { id: 'contacto', label: 'Contacto' },
];

const WORKPLACE_PHOTOS = ['Nuestro equipo', 'Bodega y logística', 'Atención al cliente', 'Nuestras tiendas', 'Capacitaciones', 'Eventos internos'];

export default function Company() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/home')} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-[#0B2D6B]" style={{ fontFamily: 'Outfit, sans-serif' }}>La empresa</h1>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 lg:items-start">
        {/* Desktop sidebar nav */}
        <nav className="hidden lg:block sticky top-24 space-y-1">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#EAF2FF] hover:text-[#1976E8] transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 max-w-2xl">
          {/* Mobile jump nav */}
          <div className="flex lg:hidden flex-wrap gap-2 mb-10">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-semibold text-[#1976E8] bg-[#EAF2FF] hover:bg-[#dbe9fd] px-3 py-1.5 rounded-full transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>

          {/* Nosotros */}
          <section id="nosotros" className="scroll-mt-6 mb-12">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Nosotros</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Desde 1998, Surtitiendas Galván le trae a Colombia papelería, belleza, cuidado capilar y facial, libros, pinturas
          y todo para el hogar en un solo lugar — con variedad, precio justo y la cercanía de un almacén de barrio.
        </p>
      </section>

      {/* Trabaja con nosotros */}
      <section id="trabaja-con-nosotros" className="scroll-mt-6 mb-12">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Trabaja con nosotros</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          Somos un equipo que crece cada año. Si te gusta el trabajo en equipo y la atención al cliente, queremos conocerte.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {WORKPLACE_PHOTOS.map(label => (
            <div
              key={label}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-center p-3"
            >
              <span className="text-gray-300"><ImageIcon size={24} /></span>
              <span className="text-[11px] text-gray-400 font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>

        <a
          href="mailto:trabajaconnosotros@surtitiendasgalvan.co"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1976E8] bg-[#EAF2FF] hover:bg-[#dbe9fd] px-4 py-2.5 rounded-full transition-colors"
        >
          Envíanos tu hoja de vida a trabajaconnosotros@surtitiendasgalvan.co
        </a>
      </section>

      {/* Blog */}
      <section id="blog" className="scroll-mt-6 mb-12">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Blog</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Muy pronto vas a encontrar aquí tips, ideas y novedades de Surtitiendas Galván.
        </p>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Contacto</h2>
        <div className="rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
          <span className="text-[#1976E8] mt-0.5"><HelpCircle size={20} /></span>
          <div>
            <p className="text-sm font-semibold text-gray-900">¿Necesitas hablar con alguien?</p>
            <p className="text-sm text-gray-500 mt-1">
              Escríbenos a <span className="font-semibold text-gray-700">soporte@surtitiendasgalvan.co</span> o llámanos al{' '}
              <span className="font-semibold text-gray-700">01 8000 123 456</span>, de lunes a sábado, 8 am – 6 pm.
            </p>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
