import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, ArrowLeft, Upload } from 'lucide-react';

const ProductManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // if editing, holds product object

  // Form Field States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [weight, setWeight] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const prodRes = await fetch('/api/products');
      const prodData = prodRes.ok ? await prodRes.json() : [];
      setProducts(prodData);

      const catRes = await fetch('/api/categories');
      const catData = catRes.ok ? await catRes.json() : [];
      setCategories(catData);
      if (catData.length > 0) setCategory(catData[0].slug);
    } catch (err) {
      console.error('Error fetching management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'); // nice generic default placeholder
    if (categories.length > 0) setCategory(categories[0].slug);
    setStock('');
    setIngredients('');
    setWeight('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setImage(product.image);
    setCategory(product.category);
    setStock(product.stock);
    setIngredients(product.ingredients || '');
    setWeight(product.weight || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setUploading(true);

      try {
        const res = await fetch('/api/products/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ image: base64Data })
        });

        const data = await res.json();
        if (res.ok) {
          setImage(data.imageUrl);
        } else {
          alert(`Upload failed: ${data.message}`);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('An error occurred during file upload.');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !image || !category || stock === '') {
      alert('Please fill in all product fields.');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      image,
      category,
      stock: Number(stock),
      ingredients,
      weight
    };

    try {
      let res;
      if (editProduct) {
        // Edit Mode -> PUT
        res = await fetch(`/api/products/${editProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Add Mode -> POST
        res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setIsModalOpen(false);
        fetchProductsAndCategories();
      } else {
        const errorData = await res.json();
        alert(`Save failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert('Product deleted successfully!');
        fetchProductsAndCategories();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Products</h1>
          <p className="text-sm text-slate-500">Add, update, or remove e-commerce catalog listings.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setPage('admin-dashboard')}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Datatable */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-header">Image</th>
                <th className="table-header">Title</th>
                <th className="table-header">Category</th>
                <th className="table-header">Price</th>
                <th className="table-header">Inventory</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="table-cell">
                    <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded-lg border border-slate-100" />
                  </td>
                  <td className="table-cell font-bold text-slate-800">{p.name}</td>
                  <td className="table-cell font-medium uppercase text-xs tracking-wider text-slate-400">{p.category}</td>
                  <td className="table-cell font-bold text-slate-900">${p.price?.toFixed(2)}</td>
                  <td className="table-cell">
                    {p.stock === 0 ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Out of Stock</span>
                    ) : p.stock <= 10 ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Low Stock ({p.stock})</span>
                    ) : (
                      <span className="text-slate-600 font-semibold">{p.stock} units</span>
                    )}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD MODAL: Add / Edit form overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
          />

          {/* Form Content container */}
          <div className="relative bg-white w-full max-w-lg mx-4 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-3 mb-6">
              {editProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ShopEase Smartwatch Elite"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-2 px-3"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field py-2 px-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="input-field py-2 px-3"
                  />
                </div>
              </div>

              {/* Image URL & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-brand-500 font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image</label>
                  <div className="flex items-center space-x-2">
                    {/* Thumbnail Preview */}
                    <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {image ? (
                        <img src={image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload className="h-4 w-4 text-slate-300" />
                      )}
                    </div>

                    {/* Text Input + Upload Button */}
                    <div className="flex-1 flex space-x-1.5">
                      <input
                        type="text"
                        required
                        placeholder="https://... or upload"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="input-field py-2 px-3 text-xs flex-1 min-w-0"
                      />
                      
                      <input
                        type="file"
                        id="modal-image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="modal-image-upload"
                        className="btn-secondary py-2 px-2.5 text-[10px] font-bold flex items-center space-x-1 cursor-pointer hover:bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploading ? '...' : 'Upload'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingredients</label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh Strawberries, Sugar, Pectin"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="input-field py-2 px-3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weight / Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 340g or 500ml"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-field py-2 px-3"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Summarize product features and specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 outline-none resize-none font-medium text-xs leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-semibold"
                >
                  {editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
