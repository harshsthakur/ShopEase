import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const CategoryManagement = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!name || !slug) {
      alert('Please fill in name and slug fields.');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ name, slug, description })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Category created successfully!');
        setName('');
        setSlug('');
        setDescription('');
        fetchCategories();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleDeleteCategory = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete category "${title}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert('Failed to delete category.');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Categories</h1>
          <p className="text-sm text-slate-500">Create, list, or delete product taxonomy classifications.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Col 1: Add Category Form */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-base">Add New Category</h3>
          
          <form onSubmit={handleCreateCategory} className="space-y-4 text-xs font-semibold text-slate-700">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Office Wear"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Auto slugify name inputs
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="input-field py-2 px-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Slug (URL-friendly)</label>
              <input
                type="text"
                required
                placeholder="e.g. office-wear"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input-field py-2 px-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
              <textarea
                rows="3"
                placeholder="Brief category context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 outline-none resize-none font-medium text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2 text-xs flex items-center justify-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Category</span>
            </button>

          </form>
        </div>

        {/* Col 2 & 3: Category List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Active Taxonomies</h3>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="responsive-table-container">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="table-header">Category Name</th>
                    <th className="table-header">Slug</th>
                    <th className="table-header">Description</th>
                    <th className="table-header text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td className="table-cell font-bold text-slate-800">{c.name}</td>
                      <td className="table-cell font-mono text-brand-700">{c.slug}</td>
                      <td className="table-cell font-medium text-slate-500 truncate max-w-[150px]">{c.description || '-'}</td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => handleDeleteCategory(c._id, c.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CategoryManagement;
