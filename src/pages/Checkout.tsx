import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { ApiError } from '../services/http';
import { Check } from '../components/Icons';

type Step = 0 | 1 | 2 | 3 | 4;
const steps = ['Datos personales', 'Dirección', 'Método de entrega', 'Método de pago', 'Resumen y confirmación'];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, placeOrder, currentUser, authLoading } = useStore();
  const [step, setStep] = useState<Step>(0);
  const [delivery, setDelivery] = useState<'home' | 'store'>('home');
  const [payment, setPayment] = useState<'card' | 'transfer' | 'cod'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: '', lastName: '', phone: '', email: '',
    address: '', city: '', department: '', postal: '', notes: '',
  });

  useEffect(() => {
    if (!authLoading && !currentUser) navigate('/login');
  }, [authLoading, currentUser, navigate]);

  const shipping = cartTotal >= 80000 ? 0 : 9000;
  const total = cartTotal + shipping;
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const paymentLabel = { card: 'Tarjeta crédito/débito', transfer: 'Transferencia electrónica', cod: 'Pago contra entrega' };
  const deliveryLabel = { home: 'Envío a domicilio', store: 'Recoger en tienda' };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const order = await placeOrder({
        shippingCity: form.city || 'Sin ciudad',
        shippingAddress: form.address || 'Sin dirección',
        paymentMethod: paymentLabel[payment],
        deliveryMethod: deliveryLabel[delivery],
      });
      navigate('/order-confirmed', { state: { orderId: order.id, total: order.total } });
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'No se pudo confirmar el pedido. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  const Field = ({ label, k, type = 'text', cls = '', placeholder = '' }: {
    label: string; k: string; type?: string; cls?: string; placeholder?: string;
  }) => (
    <div className={cls}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={form[k as keyof typeof form]}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600 transition-colors bg-white"
      />
    </div>
  );

  const RadioOption = ({ value, current, onSelect, children }: {
    value: string; current: string; onSelect: () => void; children: React.ReactNode;
  }) => (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 border text-left transition-colors ${
        value === current ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        value === current ? 'border-gray-900' : 'border-gray-300'
      }`}>
        {value === current && <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />}
      </div>
      {children}
    </button>
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">Tu carrito está vacío.</p>
        <button onClick={() => navigate('/home')} className="bg-[#C84B11] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#a83a0d] transition-colors">
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Finalizar compra</h1>

      {/* Progress */}
      <div className="flex items-center mb-10 overflow-x-auto">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-colors ${
                i < step  ? 'bg-gray-900 border-gray-900 text-white' :
                i === step ? 'border-gray-900 text-gray-900 bg-white' :
                'border-gray-200 text-gray-300 bg-white'
              }`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden md:block ${
                i === step ? 'text-gray-900' : i < step ? 'text-gray-500' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < 4 && <div className={`h-px w-6 md:w-10 mx-2 ${i < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>{steps[step]}</h2>

            {step === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" k="name" />
                <Field label="Apellido" k="lastName" />
                <Field label="Teléfono" k="phone" type="tel" />
                <Field label="Correo electrónico" k="email" type="email" />
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Dirección" k="address" cls="col-span-2" />
                <Field label="Ciudad" k="city" />
                <Field label="Departamento" k="department" />
                <Field label="Código postal" k="postal" />
                <Field label="Notas para el domiciliario" k="notes" cls="col-span-2" placeholder="Opcional" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <RadioOption value="home" current={delivery} onSelect={() => setDelivery('home')}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Envío a domicilio</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {shipping === 0 ? 'Gratis — entrega en 2 a 3 días hábiles' : `${formatPrice(shipping)} — entrega en 2 a 3 días hábiles`}
                    </p>
                  </div>
                </RadioOption>
                <RadioOption value="store" current={delivery} onSelect={() => setDelivery('store')}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Recoger en tienda</p>
                    <p className="text-xs text-gray-500 mt-0.5">Gratis — listo en 2 horas hábiles</p>
                  </div>
                </RadioOption>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {[
                  { key: 'card',     title: 'Tarjeta crédito o débito', desc: 'Visa, Mastercard, American Express' },
                  { key: 'transfer', title: 'Transferencia electrónica', desc: 'Nequi, Daviplata, PSE' },
                  { key: 'cod',      title: 'Pago contra entrega',      desc: 'Efectivo al recibir el pedido' },
                ].map(opt => (
                  <RadioOption key={opt.key} value={opt.key} current={payment} onSelect={() => setPayment(opt.key as typeof payment)}>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{opt.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </RadioOption>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-sm">
                <div className="bg-gray-50 border border-gray-100 p-4 space-y-2 text-gray-600">
                  <p><strong className="text-gray-900 font-semibold">Contacto:</strong> {form.name} {form.lastName} · {form.phone} · {form.email}</p>
                  <p><strong className="text-gray-900 font-semibold">Dirección:</strong> {form.address || '—'}, {form.city || '—'}, {form.department} {form.postal}</p>
                  <p><strong className="text-gray-900 font-semibold">Entrega:</strong> {deliveryLabel[delivery]}</p>
                  <p><strong className="text-gray-900 font-semibold">Pago:</strong> {paymentLabel[payment]}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 py-3 items-center">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover bg-gray-50 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">x{quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitError && (
              <div className="mt-6 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
                <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => (s - 1) as Step)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={() => step === 4 ? handleConfirm() : setStep(s => (s + 1) as Step)}
                disabled={submitting}
                className="flex-1 bg-[#C84B11] text-white font-semibold py-2.5 text-sm hover:bg-[#a83a0d] transition-colors disabled:opacity-50"
              >
                {step === 4 ? (submitting ? 'Confirmando…' : 'Confirmar pedido') : `Continuar: ${steps[step + 1]}`}
              </button>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="border border-gray-200 p-5 sticky top-36">
            <h3 className="font-bold text-gray-900 text-sm mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Resumen del pedido</h3>
            <div className="space-y-3 divide-y divide-gray-50">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 items-center pt-3 first:pt-0">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover bg-gray-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-[11px] text-gray-400">x{quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{formatPrice(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Envío</span><span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                <span>Total</span>
                <span style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
