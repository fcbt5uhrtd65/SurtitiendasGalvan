import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { ApiError } from '../services/http';

export default function Login() {
  const navigate = useNavigate();
  const { login, authError, clearAuthError, currentUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');

  useEffect(() => { if (currentUser) navigate('/account'); }, [currentUser, navigate]);
  useEffect(() => { clearAuthError(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNetworkError('');
    try {
      const ok = await login(email, password);
      if (ok) navigate('/account');
      else setLoading(false);
    } catch (error) {
      setNetworkError(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const errorMsg = networkError || (authError === 'invalid_credentials'
    ? 'Correo o contraseña incorrectos. Inténtalo de nuevo.'
    : null);

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
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-1">Accede a tu cuenta de Surtitiendas Galván</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest block mb-1.5">Correo electrónico</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email" required
              className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-700 transition-colors placeholder-gray-300"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Contraseña</label>
              <button type="button" className="text-[11px] text-[#C84B11] hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password" required
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-700 transition-colors placeholder-gray-300 pr-10"
              />
              <button
                type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
              <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit" disabled={!email || !password || loading}
            className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#C84B11] font-semibold hover:underline">
            Regístrate gratis
          </Link>
        </p>

        {/* Admin separator */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Acceso panel administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
