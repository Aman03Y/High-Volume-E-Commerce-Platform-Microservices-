import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Zap, Sparkles, MapPin, CreditCard, Wallet, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { handleApiCall } from '../api/client';
import { useLog } from '../context/LogContext';
import { useToast } from './Toast';

export const CartDrawer = ({ onOrderCompleted }) => {
  const { cartItems, isCartOpen, setIsCartOpen, checkoutStep, setCheckoutStep, updateQuantity, removeFromCart, clearCart, cartSubtotal, totalItemsCount } = useCart();
  const { addLog } = useLog();
  const { addToast } = useToast();
  
  // Checkout flow states
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Cart states
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  
  // Address states
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '742 Evergreen Terrace, Sector 4',
    city: 'Springfield',
    zipCode: '12345'
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'AMANY20' || code === 'ECOM20') {
      setDiscountPercent(20);
      addToast('Promo code applied: 20% OFF discount activated!', 'success');
    } else {
      addToast('Invalid coupon. Try "AMANY20"', 'warning');
    }
  };

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const shipping = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 9.99;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shipping);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);

    try {
      // Process orders for all items
      for (const item of cartItems) {
        const payload = {
          customerId: 101, // Mock customer ID
          productId: item.id,
          quantity: item.quantity,
          totalPrice: parseFloat(item.price || 0) * item.quantity,
          name: addressData.fullName,
          address: `${addressData.addressLine1}, ${addressData.city}, ${addressData.zipCode}`,
          phoneNumber: addressData.phone,
          paymentMethod: paymentMethod
        };
        await handleApiCall('order-service', 'post', '/api/orders', payload, addLog);
      }

      addToast(`Order placed successfully for ${totalItemsCount} item(s)! (₹${grandTotal.toFixed(2)})`, 'success');
      clearCart();
      setCheckoutStep('cart');
      setIsCartOpen(false);
      if (onOrderCompleted) onOrderCompleted();
    } catch (e) {
      addToast('Checkout encountered an issue, please try again.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const resetAndClose = () => {
    setIsCartOpen(false);
    setTimeout(() => setCheckoutStep('cart'), 300);
  };

  const renderCartStep = () => (
    <>
      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">Your shopping bag is empty</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Browse our catalog and add premium electronics or gear to your bag.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-900 text-xs truncate">{item.name}</h5>
                  <div className="text-blue-600 font-extrabold text-xs mt-0.5">
                    ₹{parseFloat(item.price || 0).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs transition-colors rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-xs text-slate-800 bg-white py-0.5">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs transition-colors rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md text-xs transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-900 text-xs font-mono">
                  ₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout & Summary Footer */}
      {cartItems.length > 0 && (
        <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-4 animate-fade-in">
          {/* Promo input */}
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              placeholder="Promo Code (AMANY20)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3.5 py-1.5 text-xs uppercase font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold shadow-2xs"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Apply
            </button>
          </form>

          {/* Price Calculation */}
          <div className="space-y-1.5 text-xs text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 font-bold">₹{cartSubtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-mono font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-mono text-slate-900 font-bold">
                {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-base text-blue-600 font-mono font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => setCheckoutStep('address')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );

  const renderAddressStep = () => (
    <div className="flex-1 flex flex-col h-full bg-slate-50 animate-fade-in">
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Shipping Address</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={addressData.fullName}
                onChange={(e) => setAddressData({...addressData, fullName: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={addressData.phone}
                onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Address Line 1</label>
              <input
                type="text"
                placeholder="House/Flat No., Street Name"
                value={addressData.addressLine1}
                onChange={(e) => setAddressData({...addressData, addressLine1: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={addressData.city}
                  onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
              <div className="w-1/3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">ZIP Code</label>
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={addressData.zipCode}
                  onChange={(e) => setAddressData({...addressData, zipCode: e.target.value})}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 border-t border-slate-200 bg-white">
        <button
          onClick={() => setCheckoutStep('payment')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Continue to Payment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="flex-1 flex flex-col h-full bg-slate-50 animate-fade-in">
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                Select Payment Method
              </h4>
            </div>
            
            <div className="p-2">
              {/* Card Option */}
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'card' ? 'bg-blue-50/50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}>
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-blue-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    Credit / Debit Card
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <input type="text" placeholder="Card Number (0000 0000 0000 0000)" className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" />
                      <div className="flex gap-2">
                        <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" />
                        <input type="text" placeholder="CVV" className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* UPI Option */}
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'upi' ? 'bg-blue-50/50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}>
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'upi' ? 'border-blue-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="sr-only" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <Zap className="w-4 h-4 text-slate-500" />
                    UPI / QR Code
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-2 text-[11px] text-slate-500 animate-fade-in">
                      Pay using Google Pay, PhonePe, Paytm, or any other UPI app.
                      <input type="text" placeholder="Enter UPI ID (e.g. name@okhdfcbank)" className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" />
                    </div>
                  )}
                </div>
              </label>

              {/* COD Option */}
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'cod' ? 'bg-blue-50/50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}>
                <div className="mt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-blue-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    Cash on Delivery
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="mt-1 text-[11px] text-slate-500 animate-fade-in">
                      Pay with cash when your order is delivered.
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          
          <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200/60">
            <div className="flex justify-between items-center text-sm font-bold text-slate-700">
              <span>Amount to Pay</span>
              <span className="text-lg text-slate-900 font-mono font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 border-t border-slate-200 bg-white">
        <button
          disabled={checkingOut}
          onClick={handleCheckout}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {checkingOut ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Place Order • ₹{grandTotal.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={resetAndClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              {checkoutStep !== 'cart' && (
                <button 
                  onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'address' : 'cart')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              {checkoutStep === 'cart' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {checkoutStep === 'cart' ? `Shopping Bag (${totalItemsCount})` : checkoutStep === 'address' ? 'Shipping details' : 'Payment'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {checkoutStep === 'cart' ? 'Free shipping on orders over ₹100' : 'Secure checkout process'}
                </span>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {checkoutStep !== 'cart' && (
            <div className="h-1 w-full bg-slate-100">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                style={{ width: checkoutStep === 'address' ? '50%' : '100%' }}
              />
            </div>
          )}

          {/* Dynamic Content based on Step */}
          {checkoutStep === 'cart' && renderCartStep()}
          {checkoutStep === 'address' && renderAddressStep()}
          {checkoutStep === 'payment' && renderPaymentStep()}
          
        </div>
      </div>
    </div>
  );
};

