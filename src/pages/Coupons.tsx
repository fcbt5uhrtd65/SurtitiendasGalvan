import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { LOYALTY_MILESTONE_ORDER_NUMBER, LOYALTY_DISCOUNT_RATE, countValidPurchases } from '../services/orders.service';
import { ArrowLeft, Gift, Check } from '../components/Icons';

export default function Coupons() {
  const navigate = useNavigate();
  const { orders } = useStore();
  const validPurchases = countValidPurchases(orders);
  const earned = validPurchases >= LOYALTY_MILESTONE_ORDER_NUMBER;
  const remaining = Math.max(0, LOYALTY_MILESTONE_ORDER_NUMBER - validPurchases);
  const progress = Math.min(100, Math.round((validPurchases / LOYALTY_MILESTONE_ORDER_NUMBER) * 100));

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Recompensa de fidelidad</h1>
      </div>

      <div className={`border p-6 ${earned ? 'border-[#C84B11] bg-orange-50' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-5">
          <span className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${earned ? 'bg-[#C84B11] text-white' : 'bg-orange-50 text-[#C84B11]'}`}>
            {earned ? <Check size={22} /> : <Gift size={22} />}
          </span>
          <div>
            <p className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {Math.round(LOYALTY_DISCOUNT_RATE * 100)}% de descuento en tu compra número {LOYALTY_MILESTONE_ORDER_NUMBER}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {earned
                ? 'Ya usaste este regalo — ¡gracias por ser un cliente fiel!'
                : 'Se aplica automáticamente al pagar, sin necesidad de código'}
            </p>
          </div>
        </div>

        <div className="h-2 bg-white rounded-full overflow-hidden border border-black/5 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${earned ? 'bg-[#C84B11]' : 'bg-gray-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {earned
            ? `Llevas ${validPurchases} compras completadas`
            : `Llevas ${validPurchases} de ${LOYALTY_MILESTONE_ORDER_NUMBER} compras · Te falta${remaining !== 1 ? 'n' : ''} ${remaining}`}
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Solo cuentan las compras entregadas o en proceso; los pedidos cancelados no suman para esta recompensa.
      </p>
    </div>
  );
}
