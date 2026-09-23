import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatPrice } from '../../data/products';
import { ORDER_STATUS_LABELS } from '../../services/orders.service';

type SortKey = 'name' | 'spent-desc' | 'orders-desc' | 'date-desc' | 'date-asc';

export default function Customers() {
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('spent-desc');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = customers
    .filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'spent-desc') return b.totalSpent - a.totalSpent;
      if (sort === 'orders-desc') return b.totalOrders - a.totalOrders;
      if (sort === 'date-desc') return b.registeredAt.localeCompare(a.registeredAt);
      return a.registeredAt.localeCompare(b.registeredAt);
    });

  const selectedCustomer = customers.find(c => c.id === selected);
  const customerOrders = selectedCustomer
    ? orders.filter(o => o.customerName === selectedCustomer.name || o.customerEmail === selectedCustomer.email)
    : [];

  // Stats
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length;
  const avgSpend = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;
  const cityBreakdown = customers.reduce<Record<string, number>>((acc, c) => {
    acc[c.city] = (acc[c.city] || 0) + 1;
    return acc;
  }, {});
  const topCity = Object.entries(cityBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} registrados · {activeCustomers} con compras</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Clientes totales', value: customers.length, sub: 'registrados' },
          { label: 'Con compras', value: activeCustomers, sub: `${customers.length - activeCustomers} sin compras` },
          { label: 'Gasto promedio', value: formatPrice(avgSpend), sub: 'por cliente activo' },
          { label: 'Ciudad top', value: topCity?.[0] ?? '—', sub: `${topCity?.[1] ?? 0} clientes` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 p-4">
            <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white border border-gray-200 p-4 flex gap-3 items-center mb-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente…"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 text-sm outline-none focus:border-gray-400" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              className="border border-gray-200 text-sm px-3 py-2 outline-none focus:border-gray-400 bg-white">
              <option value="spent-desc">Mayor gasto</option>
              <option value="orders-desc">Más pedidos</option>
              <option value="name">Nombre A-Z</option>
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Cliente', 'Ciudad', 'Teléfono', 'Registro', 'Pedidos', 'Total gastado'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(selected === c.id ? null : c.id)}
                    className={`cursor-pointer transition-colors ${selected === c.id ? 'bg-orange-50 border-l-2 border-l-[#C84B11]' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {c.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.registeredAt}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${c.totalOrders > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                        {c.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${c.totalSpent > 0 ? 'text-emerald-700' : 'text-gray-300'}`}>
                        {c.totalSpent > 0 ? formatPrice(c.totalSpent) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No se encontraron clientes</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} de {customers.length} clientes
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedCustomer && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 sticky top-6">
              {/* Profile */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-900 flex items-center justify-center text-white font-bold text-base">
                    {selectedCustomer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <p className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedCustomer.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedCustomer.email}</p>
                <p className="text-xs text-gray-400">{selectedCustomer.phone}</p>
                {selectedCustomer.totalOrders >= 3 && (
                  <span className="mt-2 inline-block text-[10px] border border-[#C84B11] text-[#C84B11] px-2 py-0.5 font-bold uppercase">
                    Cliente frecuente
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-b border-gray-100">
                {[
                  ['Pedidos', selectedCustomer.totalOrders],
                  ['Ciudad', selectedCustomer.city],
                  ['Total gastado', selectedCustomer.totalSpent > 0 ? formatPrice(selectedCustomer.totalSpent) : '—'],
                  ['Desde', selectedCustomer.registeredAt],
                ].map(([k, v]) => (
                  <div key={String(k)} className="p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>

              {/* Orders */}
              <div className="p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Historial de pedidos</p>
                {customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.map(o => (
                      <div key={o.id} className="border border-gray-100 p-2.5 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold text-gray-600">{o.id}</span>
                          <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>{o.date}</span>
                          <span className={`font-semibold ${
                            o.status === 'ENTREGADO' ? 'text-green-600' :
                            o.status === 'CANCELADO' ? 'text-red-500' : 'text-amber-600'
                          }`}>
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Sin pedidos registrados</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
