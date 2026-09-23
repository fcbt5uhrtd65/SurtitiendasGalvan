import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../services/orders.service';
import { ArrowLeft, Check } from '../components/Icons';

const stepDefs = ['Pendiente', 'Confirmado', 'Empacado', 'Enviado', 'Entregado'];
const statusToStep: Record<OrderStatus, number> = {
  PENDIENTE: 1, CONFIRMADO: 2, EMPACADO: 3, ENVIADO: 4, ENTREGADO: 5, CANCELADO: 0,
};
const statusColors: Record<OrderStatus, string> = {
  PENDIENTE: 'text-amber-600 bg-amber-50',
  CONFIRMADO: 'text-indigo-600 bg-indigo-50',
  EMPACADO: 'text-blue-600 bg-blue-50',
  ENVIADO: 'text-purple-600 bg-purple-50',
  ENTREGADO: 'text-green-700 bg-green-50',
  CANCELADO: 'text-red-600 bg-red-50',
};
const statusLabels = ORDER_STATUS_LABELS;

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useStore();

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Mis pedidos</h1>
        </div>
        <div className="border border-gray-200 p-16 text-center">
          <div className="w-12 h-12 border-2 border-gray-200 mx-auto mb-4 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-5">No tienes pedidos aún.</p>
          <button onClick={() => navigate('/home')} className="bg-[#C84B11] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#a83a0d] transition-colors">
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Mis pedidos</h1>
        <span className="text-sm text-gray-400">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {orders.map(order => {
          const activeStep = statusToStep[order.status] ?? 1;
          const isCancelled = order.status === 'CANCELADO';
          return (
            <div key={order.id} className="border border-gray-200 p-6">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="font-bold text-gray-900 font-mono text-sm">{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.date} · {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.items.map(i => i.name).join(', ')}</p>
                  {order.deliveryMethod && (
                    <p className="text-xs text-gray-400 mt-0.5">{order.deliveryMethod} · {order.paymentMethod}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider ${statusColors[order.status] ?? 'text-gray-600 bg-gray-100'}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  <p className="font-bold text-gray-900 text-base mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Timeline (hide if cancelled) */}
              {!isCancelled && (
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-3.5 left-3.5 right-3.5 h-px bg-gray-200" />
                  <div
                    className="absolute top-3.5 left-3.5 h-px bg-gray-900 transition-all"
                    style={{ width: `${((activeStep - 1) / (stepDefs.length - 1)) * 100}%` }}
                  />
                  {stepDefs.map((label, i) => {
                    const done = i + 1 <= activeStep;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-colors ${
                          done ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-300'
                        }`}>
                          {done ? <Check size={12} /> : i + 1}
                        </div>
                        <span className={`text-xs font-medium text-center ${done ? 'text-gray-700' : 'text-gray-300'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
