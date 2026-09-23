import { useState } from 'react';
import { useNavigate } from 'react-router';
import { COUPONS } from '../data/coupons';
import { ArrowLeft, Tag, Check } from '../components/Icons';

export default function Coupons() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Mis cupones</h1>
      </div>

      <div className="space-y-3">
        {COUPONS.map(coupon => (
          <div key={coupon.code} className="border border-gray-200 p-5 flex items-center gap-4">
            <span className="w-10 h-10 bg-orange-50 text-[#C84B11] flex items-center justify-center flex-shrink-0"><Tag size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold text-gray-900">{coupon.code}</p>
              <p className="text-sm text-gray-500 mt-0.5">{coupon.description}</p>
            </div>
            <button
              onClick={() => copyCode(coupon.code)}
              className="px-3 py-2 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              {copied === coupon.code ? <><Check size={13} /> Copiado</> : 'Copiar código'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Aplica el código en tu carrito antes de pagar para obtener el descuento.
      </p>
    </div>
  );
}
