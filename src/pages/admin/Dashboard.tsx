import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { formatPrice } from '../../data/products';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VALUES, type OrderStatus } from '../../services/orders.service';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_LABELS = ORDER_STATUS_LABELS;
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMADO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  EMPACADO: 'bg-amber-100 text-amber-700 border-amber-200',
  ENVIADO: 'bg-purple-100 text-purple-700 border-purple-200',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-200',
  CANCELADO: 'bg-red-100 text-red-600 border-red-200',
};
const PIE_COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444'];

// Last 7 days labels
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('es-CO', { weekday: 'short' }),
      date: d.toISOString().slice(0, 10),
    };
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, customers, products } = useAdmin();
  const [chartRange] = useState<'week' | 'month'>('week');

  const today = new Date().toISOString().slice(0, 10);
  const days = last7Days();

  // Revenue chart data from real orders
  const chartData = days.map(({ label, date }) => {
    const dayOrders = orders.filter(o => o.date === date && o.status !== 'CANCELADO');
    return {
      day: label,
      ventas: dayOrders.reduce((s, o) => s + o.total, 0),
      pedidos: dayOrders.length,
    };
  });

  const totalRevenue = orders.filter(o => o.status !== 'CANCELADO').reduce((s, o) => s + o.total, 0);
  const todayOrders = orders.filter(o => o.date === today).length;
  const pendingOrders = orders.filter(o => o.status === 'PENDIENTE' || o.status === 'CONFIRMADO' || o.status === 'EMPACADO');
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0).length;

  // Order status breakdown for pie
  const statusCounts = ORDER_STATUS_VALUES.map(s => ({
    name: STATUS_LABELS[s],
    value: orders.filter(o => o.status === s).length,
  })).filter(s => s.value > 0);

  // Top products by revenue
  const productRevenue: Record<string, { name: string; revenue: number; qty: number }> = {};
  orders.filter(o => o.status !== 'CANCELADO').forEach(o =>
    o.items.forEach(item => {
      if (!productRevenue[item.productId]) productRevenue[item.productId] = { name: item.name, revenue: 0, qty: 0 };
      productRevenue[item.productId].revenue += item.price * item.qty;
      productRevenue[item.productId].qty += item.qty;
    })
  );
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const metrics = [
    {
      label: 'Ingresos totales', value: formatPrice(totalRevenue),
      sub: `${orders.filter(o => o.status === 'ENTREGADO').length} pedidos entregados`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Pedidos hoy', value: String(todayOrders),
      sub: `${orders.length} total · ${pendingOrders.length} pendientes`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Productos activos', value: String(products.filter(p => p.stock > 0).length),
      sub: `${outOfStock} sin stock · ${lowStockProducts.length} stock bajo`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      color: outOfStock > 0 ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Clientes registrados', value: String(customers.length),
      sub: `${customers.filter(c => c.totalOrders > 0).length} con compras realizadas`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de actividad de la tienda</p>
        </div>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5">{today}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div className={`w-9 h-9 flex items-center justify-center mb-3 ${m.color}`}>
              {m.icon}
            </div>
            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{m.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts row */}
      {(pendingOrders.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingOrders.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-xs font-bold text-amber-800">{pendingOrders.length} PEDIDO{pendingOrders.length !== 1 ? 'S' : ''} SIN PROCESAR</p>
                </div>
                <button onClick={() => navigate('/admin/orders')} className="text-xs text-amber-700 font-semibold hover:underline">Ver todos →</button>
              </div>
              <div className="space-y-1.5">
                {pendingOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-700">{o.id}</span>
                    <span className="text-amber-600">{o.customerName}</span>
                    <span className="font-semibold text-amber-800">{formatPrice(o.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-xs font-bold text-red-800">{lowStockProducts.length} PRODUCTO{lowStockProducts.length !== 1 ? 'S' : ''} CON STOCK BAJO</p>
                </div>
                <button onClick={() => navigate('/admin/products')} className="text-xs text-red-700 font-semibold hover:underline">Ver todos →</button>
              </div>
              <div className="space-y-1.5">
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="text-red-700 font-medium truncate max-w-[160px]">{p.name}</span>
                    <span className="font-bold text-red-800">Quedan {p.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue line chart */}
        <div className="bg-white border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Ventas — últimos 7 días</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Total: {formatPrice(chartData.reduce((s, d) => s + d.ventas, 0))}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? '$0' : `$${(v / 1000).toFixed(0)}k`} width={36} />
              <Tooltip
                formatter={(v) => [formatPrice(Number(v)), 'Ventas']}
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12, boxShadow: 'none' }}
                labelStyle={{ fontWeight: 700, color: '#111' }}
              />
              <Line type="monotone" dataKey="ventas" stroke="#C84B11" strokeWidth={2}
                dot={{ fill: '#C84B11', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#C84B11', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Estado de pedidos</h2>
          <p className="text-[11px] text-gray-400 mb-3">{orders.length} pedidos en total</p>
          {statusCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="45%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={2}>
                  {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [Number(v), 'pedidos']}
                  contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 11, boxShadow: 'none' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">Sin datos</div>
          )}
        </div>
      </div>

      {/* Bottom row: top products + recent orders */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Top products */}
        <div className="bg-white border border-gray-200 p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Productos más vendidos</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-gray-300 w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.qty} unidades</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice(p.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Sin ventas registradas</p>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-gray-200 lg:col-span-3">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Pedidos recientes</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-xs text-[#C84B11] font-semibold hover:underline">Ver todos →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {[...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{o.customerName}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{o.id} · {o.date}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 border ${STATUS_COLORS[o.status]}`}>
                  {STATUS_LABELS[o.status]}
                </span>
                <p className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice(o.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
