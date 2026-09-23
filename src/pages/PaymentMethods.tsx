import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, CreditCard, Plus, Trash } from '../components/Icons';

interface SavedMethod {
  id: string;
  brand: 'Visa' | 'Mastercard';
  lastFour: string;
  holder: string;
}

const STORAGE_KEY = 'surtiweb_payment_methods';

function loadMethods(): SavedMethod[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMethods(methods: SavedMethod[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  } catch {
    // localStorage no disponible — los métodos simplemente no persisten entre sesiones
  }
}

interface MethodForm {
  brand: SavedMethod['brand'];
  lastFour: string;
  holder: string;
}

const blankForm: MethodForm = { brand: 'Visa', lastFour: '', holder: '' };

export default function PaymentMethods() {
  const navigate = useNavigate();
  const { currentUser, authLoading } = useStore();
  const [methods, setMethods] = useState<SavedMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (!authLoading && !currentUser) navigate('/login');
  }, [authLoading, currentUser, navigate]);

  useEffect(() => { setMethods(loadMethods()); }, []);

  const addMethod = () => {
    const updated = [...methods, { id: `pm_${Date.now()}`, brand: form.brand, lastFour: form.lastFour, holder: form.holder }];
    setMethods(updated);
    saveMethods(updated);
    setForm(blankForm);
    setShowForm(false);
  };

  const removeMethod = (id: string) => {
    const updated = methods.filter(m => m.id !== id);
    setMethods(updated);
    saveMethods(updated);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Métodos de pago</h1>
      </div>

      <div className="mb-6 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2.5">
        Esta sección es una simulación — no procesamos ni almacenamos números de tarjeta reales. Al pagar de verdad, el checkout solo usa el método (tarjeta, transferencia o contra entrega) que elijas ahí.
      </div>

      <div className="space-y-3">
        {methods.map(method => (
          <div key={method.id} className="border border-gray-200 p-4 flex items-center gap-4">
            <span className="text-gray-400"><CreditCard size={20} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{method.brand} terminada en {method.lastFour}</p>
              <p className="text-xs text-gray-400">{method.holder}</p>
            </div>
            <button onClick={() => removeMethod(method.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash size={15} />
            </button>
          </div>
        ))}

        {methods.length === 0 && !showForm && (
          <div className="border border-dashed border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-400">No tienes métodos de pago guardados.</p>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="border border-gray-200 p-5 mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Marca</label>
              <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as SavedMethod['brand'] }))}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600 bg-white">
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Últimos 4 dígitos</label>
              <input value={form.lastFour} maxLength={4} onChange={e => setForm(f => ({ ...f, lastFour: e.target.value.replace(/\D/g, '') }))}
                placeholder="1234" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Nombre del titular</label>
            <input value={form.holder} onChange={e => setForm(f => ({ ...f, holder: e.target.value }))}
              placeholder="Como aparece en la tarjeta" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setForm(blankForm); }}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors">
              Cancelar
            </button>
            <button onClick={addMethod} disabled={form.lastFour.length !== 4 || !form.holder}
              className="px-5 py-2 text-sm bg-[#C84B11] text-white font-semibold hover:bg-[#a83a0d] transition-colors disabled:opacity-40">
              Guardar método
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#C84B11] hover:underline">
          <Plus size={14} /> Agregar método de pago
        </button>
      )}
    </div>
  );
}
