import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell } from '../components/Icons';

interface Preferences {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  newsletter: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  orderUpdates: true,
  promotions: true,
  newArrivals: false,
  newsletter: false,
};

const STORAGE_KEY = 'surtiweb_notification_preferences';

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // localStorage no disponible — las preferencias no persisten entre sesiones
  }
}

const OPTIONS: { key: keyof Preferences; label: string; desc: string }[] = [
  { key: 'orderUpdates', label: 'Estado de mis pedidos', desc: 'Confirmación, envío y entrega de tus compras' },
  { key: 'promotions', label: 'Ofertas y promociones', desc: 'Descuentos y cupones disponibles' },
  { key: 'newArrivals', label: 'Nuevos productos', desc: 'Cuando lleguen novedades al catálogo' },
  { key: 'newsletter', label: 'Boletín semanal', desc: 'Resumen de la tienda por correo' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => { setPreferences(loadPreferences()); }, []);

  const toggle = (key: keyof Preferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    savePreferences(updated);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Notificaciones</h1>
      </div>

      <div className="border border-gray-200 divide-y divide-gray-100">
        {OPTIONS.map(option => (
          <div key={option.key} className="flex items-center gap-4 px-5 py-4">
            <span className="text-gray-400"><Bell size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
            </div>
            <button
              onClick={() => toggle(option.key)}
              className={`w-11 h-6 p-0 rounded-full transition-colors relative flex-shrink-0 ${preferences[option.key] ? 'bg-[#C84B11]' : 'bg-gray-200'}`}
            >
              <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferences[option.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
