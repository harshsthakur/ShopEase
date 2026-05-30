import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';

const Wishlist = ({ setPage, setSelectedProductId }) => {
  const { user, removeFromWishlist } = useAuth();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        // Filter products that exist in user's wishlist
        const userWishlist = user?.wishlist || [];
        const filtered = data.filter(product => userWishlist.includes(product._id));
        setWishlistProducts(filtered);
      }
    } catch (err) {
      console.error('Error fetching products for wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, [user?.wishlist]);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleViewDetails = (id) => {
    setSelectedProductId(id);
    setPage('product-details');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-800">Your Wishlist is Empty</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Bookmark items you love to keep track of them here!
          </p>
        </div>
        <button
          onClick={() => setPage('products')}
          className="btn-primary w-full py-2.5"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <div 
            key={product._id}
            className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Image Box */}
            <div 
              onClick={() => handleViewDetails(product._id)}
              className="relative aspect-square w-full overflow-hidden bg-slate-50 border-b border-slate-50"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              
              {/* Floating Trash bin */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(product._id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-rose-50 hover:text-rose-500 text-slate-500 shadow-md transition-colors"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                <h3 
                  onClick={() => handleViewDetails(product._id)}
                  className="font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-brand-600 transition-colors line-clamp-1"
                >
                  {product.name}
                </h3>
                <span className="font-bold text-slate-900 text-sm block">
                  ₹{product.price?.toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock === 0}
                className="w-full py-2 px-3 border border-brand-200 text-brand-600 bg-brand-50/50 hover:bg-brand-600 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
