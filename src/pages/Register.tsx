import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { ApiError } from '../services/http';

export default function Register() {
  const navigate = useNavigate();
  const { register, authError, clearAuthError, currentUser } = useStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', city: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [networkError, setNetworkError] = useState('');

  useEffect(() => { if (currentUser) navigate('/account'); }, [currentUser, navigate]);
  useEffect(() => { clearAuthError(); }, []);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setFieldErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!form.email.includes('@')) errs.email = 'Ingresa un correo válido';
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setNetworkError('');
    try {
      const ok = await register(form.name.trim(), form.email.trim(), form.password, form.phone, form.city);
      if (ok) navigate('/account');
      else setLoading(false);
    } catch (error) {
      setNetworkError(error instanceof ApiError ? error.message : 'No se pudo crear la cuenta. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Débil', 'Aceptable', 'Segura'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver a la tienda
          </button>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Regístrate para comprar en Surtitiendas Galván</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Field label="Nombre completo" error={fieldErrors.name}>
            <input
              value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Laura Galván" autoComplete="name"
              className={input(!!fieldErrors.name)}
            />
          </Field>

          {/* Email */}
          <Field label="Correo electrónico" error={fieldErrors.email}>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="tu@correo.com" autoComplete="email"
              className={input(!!fieldErrors.email)}
            />
          </Field>

          {/* Phone + City */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input
                type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="300 123 4567" autoComplete="tel"
                className={input(false)}
              />
            </Field>
            <Field label="Ciudad">
              <input
                value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Bogotá"
                className={input(false)}
              />
            </Field>
          </div>

          {/* Password */}
          <Field label="Contraseña" error={fieldErrors.password}>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                className={`${input(!!fieldErrors.password)} pr-10`}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-100'}`} />
                  ))}
                </div>
                <span className={`text-[11px] font-semibold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </Field>

          {/* Confirm */}
          <Field label="Confirmar contraseña" error={fieldErrors.confirm}>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)}
                placeholder="Repite tu contraseña" autoComplete="new-password"
                className={`${input(!!fieldErrors.confirm)} pr-10`}
              />
              {form.confirm && form.password === form.confirm && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          </Field>

          {/* Email taken / network error */}
          {(authError === 'email_taken' || networkError) && (
            <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
              <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>
                {authError === 'email_taken'
                  ? <>Ya existe una cuenta con ese correo. <Link to="/login" className="underline font-semibold">Inicia sesión</Link></>
                  : networkError}
              </span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Al registrarte aceptas nuestros{' '}
            <span className="text-gray-600 underline cursor-pointer">términos y condiciones</span>
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#C84B11] font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full border px-4 py-3 text-sm outline-none transition-colors placeholder-gray-300 ${
    hasError ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-gray-700'
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
