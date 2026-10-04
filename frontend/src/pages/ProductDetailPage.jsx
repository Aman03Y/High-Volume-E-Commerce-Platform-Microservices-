import React, { useState } from 'react';
import { ShoppingCart, Zap, ArrowLeft, Star, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage = ({ product, onBack, onRequireAuth }) => {
  const { addToCart, setIsCartOpen, setCheckoutStep, clearCart } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const stockCount = product.stock || 0;
  const isOutOfStock = stockCount <= 0;

  // Split comma-separated URLs or fallback to a default image
  const rawImages = product.imageUrl ? product.imageUrl.split(',') : [];
  const images = rawImages.length > 0 && rawImages[0].trim() !== '' 
    ? rawImages 
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      addToast('Please login or signup to continue', 'info');
      return;
    }
    addToCart(product, quantity);
    addToast(`Added ${quantity}x "${product.name}" to cart`, 'success', 2500);
  };

  const handleInstantBuy = () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      addToast('Please login or signup to continue', 'info');
      return;
    }
    clearCart();
    addToCart(product, quantity);
    setCheckoutStep('address');
    setIsCartOpen(true);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb / Back */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Side: Image Gallery */}
        <div className="w-full lg:w-1/2">
          {/* Main Image Slider with Zoom on Hover */}
          <div className="relative overflow-hidden aspect-square bg-white border border-gray-100 group">
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="w-full h-full flex-shrink-0 relative cursor-zoom-in p-6 sm:p-12"
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={img}
                    alt={`${product.name} - View ${idx + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[2]"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Out of stock badge over image */}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider z-10">
                Out of Stock
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImageIndex(idx)} 
                  className={`w-20 h-20 flex-shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start">
          <div className="mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {product.category || 'General'}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter uppercase leading-[1.1] mb-6">
            {product.name}
          </h1>

          <div className="text-3xl font-black text-black tracking-tighter mb-6">
            ₹{parseFloat(product.price || 0).toFixed(2)}
          </div>

          {/* Description (Moved below price) */}
          <div className="text-sm text-gray-600 font-medium leading-relaxed mb-8 max-w-xl">
            {product.description || 'Experience premium build quality engineered for optimal performance. Elevate your everyday with materials designed for durability and a clean, minimalist aesthetic.'}
          </div>

          {/* Quantity Selector */}
          <div className="mb-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Quantity</span>
            <div className="inline-flex items-center border-2 border-black">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors font-bold text-xl"
              >
                -
              </button>
              <div className="w-16 h-12 flex items-center justify-center font-black text-lg border-x-2 border-black">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 mb-10 max-w-xl">
            {isOutOfStock ? (
              <div className="w-full py-5 px-6 bg-gray-200 text-black font-black uppercase tracking-wider text-center line-through cursor-not-allowed border-2 border-transparent">
                Sold Out
              </div>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-5 px-6 bg-black text-white hover:bg-gray-900 border-2 border-black font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleInstantBuy}
                  className="w-full py-5 px-6 bg-white text-black border-2 border-black hover:bg-gray-100 font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3"
                >
                  Buy it Now
                </button>
              </>
            )}
          </div>

          <div className="border-t-2 border-gray-100 pt-8 space-y-6 max-w-xl">
            <div className="flex items-start gap-4">
              <Truck className="w-6 h-6 text-black flex-shrink-0" />
              <div>
                <h4 className="font-bold text-black text-sm uppercase tracking-wider">Free Delivery</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium">Get free standard shipping on orders over ₹100.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-black flex-shrink-0" />
              <div>
                <h4 className="font-bold text-black text-sm uppercase tracking-wider">Secure Checkout</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium">Your payment information is processed securely.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
