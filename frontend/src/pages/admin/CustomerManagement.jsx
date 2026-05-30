import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Trash2, ArrowLeft, Award, UserCheck } from 'lucide-react';

const CustomerManagement = ({ setPage }) => {
  const { user: currentUser, getAuthHeader } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    const message = `Are you sure you want to change role of "${user.name}" to ${newRole.toUpperCase()}?`;
    
    if (!window.confirm(message)) return;

    try {
      const res = await fetch(`/api/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        alert('User role updated successfully!');
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(`Failed: ${errData.message}`);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user account "${user.name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (res.ok) {
        alert('User account deleted successfully!');
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(`Failed: ${errData.message}`);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Customers</h1>
          <p className="text-sm text-slate-500">List registered user profiles, toggle permissions, or delete accounts.</p>
        </div>
        
        <button
          onClick={() => setPage('admin-dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="responsive-table-container">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-header">Name</th>
                <th className="table-header">Email Address</th>
                <th className="table-header">User Role</th>
                <th className="table-header">Registered</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                
                return (
                  <tr key={u._id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{u.name} {isSelf && <span className="text-[10px] text-slate-400 font-semibold">(You)</span>}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-slate-500 font-semibold">{u.email}</td>
                    <td className="table-cell">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                          <Award className="h-3.5 w-3.5 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-slate-400 font-semibold">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Toggle Role Button */}
                        <button
                          onClick={() => handleRoleToggle(u)}
                          disabled={isSelf}
                          title="Toggle Admin/Customer status"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSelf 
                              ? 'text-slate-200 border-slate-100 cursor-not-allowed' 
                              : 'text-slate-400 border-transparent hover:border-slate-200 hover:text-brand-600 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={isSelf}
                          title="Delete user account"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSelf 
                              ? 'text-slate-200 border-slate-100 cursor-not-allowed' 
                              : 'text-slate-400 border-transparent hover:border-slate-200 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export default CustomerManagement;
