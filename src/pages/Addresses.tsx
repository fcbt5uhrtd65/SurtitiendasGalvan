import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import * as customersService from '../services/customers.service';
import type { Address } from '../services/customers.service';
import { ApiError } from '../services/http';
import { ArrowLeft, MapPin, Plus, Trash } from '../components/Icons';

const blankForm = { label: '', city: '', addressLine: '', isDefault: false };

export default function Addresses() {
  const navigate = useNavigate();
  const { currentUser, authLoading } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) navigate('/login');
  }, [authLoading, currentUser, navigate]);

  const load = () => {
    setLoading(true);
    customersService.listAddresses()
      .then(setAddresses)
      .catch(err => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus direcciones.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await customersService.createAddress(form);
      setForm(blankForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await customersService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la dirección.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customersService.updateAddress(id, { isDefault: true });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la dirección.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/account')} className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Mis direcciones</h1>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-12 text-center">Cargando direcciones…</p>
      ) : (
        <div className="space-y-3">
          {addresses.map(address => (
            <div key={address.id} className="border border-gray-200 p-4 flex items-start gap-4">
              <span className="text-gray-400 mt-0.5"><MapPin size={18} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{address.label}</p>
                  {address.isDefault && (
                    <span className="text-[10px] font-bold text-[#C84B11] border border-[#C84B11] px-1.5 py-0.5 uppercase">Principal</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{address.addressLine}, {address.city}</p>
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address.id)} className="text-xs text-[#C84B11] hover:underline mt-1.5">
                    Marcar como principal
                  </button>
                )}
              </div>
              <button
                onClick={() => handleDelete(address.id)}
                disabled={deletingId === address.id}
                className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}

          {addresses.length === 0 && !showForm && (
            <div className="border border-dashed border-gray-200 p-10 text-center">
              <p className="text-sm text-gray-400">Todavía no tienes direcciones guardadas.</p>
            </div>
          )}
        </div>
      )}

      {showForm ? (
        <div className="border border-gray-200 p-5 mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Etiqueta</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Casa, Oficina…" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Ciudad</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Bogotá" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Dirección</label>
            <input value={form.addressLine} onChange={e => setForm(f => ({ ...f, addressLine: e.target.value }))}
              placeholder="Calle 45 #12-34" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-600" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="accent-[#C84B11] w-4 h-4" />
            <span className="text-sm text-gray-600">Usar como dirección principal</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setForm(blankForm); }} disabled={saving}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-40">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !form.label || !form.city || !form.addressLine}
              className="px-5 py-2 text-sm bg-[#C84B11] text-white font-semibold hover:bg-[#a83a0d] transition-colors disabled:opacity-40">
              {saving ? 'Guardando…' : 'Guardar dirección'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#C84B11] hover:underline">
          <Plus size={14} /> Agregar nueva dirección
        </button>
      )}
    </div>
  );
}
