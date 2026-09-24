import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { ApiError } from '../services/http';
import { confirmPasswordReset } from '../services/auth.service';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const linkInvalid = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Restablecer contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Elige una nueva contraseña para tu cuenta.</p>
        </div>

        {linkInvalid ? (
          <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3">
            <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Este enlace no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.</span>
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3">
              <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Tu contraseña se actualizó correctamente.</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest block mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" autoComplete="new-password" required
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

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest block mb-1.5">Confirmar contraseña</label>
              <input
                type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña" autoComplete="new-password" required
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-700 transition-colors placeholder-gray-300"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
                <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={!password || !confirm || loading}
              className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#C84B11] font-semibold hover:underline">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
