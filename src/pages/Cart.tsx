import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/products';
import { LOYALTY_MILESTONE_ORDER_NUMBER, LOYALTY_DISCOUNT_RATE, countValidPurchases } from '../services/orders.service';
import ProductCard from '../components/ProductCard';
import FreeShippingBar from '../components/FreeShippingBar';
import LoyaltyBanner from '../components/LoyaltyBanner';
import { Plus, Minus, Trash, ChevronRight } from '../components/Icons';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, products, orders, removeFromCart, updateQty, cartTotal } = useStore();

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9000;
  const isLoyaltyMilestone = countValidPurchases(orders) + 1 === LOYALTY_MILESTONE_ORDER_NUMBER;
  const discount = isLoyaltyMilestone ? Math.round(cartTotal * LOYALTY_DISCOUNT_RATE) : 0;
  const total = cartTotal + shipping - discount;
  const suggested = products.filter(p => !cart.find(i => i.product.id === p.id)).slice(0, 4);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 border border-gray-200 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Carrito vacío</h2>
          <p className="text-sm text-gray-400 mb-6">Agrega productos para comenzar tu compra</p>
          <button onClick={() => navigate('/home')} className="bg-[#C84B11] text-white font-semibold px-8 py-2.5 text-sm hover:bg-[#a83a0d] transition-colors">
            Explorar catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <button onClick={() => navigate('/home')} className="hover:text-gray-700">Inicio</button>
        <ChevronRight size={12} />
        <span className="text-gray-700 font-medium">Carrito</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Mi carrito
        <span className="text-base text-gray-400 font-normal ml-2">
          ({cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'producto' : 'productos'})
        </span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Producto</th>
                <th className="text-center pb-3 font-medium">Cantidad</th>
                <th className="text-right pb-3 font-medium">Total</th>
                <th className="pb-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cart.map(({ product, quantity }) => (
                <tr key={product.id}>
                  <td className="py-5">
                    <div className="flex gap-4 items-start">
                      <img
                        src={product.image} alt={product.name}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-20 h-20 object-cover bg-gray-50 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                      />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatPrice(product.price)} c/u</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center justify-center border border-gray-200 w-fit mx-auto">
                      <button onClick={() => updateQty(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-200 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => updateQty(product.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-l border-gray-200 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(product.price * quantity)}</p>
                  </td>
                  <td className="py-5 pl-4">
                    <button onClick={() => removeFromCart(product.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <FreeShippingBar cartTotal={cartTotal} />
          <LoyaltyBanner orders={orders} />

          {/* Totals */}
          <div className="border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Resumen del pedido</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                  {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Descuento fidelidad (10ª compra)</span>
                  <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatPrice(total)}</span>
              </div>
            </div>
            {/* Quick pay */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 text-sm transition-colors flex items-center justify-center gap-2.5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              Pago rápido — {formatPrice(total)}
            </button>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-2 border border-gray-200 text-gray-700 font-semibold py-2.5 text-sm hover:border-gray-400 transition-colors"
            >
              Ir al checkout
            </button>
            <button onClick={() => navigate('/home')} className="w-full mt-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors py-1.5">
              Continuar comprando
            </button>
          </div>
        </div>
      </div>

      {/* Suggested */}
      {suggested.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            También te puede interesar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
            {suggested.map(p => (
              <div key={p.id} className="bg-white">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
