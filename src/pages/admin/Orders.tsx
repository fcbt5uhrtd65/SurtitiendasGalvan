import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, ORDER_STATUS_VALUES, type OrderStatus } from '../../services/orders.service';
import { formatPrice } from '../../data/products';
import { ApiError } from '../../services/http';

const ALL_STATUS = ORDER_STATUS_VALUES;
const STATUS_LABELS = ORDER_STATUS_LABELS;
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMADO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  EMPACADO: 'bg-amber-100 text-amber-700 border-amber-200',
  ENVIADO: 'bg-purple-100 text-purple-700 border-purple-200',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-200',
  CANCELADO: 'bg-red-100 text-red-600 border-red-200',
};
const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDIENTE: 'CONFIRMADO', CONFIRMADO: 'EMPACADO', EMPACADO: 'ENVIADO', ENVIADO: 'ENTREGADO',
};
const validOptionsFor = (status: OrderStatus): OrderStatus[] => [status, ...ORDER_STATUS_TRANSITIONS[status]];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [confirmStatus, setConfirmStatus] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [actionError, setActionError] = useState('');

  const filtered = orders
    .filter(o => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  const countFor = (s: OrderStatus | 'all') => s === 'all' ? orders.length : orders.filter(o => o.status === s).length;

  const applyStatus = async (id: string, status: OrderStatus) => {
    setConfirmStatus(null);
    try {
      await updateOrderStatus(id, status);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado del pedido. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} pedidos · {countFor('PENDIENTE') + countFor('CONFIRMADO') + countFor('EMPACADO')} pendientes</p>
        </div>
        {/* Sort toggle */}
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-2 text-gray-500 hover:border-gray-400 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points={sortDir === 'desc' ? '19 12 12 19 5 12' : '5 12 12 5 19 12'}/>
          </svg>
          {sortDir === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
        </button>
      </div>

      {actionError && (
        <div className="mb-4 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5">
          <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 flex flex-wrap gap-3 items-center mb-4">
        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          {(['all', ...ALL_STATUS] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 font-semibold transition-colors ${
                filter === s ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
              <span className={`ml-1.5 font-bold ${filter === s ? 'text-white/70' : 'text-gray-400'}`}>
                {countFor(s)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido, cliente…"
            className="pl-9 pr-4 py-2 border border-gray-200 text-sm outline-none focus:border-gray-400 w-56" />
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {filtered.map(order => {
          const isExpanded = expanded === order.id;
          const nextStatus = STATUS_NEXT[order.status];

          return (
            <div key={order.id} className={`bg-white border transition-colors ${isExpanded ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'}`}>
              {/* Order row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Expand toggle */}
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                {/* ID + customer */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-700">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{order.customerName}</p>
                  <p className="text-xs text-gray-400">{order.customerEmail} · {order.city}</p>
                </div>

                {/* Date */}
                <div className="hidden sm:block text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{order.date}</p>
                  <p className="text-xs text-gray-400">{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</p>
                </div>

                {/* Total */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(order.total)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {nextStatus && order.status !== 'CANCELADO' && (
                    confirmStatus?.id === order.id && confirmStatus.status === nextStatus ? (
                      <div className="flex gap-1">
                        <button onClick={() => applyStatus(order.id, nextStatus)}
                          className="text-xs bg-gray-900 text-white px-2.5 py-1.5 hover:bg-gray-700 transition-colors">
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmStatus(null)}
                          className="text-xs border border-gray-200 text-gray-500 px-2.5 py-1.5">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmStatus({ id: order.id, status: nextStatus })}
                        className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1.5 hover:border-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        → {STATUS_LABELS[nextStatus]}
                      </button>
                    )
                  )}

                  <select
                    value={order.status}
                    onChange={e => applyStatus(order.id, e.target.value as OrderStatus)}
                    className="border border-gray-200 text-xs px-2 py-1.5 outline-none focus:border-gray-400 bg-white"
                  >
                    {validOptionsFor(order.status).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Artículos</p>
                      <div className="space-y-2 bg-white border border-gray-100 p-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <span className="text-gray-400 text-xs ml-2">× {item.qty}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & shipping */}
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Datos del pedido</p>
                      <div className="space-y-2 text-sm">
                        {[
                          ['Cliente', order.customerName],
                          ['Correo', order.customerEmail],
                          ['Ciudad', order.city],
                          ['Dirección', order.address],
                          ['Fecha', order.date],
                        ].map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <span className="text-gray-400 w-20 flex-shrink-0">{k}</span>
                            <span className="text-gray-800 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status history hint */}
                      <div className="mt-4">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cambiar estado</p>
                        <div className="flex gap-1 flex-wrap">
                          {validOptionsFor(order.status).map(s => (
                            <button key={s} onClick={() => applyStatus(order.id, s)}
                              className={`text-xs px-2.5 py-1.5 border font-medium transition-colors ${
                                order.status === s
                                  ? `${STATUS_COLORS[s]} font-bold`
                                  : 'border-gray-200 text-gray-400 hover:border-gray-400'
                              }`}>
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 px-4 py-16 text-center text-sm text-gray-400">
            No hay pedidos con estos filtros
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          {filtered.length} de {orders.length} pedidos
        </p>
      )}
    </div>
  );
}
