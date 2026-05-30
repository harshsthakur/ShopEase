import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, ArrowLeft, MessageSquarePlus, Calendar } from 'lucide-react';

const ProductDetails = ({ productId, setPage, setSelectedProductId }) => {
  const { user, addToWishlist, removeFromWishlist, getAuthHeader } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        alert('Product not found.');
        setPage('products');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please log in to manage your wishlist!');
      setPage('login');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      setPage('login');
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/products/₹{product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setComment('');
      setRating(5);
      alert('Review submitted successfully!');
      fetchProductDetails(); // reload details
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => setPage('products')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold cursor-pointer outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-slate-100 p-6 md:p-10 rounded-3xl shadow-sm">
        
        {/* Left Col: Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hover:border-brand-500 transition-all cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center opacity-70 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Reviews Count */}
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-slate-400">
                ({product.numReviews || 0} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="flex items-baseline space-x-4">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{product.price?.toFixed(2)}
            </span>
            
            {/* Stock indicator */}
            <div>
              {product.stock > 10 ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  In Stock ({product.stock} left)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  Only {product.stock} items left!
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  Out Of Stock
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Ingredients & Weight Details */}
          {(product.weight || product.ingredients) && (
            <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-4 space-y-2.5 text-xs">
              {product.weight && (
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider w-24 flex-shrink-0">Net Weight</span>
                  <span className="text-slate-700 font-semibold">{product.weight}</span>
                </div>
              )}
              {product.ingredients && (
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider w-24 flex-shrink-0">Ingredients</span>
                  <span className="text-slate-600 font-medium leading-relaxed">{product.ingredients}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Health Recommendations Integration */}
          {(() => {
            const getWellnessBadges = () => {
              switch (product.category) {
                case 'amla':
                  return {
                    recommended: ['Immunity', 'Digestion', 'Energy'],
                    benefits: ['Rich in Vitamin C', 'Antioxidants', 'Natural Ingredients']
                  };
                case 'mango':
                  return {
                    recommended: ['Energy', 'Digestion', 'Healthy Snacking'],
                    benefits: ['Rich in Vitamin A', 'Natural Enzymes', 'Fast Energy Boost']
                  };
                case 'modak':
                  return {
                    recommended: ['Energy', 'Healthy Snacking', 'Festival Gifting'],
                    benefits: ['Gluten Free', 'Natural Sweeteners', 'Traditional Recipe']
                  };
                case 'fruit-jam':
                  return {
                    recommended: ['Healthy Snacking', "Children's Nutrition", 'Quick Energy'],
                    benefits: ['Pure Fruit Extract', 'Rich in Antioxidants', 'Fiber Boost']
                  };
                default:
                  return {
                    recommended: ['Immunity', 'Digestion', 'Energy'],
                    benefits: ['Rich in Vitamin C', 'Antioxidants', 'Natural Ingredients']
                  };
              }
            };

            const wellnessData = getWellnessBadges();

            return (
              <div className="border-t border-b border-slate-100 py-5 grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Recommended For</span>
                  <div className="space-y-1.5 text-slate-650 font-medium">
                    {wellnessData.recommended.map((rec, idx) => (
                      <div key={idx} className="flex items-center text-emerald-650 bg-emerald-50/40 border border-emerald-100/30 px-2.5 py-1 rounded-xl w-fit">
                        <span className="mr-1.5 text-emerald-500 font-bold text-[13px]">✓</span> {rec}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Health Benefits</span>
                  <div className="space-y-1.5 text-slate-650 font-medium">
                    {wellnessData.benefits.map((ben, idx) => (
                      <div key={idx} className="flex items-center text-brand-650 bg-brand-50/40 border border-brand-100/30 px-2.5 py-1 rounded-xl w-fit">
                        <span className="mr-1.5 text-brand-500 font-bold text-[13px]">✓</span> {ben}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Add to Cart Actions */}
          <div className="flex items-center space-x-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-200 rounded-xl px-2">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={product.stock === 0}
                className="p-2.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="px-4 font-semibold text-slate-800 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                disabled={product.stock === 0}
                className="p-2.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Main Add Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:bg-slate-100 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleWishlistToggle}
              className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-rose-500 transition-all cursor-pointer outline-none"
            >
              <Heart className={`h-5.5 w-5.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Review Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-slate-100 pt-12">
        
        {/* Reviews Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            Customer Reviews ({product.reviews?.length || 0})
          </h2>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev._id} className="bg-white border border-slate-50 p-5 rounded-2xl shadow-sm space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800 text-sm">{rev.name}</h4>
                      {/* Review stars */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-50 p-10 rounded-2xl shadow-sm text-center">
              <span className="text-slate-300 font-bold block text-2xl">No Reviews Yet</span>
              <p className="text-slate-400 text-sm mt-1">Be the first to review this product!</p>
            </div>
          )}
        </div>

        {/* Submit Review Column */}
        <div>
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center">
              <MessageSquarePlus className="h-4.5 w-4.5 mr-2 text-brand-600" />
              Write a Review
            </h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Rating Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 font-semibold"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                {/* Comment Text */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comment</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your experience with this item..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-brand-500 outline-none resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg border border-rose-100 font-medium">
                    {reviewError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full btn-primary py-2 text-sm"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>

              </form>
            ) : (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 mb-4">Please sign in to leave reviews.</p>
                <button
                  onClick={() => setPage('login')}
                  className="btn-secondary py-1.5 px-4 text-xs font-bold"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
