import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, Star, X } from 'lucide-react';

const Products = ({ setPage, setSelectedProductId, filterCategory, setFilterCategory }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load Categories on Boot
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on Filter variables
  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('keyword', searchTerm);
      if (filterCategory && filterCategory !== 'All') params.append('category', filterCategory);
      if (minPrice > 0) params.append('minPrice', minPrice);
      if (maxPrice < 400) params.append('maxPrice', maxPrice);
      if (minRating > 0) params.append('minRating', minRating);
      if (sortOption) params.append('sort', sortOption);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce product fetches slightly for typed text search inputs
    const delayDebounce = setTimeout(() => {
      fetchFilteredProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterCategory, minPrice, maxPrice, minRating, sortOption]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('All');
    setMinPrice(0);
    setMaxPrice(400);
    setMinRating(0);
    setSortOption('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR: Desktop Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border border-slate-100 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Filter Options</h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-brand-600 font-medium hover:underline cursor-pointer outline-none"
            >
              Reset All
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setFilterCategory('All')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-colors outline-none cursor-pointer ${
                  filterCategory === 'All'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setFilterCategory(cat.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-colors outline-none cursor-pointer ${
                    filterCategory === cat.slug
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price Range</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="400"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>₹0</span>
                <span className="text-brand-600">Under ₹{maxPrice}</span>
                <span>₹400+</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Rating */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</h4>
            <div className="flex flex-col space-y-2">
              {[0, 4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`flex items-center space-x-2 text-sm py-1 px-2.5 rounded-lg transition-colors outline-none cursor-pointer ${
                    minRating === stars
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < (stars || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {stars === 0 ? '& Up' : 'Stars & Up'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN BODY: Grid and Header */}
        <div className="flex-1 space-y-6">
          {/* Top Actions: Search and Sorting */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 py-2.5"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle & Sort Select */}
            <div className="flex items-center space-x-3 self-end md:self-auto">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all duration-200 cursor-pointer outline-none"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
                <span>Filters</span>
              </button>

              <div className="relative flex items-center space-x-1.5">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Category Header */}
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
            {filterCategory !== 'All' && (
              <span className="font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full text-xs">
                Category: {filterCategory}
              </span>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-slate-200 aspect-square rounded-2xl w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  setPage={setPage}
                  setSelectedProductId={setSelectedProductId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <SlidersHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 text-lg">No Products Found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
                Try widening your price range or adjusting your query terms.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 btn-primary py-2 px-5 text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER: Mobile Filters Drawer Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop Mask */}
          <div 
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
          />

          {/* Sliding Filter Panel */}
          <div className="relative ml-auto max-w-xs w-full h-full bg-white shadow-2xl p-6 flex flex-col space-y-6 z-10 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('All')}
                  className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors cursor-pointer outline-none ${
                    filterCategory === 'All'
                      ? 'bg-brand-50 border-brand-200 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setFilterCategory(cat.slug)}
                    className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors cursor-pointer outline-none ${
                      filterCategory === cat.slug
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price Range</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>₹0</span>
                  <span className="text-brand-600">Under ₹{maxPrice}</span>
                  <span>₹400</span>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</h4>
              <div className="flex flex-col space-y-2">
                {[0, 4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(stars)}
                    className={`flex items-center space-x-2 text-sm py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer outline-none ${
                      minRating === stars
                        ? 'bg-brand-50 border-brand-200 text-brand-700 font-semibold'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (stars || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {stars === 0 ? '& Up' : 'Stars & Up'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center space-x-3">
              <button 
                onClick={handleClearFilters}
                className="flex-1 btn-secondary py-2 text-sm text-center"
              >
                Clear
              </button>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 btn-primary py-2 text-sm text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
