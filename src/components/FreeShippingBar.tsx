import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/products';
import { Truck, Check } from './Icons';

export default function FreeShippingBar({ cartTotal }: { cartTotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
  const qualifies = remaining <= 0;
  const progress = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className={`border p-4 ${qualifies ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className={qualifies ? 'text-green-600' : 'text-[#C84B11]'}>
          {qualifies ? <Check size={16} /> : <Truck size={16} />}
        </span>
        <p className={`text-sm font-semibold ${qualifies ? 'text-green-700' : 'text-gray-800'}`}>
          {qualifies
            ? '¡Tu pedido tiene envío gratis!'
            : <>Te faltan <span className="text-[#C84B11] font-bold">{formatPrice(remaining)}</span> para envío gratis</>}
        </p>
      </div>
      <div className="h-1.5 bg-white rounded-full overflow-hidden border border-black/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${qualifies ? 'bg-green-500' : 'bg-[#C84B11]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
