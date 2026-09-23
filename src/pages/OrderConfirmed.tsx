import { useNavigate, useLocation } from 'react-router';
import { Check } from '../components/Icons';
import { formatPrice } from '../data/products';

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = (location.state ?? {}) as { orderId?: string; total?: number };

  const deliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 bg-green-600 flex items-center justify-center text-white mx-auto mb-6">
        <Check size={24} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Pedido confirmado
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Gracias por tu compra. Hemos recibido tu pedido y te notificaremos cuando esté en camino.
      </p>

      <div className="border border-gray-200 p-6 text-left space-y-3 mb-8">
        {[
          ['Número de pedido', orderId ?? '—'],
          ['Estado', 'Recibido — en proceso'],
          ['Entrega estimada', deliveryDate],
          ...(total ? [['Total pagado', formatPrice(total)]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-start text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold text-gray-900 text-right ${
              label === 'Número de pedido' ? 'font-mono text-[#C84B11]' : ''
            }`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="w-full bg-gray-900 text-white font-semibold py-3 text-sm hover:bg-gray-700 transition-colors"
        >
          Ver estado del pedido
        </button>
        <button
          onClick={() => navigate('/home')}
          className="w-full border border-gray-200 text-gray-700 font-semibold py-3 text-sm hover:border-gray-400 transition-colors"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  );
}
