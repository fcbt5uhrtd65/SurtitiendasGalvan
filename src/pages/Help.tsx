import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/products';
import { ArrowLeft, ChevronDown, HelpCircle } from '../components/Icons';

const FAQ = [
  {
    question: '¿Cuánto tarda el envío?',
    answer: 'Los envíos a domicilio llegan entre 2 y 3 días hábiles en ciudades principales. Recoger en tienda está listo en 2 horas hábiles.',
  },
  {
    question: '¿Cómo hago una devolución?',
    answer: 'Tienes hasta 30 días desde la entrega para devolver un producto sin usar. Escríbenos por soporte con el número de tu pedido.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Tarjeta de crédito/débito, transferencia electrónica (Nequi, Daviplata, PSE) y pago contra entrega.',
  },
  {
    question: '¿Cómo uso un cupón de descuento?',
    answer: 'Ingresa el código en el campo de cupón dentro de tu carrito, antes de ir al checkout.',
  },
  {
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Por ahora este cambio no está disponible desde el panel de cuenta — escríbenos por soporte y te ayudamos.',
  },
];

const SECTIONS = [
  { id: 'faq', label: 'Preguntas frecuentes' },
  { id: 'envios', label: 'Envíos y entregas' },
  { id: 'devoluciones', label: 'Devoluciones' },
  { id: 'privacidad', label: 'Política de privacidad' },
  { id: 'terminos', label: 'Términos y condiciones' },
];

export default function Help() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/account')} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-[#0B2D6B]" style={{ fontFamily: 'Outfit, sans-serif' }}>Ayuda y soporte</h1>
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
          <div className="flex lg:hidden flex-wrap gap-2 mb-8">
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

          <div className="rounded-2xl border border-gray-100 bg-[#EAF2FF]/40 p-5 mb-10 flex items-start gap-4">
            <span className="text-[#1976E8] mt-0.5"><HelpCircle size={20} /></span>
            <div>
              <p className="text-sm font-semibold text-gray-900">¿Necesitas hablar con alguien?</p>
              <p className="text-sm text-gray-500 mt-1">
                Escríbenos a <span className="font-semibold text-gray-700">soporte@surtitiendasgalvan.co</span> o llámanos al{' '}
                <span className="font-semibold text-gray-700">01 8000 123 456</span>, de lunes a sábado, 8 am – 6 pm.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-6 mb-10">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Preguntas frecuentes</h2>
        <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {FAQ.map((item, i) => (
            <div key={item.question}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">{item.question}</span>
                <span className={`text-gray-400 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              </button>
              {openIndex === i && (
                <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Envíos y entregas */}
      <section id="envios" className="scroll-mt-6 mb-10">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Envíos y entregas</h2>
        <div className="rounded-2xl border border-gray-100 p-5 space-y-2.5 text-sm text-gray-600 leading-relaxed">
          <p>Hacemos envíos a todo Colombia. En ciudades principales, tu pedido llega entre 2 y 3 días hábiles; al resto del país, entre 3 y 5 días hábiles.</p>
          <p>Envío gratis en compras mayores a <span className="font-semibold text-gray-800">{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>. Por debajo de ese monto se cobra un costo fijo de envío al finalizar la compra.</p>
          <p>También puedes elegir <span className="font-semibold text-gray-800">recoger en tienda</span>: tu pedido queda listo en 2 horas hábiles, sin costo adicional.</p>
          <p>Puedes seguir el estado de tu pedido desde <span className="font-semibold text-gray-800">Mi cuenta → Mis pedidos</span>.</p>
        </div>
      </section>

      {/* Devoluciones */}
      <section id="devoluciones" className="scroll-mt-6 mb-10">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Devoluciones</h2>
        <div className="rounded-2xl border border-gray-100 p-5 space-y-2.5 text-sm text-gray-600 leading-relaxed">
          <p>Tienes hasta <span className="font-semibold text-gray-800">30 días</span> desde la entrega para devolver un producto sin usar y en su empaque original.</p>
          <p>Para iniciar una devolución, escríbenos con el número de tu pedido y coordinamos la recogida o el cambio. El reembolso se procesa una vez confirmamos el estado del producto.</p>
          <p>Por norma sanitaria, los productos de belleza y cuidado facial abiertos o usados no tienen devolución.</p>
        </div>
      </section>

      {/* Política de privacidad */}
      <section id="privacidad" className="scroll-mt-6 mb-10">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Política de privacidad</h2>
        <div className="rounded-2xl border border-gray-100 p-5 space-y-2.5 text-sm text-gray-600 leading-relaxed">
          <p>Recogemos solo los datos necesarios para atenderte: nombre, correo, teléfono y dirección de envío.</p>
          <p>Los usamos para procesar tus pedidos, contactarte sobre tu compra y mejorar nuestro servicio — nunca los vendemos ni los compartimos con terceros, salvo con la transportadora y la pasarela de pago, lo estrictamente necesario para completar tu compra.</p>
          <p>Puedes pedirnos consultar, corregir o eliminar tu información escribiendo a soporte@surtitiendasgalvan.co.</p>
        </div>
      </section>

      {/* Términos y condiciones */}
      <section id="terminos" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-[#0B2D6B] uppercase tracking-widest mb-3">Términos y condiciones</h2>
        <div className="rounded-2xl border border-gray-100 p-5 space-y-2.5 text-sm text-gray-600 leading-relaxed">
          <p>Al comprar en Surtitiendas Galván aceptas estos términos. Los precios están expresados en pesos colombianos (COP) e incluyen los impuestos aplicables.</p>
          <p>Nos reservamos el derecho de cancelar un pedido por error de precio, falta de stock o indicios de fraude, notificándote y reembolsando cualquier pago realizado.</p>
          <p>Las promociones tienen vigencia limitada y no son acumulables entre sí, salvo que se indique lo contrario en la oferta.</p>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
