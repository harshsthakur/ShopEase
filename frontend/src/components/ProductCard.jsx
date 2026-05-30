import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, setPage, setSelectedProductId }) => {
  const { user, addToWishlist, removeFromWishlist } = useAuth();
  const { addToCart } = useCart();

  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to your wishlist!');
      setPage('login');
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleViewDetails = () => {
    setSelectedProductId(product._id);
    setPage('product-details');
  };

  return (
    <div 
      onClick={handleViewDetails}
      className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col cursor-pointer h-full"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Floating Action Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {/* Wishlist Toggle Button */}
          <button
            onClick={handleWishlistToggle}
            className="p-2 rounded-full glass hover:bg-white shadow-md hover:text-rose-500 transition-colors duration-200"
          >
            <Heart 
              className={`h-4.5 w-4.5 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
              }`} 
            />
          </button>
        </div>

        {/* Out of Stock Mask */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-950 text-white font-semibold text-xs tracking-wider uppercase px-3 py-1.5 rounded-lg">
              Out Of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Content Section */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category Tag */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Star Rating Info */}
          <div className="flex items-center space-x-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Cart controls */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-base">
            ₹{product.price?.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
