import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loginError } = useAdmin();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/admin/dashboard'); }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(user, pass);
    if (ok) navigate('/admin/dashboard');
    else setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-80 bg-[#C84B11] flex-col justify-between p-10 flex-shrink-0">
        <div>
          <div className="w-10 h-10 bg-white/20 flex items-center justify-center mb-8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold leading-tight mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Panel de administración
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Gestiona productos, pedidos, clientes y visualiza el rendimiento de tu tienda.
          </p>
        </div>
        <div className="space-y-3">
          {['Dashboard con métricas', 'Gestión de productos', 'Seguimiento de pedidos', 'Directorio de clientes'].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/home" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Volver a la tienda
            </Link>
            <div className="flex items-center gap-2 mb-1 lg:hidden">
              <div className="w-6 h-6 bg-[#C84B11] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span className="text-gray-400 text-xs font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>Surtitiendas Galván</span>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Acceso restringido</h1>
            <p className="text-gray-500 text-sm mt-1">Solo para administradores autorizados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Correo electrónico</label>
              <input
                type="email" value={user} onChange={e => setUser(e.target.value)}
                placeholder="admin@surtiweb.com" autoComplete="username"
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 text-sm outline-none focus:border-[#C84B11] transition-colors placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 text-sm outline-none focus:border-[#C84B11] transition-colors placeholder-gray-600 pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950 border border-red-900 px-3 py-2.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loginError}
              </div>
            )}

            <button
              type="submit" disabled={!user || !pass || loading}
              className="w-full bg-[#C84B11] text-white font-semibold py-3 text-sm hover:bg-[#a83a0d] transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'Verificando...' : 'Ingresar al panel'}
            </button>
          </form>

          <div className="mt-6 bg-gray-900 border border-gray-800 px-4 py-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-400 mb-1">Acceso de administrador:</p>
            <p>Usa el correo y contraseña del superusuario que creaste con <code className="text-gray-300 font-mono">python manage.py createsuperuser</code>, o cualquier cuenta con rol ADMIN o VENDEDOR.</p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            ¿Eres cliente?{' '}
            <Link to="/login" className="text-gray-400 hover:text-gray-200 transition-colors underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
