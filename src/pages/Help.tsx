import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, HelpCircle } from '../components/Icons';

const FAQ = [
  {
    question: '¿Cuánto tarda el envío?',
    answer: 'Los envíos a domicilio llegan entre 2 y 3 días hábiles. Recoger en tienda está listo en 2 horas hábiles.',
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

export default function Help() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Ayuda y soporte</h1>
      </div>

      <div className="border border-gray-200 p-5 mb-8 flex items-start gap-4">
        <span className="text-[#C84B11] mt-0.5"><HelpCircle size={20} /></span>
        <div>
          <p className="text-sm font-semibold text-gray-900">¿Necesitas hablar con alguien?</p>
          <p className="text-sm text-gray-500 mt-1">
            Escríbenos a <span className="font-semibold text-gray-700">soporte@surtitiendasgalvan.co</span> o llámanos al{' '}
            <span className="font-semibold text-gray-700">01 8000 123 456</span>, de lunes a sábado, 8 am – 6 pm.
          </p>
        </div>
      </div>

      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Preguntas frecuentes</h2>
      <div className="border border-gray-200 divide-y divide-gray-100">
        {FAQ.map((item, i) => (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
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
    </div>
  );
}
