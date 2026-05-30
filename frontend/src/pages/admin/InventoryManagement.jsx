import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, AlertOctagon, TrendingUp, AlertTriangle } from 'lucide-react';

const InventoryManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockChanges, setStockChanges] = useState({}); // productId -> stockVal

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        
        // Populate initial local stock states
        const initialChanges = {};
        data.forEach(p => {
          initialChanges[p._id] = p.stock;
        });
        setStockChanges(initialChanges);
      }
    } catch (err) {
      console.error('Error fetching inventory products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockInputChange = (productId, val) => {
    setStockChanges(prev => ({
      ...prev,
      [productId]: Math.max(0, parseInt(val) || 0)
    }));
  };

  const handleUpdateStock = async (product) => {
    const newStock = stockChanges[product._id];

    if (newStock === undefined || newStock === product.stock) return;

    try {
      const res = await fetch(`/api/products/₹{product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          // Send all original details + modified stock
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          category: product.category,
          stock: newStock
        })
      });

      if (res.ok) {
        alert(`Stock updated successfully for ₹{product.name}!`);
        fetchProducts();
      } else {
        alert('Failed to update stock.');
      }
    } catch (err) {
      console.error('Error updating stock level:', err);
    }
  };

  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory & Stock</h1>
          <p className="text-sm text-slate-500">Monitor warehouse supply and update item availability details.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Grid of Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Healthy Stock</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{products.length - outOfStockCount - lowStockCount} items</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alert</span>
            <span className="text-2xl font-extrabold text-amber-600 block">{lowStockCount} items</span>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
            <span className="text-2xl font-extrabold text-rose-600 block">{outOfStockCount} items</span>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-header">Product</th>
                <th className="table-header">Category</th>
                <th className="table-header">Current Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header">Adjust Stock</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {products.map((p) => {
                const currentChange = stockChanges[p._id] !== undefined ? stockChanges[p._id] : p.stock;
                const hasModified = currentChange !== p.stock;

                return (
                  <tr key={p._id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center space-x-2.5">
                        <img src={p.image} alt={p.name} className="h-8 w-8 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-cell uppercase font-medium tracking-wider text-slate-400">{p.category}</td>
                    <td className="table-cell font-bold text-slate-800">{p.stock} units</td>
                    <td className="table-cell">
                      {p.stock === 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Out of Stock</span>
                      ) : p.stock <= 10 ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Low Stock</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Healthy</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <input
                        type="number"
                        min="0"
                        value={currentChange}
                        onChange={(e) => handleStockInputChange(p._id, e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500 font-semibold"
                      />
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleUpdateStock(p)}
                        disabled={!hasModified}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                          hasModified 
                            ? 'bg-brand-600 text-white hover:bg-brand-500 cursor-pointer shadow-md' 
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                        }`}
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default InventoryManagement;
