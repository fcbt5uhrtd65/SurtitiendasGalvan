import { LOYALTY_MILESTONE_ORDER_NUMBER, countValidPurchases, type Order } from '../services/orders.service';
import { Gift, Check } from './Icons';

export default function LoyaltyBanner({ orders }: { orders: Order[] }) {
  const validPurchases = countValidPurchases(orders);
  const purchaseNumber = validPurchases + 1;
  const remaining = LOYALTY_MILESTONE_ORDER_NUMBER - purchaseNumber;

  if (remaining < 0) return null; // el regalo ya se usó en una compra anterior

  const isMilestone = remaining === 0;
  const progress = Math.min(100, Math.round((purchaseNumber / LOYALTY_MILESTONE_ORDER_NUMBER) * 100));

  return (
    <div className={`border p-4 ${isMilestone ? 'border-[#C84B11] bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className={isMilestone ? 'text-[#C84B11]' : 'text-gray-400'}>
          {isMilestone ? <Check size={16} /> : <Gift size={16} />}
        </span>
        <p className={`text-sm font-semibold ${isMilestone ? 'text-[#C84B11]' : 'text-gray-700'}`}>
          {isMilestone
            ? '¡Esta es tu compra número 10! Tienes un 10% de descuento de regalo 🎉'
            : <>Llevas {validPurchases} compra{validPurchases !== 1 ? 's' : ''} · Te falta{remaining !== 1 ? 'n' : ''} <span className="font-bold">{remaining}</span> para tu regalo del 10%</>}
        </p>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isMilestone ? 'bg-[#C84B11]' : 'bg-gray-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
